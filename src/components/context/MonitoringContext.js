import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import '@tensorflow/tfjs'
import * as faceDetection from '@tensorflow-models/face-detection'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { monitoringApi } from '../../apis/monitoringApi'
import { handleLogError } from '../../misc/Helpers'
import { useAuth } from './AuthContext'
import { useChronometer } from './ChronometerContext'

const EVENT_COOLDOWN_MS = 5000
const FACE_ABSENT_THRESHOLD_MS = 3000
const DETECTION_INTERVAL_MS = 1000

export const EVENT_META = {
  FACE_ABSENT:    { label: 'وجه غائب',    color: '#ef4444', bg: '#fef2f2' },
  PHONE_DETECTED: { label: 'هاتف مكتشف',  color: '#8b5cf6', bg: '#f5f3ff' },
}

const MonitoringContext = createContext(null)

export function MonitoringProvider({ children }) {
  const { getUser } = useAuth()
  const user = getUser()
  const { isRunning, isPaused } = useChronometer()

  const [modelsLoaded, setModelsLoaded]   = useState(false)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [isActive, setIsActive]           = useState(false)
  const [currentAlert, setCurrentAlert]   = useState(null)
  const [eventCounts, setEventCounts]     = useState({})
  const [recentAlerts, setRecentAlerts]   = useState([])
  const [minimized, setMinimized]         = useState(false)
  const [pos, setPos]                     = useState({ x: 20, y: window.innerHeight - 260 })

  const draggingRef   = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const hasDraggedRef = useRef(false)
  const posRef        = useRef(pos)

  useEffect(() => { posRef.current = pos }, [pos])

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return
      hasDraggedRef.current = true
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - 230, clientX - dragOffsetRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 40,  clientY - dragOffsetRef.current.y)),
      })
    }
    const onUp = () => { draggingRef.current = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend',  onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onUp)
    }
  }, [])

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

  // Attach stream after the portal renders the video element
  useEffect(() => {
    if (isActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [isActive])

  // Pause/resume camera with the chronometer
  useEffect(() => {
    if (!isActive) return
    if (isPaused) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
      stopCamera()
    } else if (isRunning) {
      // Resuming — re-open camera and restart detection
      navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      }).then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS)
      }).catch(err => handleLogError(err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused])

  // Auto-stop when chronometer stops from any source
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
      [faceModelRef.current, phoneModelRef.current] = await Promise.all([
        faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          { runtime: 'tfjs' }
        ),
        cocoSsd.load({ base: 'lite_mobilenet_v2' }),
      ])
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
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
        })
        streamRef.current = stream
      }
      setIsActive(true)
      detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS)
    } catch (err) {
      handleLogError(err)
    }
  }, [runDetection])

  const requestCameraAccess = useCallback(async () => {
    if (streamRef.current) return true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      })
      streamRef.current = stream
      return true
    } catch (err) {
      handleLogError(err)
      return false
    }
  }, [])

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

  const totalDistractions = Object.values(eventCounts).reduce((s, v) => s + v, 0)
  const alertColor = currentAlert ? EVENT_META[currentAlert]?.color : 'rgba(102,126,234,0.5)'

  return (
    <MonitoringContext.Provider value={{
      modelsLoaded,
      modelsLoading,
      isActive,
      currentAlert,
      eventCounts,
      recentAlerts,
      startMonitoring,
      stopMonitoring,
      requestCameraAccess,
    }}>
      {children}

      {isActive && createPortal(
        <div style={{
          position: 'fixed',
          top: pos.y,
          left: pos.x,
          zIndex: 9999,
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          background: '#0f172a',
          border: `2px solid ${alertColor}`,
          transition: 'border-color 0.3s',
          width: minimized ? 160 : 224,
          fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        }}>
          {/* Header — drag to move, click to minimize/expand */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 10px', background: '#1e293b', cursor: 'grab', userSelect: 'none',
            }}
            onMouseDown={(e) => {
              draggingRef.current = true
              hasDraggedRef.current = false
              dragOffsetRef.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y }
              e.preventDefault()
            }}
            onTouchStart={(e) => {
              draggingRef.current = true
              hasDraggedRef.current = false
              const t = e.touches[0]
              dragOffsetRef.current = { x: t.clientX - posRef.current.x, y: t.clientY - posRef.current.y }
            }}
            onClick={() => { if (!hasDraggedRef.current) setMinimized(m => !m) }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                display: 'inline-block', boxShadow: '0 0 6px #22c55e',
              }} />
              <span style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>مراقبة التركيز</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {totalDistractions > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff',
                  borderRadius: 8, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                }}>
                  {totalDistractions}
                </span>
              )}
              <span style={{ color: '#64748b', fontSize: 11 }}>{minimized ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* Camera feed */}
          {!minimized && (
            <div style={{ position: 'relative', width: '100%', height: 168 }}>
              <video
                ref={videoRef}
                muted
                playsInline
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', transform: 'scaleX(-1)', display: 'block',
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', transform: 'scaleX(-1)',
                }}
              />

              {isPaused ? (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(15,23,42,0.75)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  <span style={{ fontSize: 22 }}>⏸</span>
                  <span style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 700 }}>متوقفة مؤقتاً</span>
                </div>
              ) : currentAlert ? (
                <div style={{
                  position: 'absolute', top: 6, left: 6, right: 6,
                  background: EVENT_META[currentAlert]?.color,
                  color: '#fff', borderRadius: 6, padding: '3px 8px',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  ⚠️ {EVENT_META[currentAlert]?.label}
                </div>
              ) : (
                <div style={{
                  position: 'absolute', top: 6, left: 6,
                  background: '#22c55e', color: '#fff',
                  borderRadius: 6, padding: '2px 8px',
                  fontSize: 10, fontWeight: 700,
                }}>
                  ✓ مركّز
                </div>
              )}
            </div>
          )}

          {/* Distraction counts footer */}
          {!minimized && totalDistractions > 0 && (
            <div style={{
              padding: '5px 10px', background: '#1e293b',
              display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {Object.entries(EVENT_META).map(([type, meta]) =>
                eventCounts[type] ? (
                  <span key={type} style={{ color: meta.color, fontSize: 10, fontWeight: 700 }}>
                    {meta.label}: {eventCounts[type]}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </MonitoringContext.Provider>
  )
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext)
  if (!ctx) throw new Error('useMonitoring must be used within MonitoringProvider')
  return ctx
}
