import { useRef, useState, useCallback, useEffect } from 'react'
import '@tensorflow/tfjs'
import * as faceDetection from '@tensorflow-models/face-detection'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { monitoringApi } from '../../apis/monitoringApi'
import { handleLogError } from '../../misc/Helpers'
import { useAuth } from '../context/AuthContext'
import { useChronometer } from '../context/ChronometerContext'

const EVENT_COOLDOWN_MS = 5000
const FACE_ABSENT_THRESHOLD_MS = 3000
const DETECTION_INTERVAL_MS = 1000

export const EVENT_META = {
  FACE_ABSENT:    { label: 'وجه غائب',    color: '#ef4444', bg: '#fef2f2' },
  PHONE_DETECTED: { label: 'هاتف مكتشف',  color: '#8b5cf6', bg: '#f5f3ff' },
}

export function useMonitoring() {
  const { getUser } = useAuth()
  const user = getUser()
  const { isRunning } = useChronometer()

  const [modelsLoaded, setModelsLoaded]   = useState(false)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [isActive, setIsActive]           = useState(false)
  const [currentAlert, setCurrentAlert]   = useState(null)
  const [eventCounts, setEventCounts]     = useState({})
  const [recentAlerts, setRecentAlerts]   = useState([])

  const videoRef             = useRef(null)
  const canvasRef            = useRef(null)
  const streamRef            = useRef(null)
  const detectionIntervalRef = useRef(null)
  const lastEventTimeRef     = useRef({})
  const faceAbsentSinceRef   = useRef(null)
  const sessionIdRef         = useRef(null)
  const audioCtxRef          = useRef(null)
  const faceModelRef         = useRef(null)
  const phoneModelRef        = useRef(null)

  useEffect(() => {
    loadModels()
    return () => {
      stopCamera()
      clearInterval(detectionIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Attach the camera stream to the video element once it appears in the DOM.
  // This runs AFTER the render triggered by setIsActive(true), so videoRef is guaranteed to exist.
  useEffect(() => {
    if (isActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [isActive])

  // Auto-stop camera whenever the chronometer stops, regardless of what triggered the stop.
  useEffect(() => {
    if (!isRunning && isActive) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
      stopCamera()
      sessionIdRef.current = null
      localStorage.removeItem('monitoringSessionId')
      localStorage.removeItem('monitoringDistractions')
      setIsActive(false)
      setCurrentAlert(null)
      setEventCounts({})
      setRecentAlerts([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  async function loadModels() {
    setModelsLoading(true)
    try {
      faceModelRef.current  = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
      )
      phoneModelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
      setModelsLoaded(true)
    } catch (err) {
      handleLogError(err)
    } finally {
      setModelsLoading(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const playAlert = useCallback(() => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.24)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch { /* ignore */ }
  }, [])

  const reportEvent = useCallback(async (eventType) => {
    const now = Date.now()
    if (now - (lastEventTimeRef.current[eventType] || 0) < EVENT_COOLDOWN_MS) return
    lastEventTimeRef.current[eventType] = now

    playAlert()
    setCurrentAlert(eventType)
    setTimeout(() => setCurrentAlert(null), 3000)
    setEventCounts(prev => {
      const next = { ...prev, [eventType]: (prev[eventType] || 0) + 1 }
      localStorage.setItem('monitoringDistractions', JSON.stringify(next))
      return next
    })
    setRecentAlerts(prev => [{ type: eventType, time: new Date() }, ...prev.slice(0, 4)])

    if (sessionIdRef.current) {
      try {
        await monitoringApi.reportEvent(user, sessionIdRef.current, eventType)
      } catch (err) {
        handleLogError(err)
      }
    }
  }, [user, playAlert])

  const runDetection = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || !faceModelRef.current || !phoneModelRef.current) return

    const [faces, objects] = await Promise.all([
      faceModelRef.current.estimateFaces(video),
      phoneModelRef.current.detect(video),
    ])

    if (objects.some(o => o.class === 'cell phone' && o.score > 0.45))
      reportEvent('PHONE_DETECTED')

    const canvas = canvasRef.current
    if (canvas) {
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const c = canvas.getContext('2d')
      c.clearRect(0, 0, canvas.width, canvas.height)
      c.lineWidth = 2
      faces.forEach(f => {
        c.strokeStyle = '#22c55e'
        c.strokeRect(f.box.xMin, f.box.yMin, f.box.width, f.box.height)
      })
    }

    if (faces.length === 0) {
      if (!faceAbsentSinceRef.current) faceAbsentSinceRef.current = Date.now()
      else if (Date.now() - faceAbsentSinceRef.current > FACE_ABSENT_THRESHOLD_MS)
        reportEvent('FACE_ABSENT')
      return
    }
    faceAbsentSinceRef.current = null
  }, [reportEvent])

  const startMonitoring = useCallback(async (monitoringSessionId) => {
    sessionIdRef.current = monitoringSessionId
    localStorage.setItem('monitoringSessionId', monitoringSessionId)
    lastEventTimeRef.current  = {}
    faceAbsentSinceRef.current = null

    const existingSessionId = localStorage.getItem('monitoringSessionId')
    if (existingSessionId === monitoringSessionId) {
      const saved = JSON.parse(localStorage.getItem('monitoringDistractions') || 'null')
      setEventCounts(saved || {})
    } else {
      setEventCounts({})
      localStorage.removeItem('monitoringDistractions')
    }
    setRecentAlerts([])
    setCurrentAlert(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      })
      streamRef.current = stream
      setIsActive(true) // renders the <video> element; the useEffect above then sets srcObject
      detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS)
    } catch (err) {
      handleLogError(err)
    }
  }, [runDetection])

  const stopMonitoring = useCallback(() => {
    clearInterval(detectionIntervalRef.current)
    detectionIntervalRef.current = null
    stopCamera()
    sessionIdRef.current = null
    localStorage.removeItem('monitoringSessionId')
    localStorage.removeItem('monitoringDistractions')
    setIsActive(false)
    setCurrentAlert(null)
    setEventCounts({})
    setRecentAlerts([])
  }, [])

  return {
    videoRef,
    canvasRef,
    modelsLoaded,
    modelsLoading,
    isActive,
    currentAlert,
    eventCounts,
    recentAlerts,
    startMonitoring,
    stopMonitoring,
  }
}
