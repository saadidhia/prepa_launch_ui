import React, { useState, useEffect, useRef, useCallback } from 'react'
import '@tensorflow/tfjs'
import * as faceDetection from '@tensorflow-models/face-detection'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import {
  Box, Button, Chip, CircularProgress, Paper, Typography, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, LinearProgress,
} from '@mui/material'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useAuth } from '../context/AuthContext'
import { monitoringApi } from '../../apis/monitoringApi'
import { handleLogError } from '../../misc/Helpers'

// How long before the same event fires again (per event type)
const EVENT_COOLDOWN_MS = 5000
// How long face must be absent before firing FACE_ABSENT
const FACE_ABSENT_THRESHOLD_MS = 3000
// Detection loop interval
const DETECTION_INTERVAL_MS = 1000

const EVENT_META = {
  FACE_ABSENT:    { label: 'وجه غائب',    color: '#ef4444', bg: '#fef2f2' },
  HEAD_DOWN:      { label: 'رأس منخفض',   color: '#f97316', bg: '#fff7ed' },
  LOOKING_AWAY:   { label: 'نظرة بعيدة',  color: '#eab308', bg: '#fefce8' },
  PHONE_DETECTED: { label: 'هاتف مكتشف',  color: '#8b5cf6', bg: '#f5f3ff' },
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ar', { dateStyle: 'short', timeStyle: 'short' })
}

export function Monitoring() {
  const { getUser } = useAuth()
  const user = getUser()

  const [isMonitoring, setIsMonitoring]       = useState(false)
  const [isStarting, setIsStarting]           = useState(false)
  const [modelsLoaded, setModelsLoaded]       = useState(false)
  const [modelsLoading, setModelsLoading]     = useState(true)
  const [loadingStep, setLoadingStep]         = useState('')
  const [sessionDuration, setSessionDuration] = useState(0)
  const [eventCounts, setEventCounts]         = useState({})
  const [recentAlerts, setRecentAlerts]       = useState([])
  const [currentAlert, setCurrentAlert]       = useState(null)
  const [mySessions, setMySessions]           = useState([])
  const [error, setError]                     = useState('')

  const videoRef             = useRef(null)
  const canvasRef            = useRef(null)
  const streamRef            = useRef(null)
  const detectionIntervalRef = useRef(null)
  const sessionTimerRef      = useRef(null)
  const lastEventTimeRef     = useRef({})
  const faceAbsentSinceRef   = useRef(null)
  const sessionIdRef         = useRef(null)
  const audioCtxRef          = useRef(null)
  const faceModelRef         = useRef(null)
  const phoneModelRef        = useRef(null)

  useEffect(() => {
    loadModels()
    fetchMySessions()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadModels() {
    setModelsLoading(true)
    try {
      setLoadingStep('نموذج الوجه...')
      faceModelRef.current = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
      )

      setLoadingStep('نموذج كشف الهاتف...')
      phoneModelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' })

      setModelsLoaded(true)
    } catch (err) {
      setError('فشل تحميل نماذج الكشف. تحقق من اتصالك بالإنترنت.')
      handleLogError(err)
    } finally {
      setModelsLoading(false)
      setLoadingStep('')
    }
  }

  async function fetchMySessions() {
    try {
      const res = await monitoringApi.getMySessions(user)
      setMySessions(res.data || [])
    } catch (err) {
      handleLogError(err)
    }
  }

  function cleanup() {
    stopStream()
    clearInterval(detectionIntervalRef.current)
    clearInterval(sessionTimerRef.current)
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const playAlert = useCallback(() => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
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
    } catch { /* ignore audio errors */ }
  }, [])

  const reportEvent = useCallback(async (eventType) => {
    const now = Date.now()
    if (now - (lastEventTimeRef.current[eventType] || 0) < EVENT_COOLDOWN_MS) return
    lastEventTimeRef.current[eventType] = now

    playAlert()
    setCurrentAlert(eventType)
    setTimeout(() => setCurrentAlert(null), 3000)
    setEventCounts(prev => ({ ...prev, [eventType]: (prev[eventType] || 0) + 1 }))
    setRecentAlerts(prev => [{ type: eventType, time: new Date() }, ...prev.slice(0, 9)])

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
    if (!video || video.readyState < 2) return

    // Run both models in parallel
    const [faces, objects] = await Promise.all([
      faceModelRef.current.estimateFaces(video),
      phoneModelRef.current.detect(video),
    ])

    // --- Phone detection ---
    // COCO-SSD labels phones as 'cell phone'
    const phoneDetected = objects.some(o => o.class === 'cell phone' && o.score > 0.45)
    if (phoneDetected) reportEvent('PHONE_DETECTED')

    // --- Draw bounding boxes on canvas ---
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const ctx2d = canvas.getContext('2d')
      ctx2d.clearRect(0, 0, canvas.width, canvas.height)
      ctx2d.lineWidth = 2

      faces.forEach(face => {
        const { xMin, yMin, width, height } = face.box
        ctx2d.strokeStyle = '#22c55e'
        ctx2d.strokeRect(xMin, yMin, width, height)
      })
      objects.filter(o => o.class === 'cell phone').forEach(o => {
        const [x, y, w, h] = o.bbox
        ctx2d.strokeStyle = '#8b5cf6'
        ctx2d.strokeRect(x, y, w, h)
      })
    }

    // --- Face absent ---
    if (faces.length === 0) {
      if (!faceAbsentSinceRef.current) faceAbsentSinceRef.current = Date.now()
      else if (Date.now() - faceAbsentSinceRef.current > FACE_ABSENT_THRESHOLD_MS)
        reportEvent('FACE_ABSENT')
      return
    }
    faceAbsentSinceRef.current = null

    const face = faces[0]
    const kp = face.keypoints

    // Named keypoints from MediaPipeFaceDetector:
    //   rightEye, leftEye, noseTip, mouthCenter, rightEarTragion, leftEarTragion
    const rightEye    = kp.find(k => k.name === 'rightEye')
    const leftEye     = kp.find(k => k.name === 'leftEye')
    const noseTip     = kp.find(k => k.name === 'noseTip')
    const mouthCenter = kp.find(k => k.name === 'mouthCenter')

    if (!rightEye || !leftEye || !noseTip || !mouthCenter) return

    const faceH = face.box.height
    const faceW = face.box.width

    // --- HEAD_DOWN ---
    // When head tilts down the face compresses: nose-to-mouth gap shrinks.
    // Normal nose-to-mouth: ~25-35% of face height.
    // When looking down at a phone: drops below ~12%.
    const noseToMouth = mouthCenter.y - noseTip.y
    if (noseToMouth < faceH * 0.14) reportEvent('HEAD_DOWN')

    // --- LOOKING_AWAY ---
    // When face turns sideways the apparent eye-to-eye distance shrinks.
    // Normal inter-eye span: ~32-45% of face width.
    // When turned: drops below 25%.
    const interEyeDist = Math.abs(leftEye.x - rightEye.x)
    if (interEyeDist / faceW < 0.30) reportEvent('LOOKING_AWAY')
  }, [reportEvent])

  async function startMonitoring() {
    setIsStarting(true)
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const res = await monitoringApi.startSession(user)
      sessionIdRef.current = res.data.sessionId

      setIsMonitoring(true)
      setEventCounts({})
      setRecentAlerts([])
      setSessionDuration(0)
      faceAbsentSinceRef.current = null
      lastEventTimeRef.current = {}

      sessionTimerRef.current      = setInterval(() => setSessionDuration(p => p + 1), 1000)
      detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS)
    } catch (err) {
      if (err.name === 'NotAllowedError')
        setError('يجب السماح بالوصول إلى الكاميرا لبدء المراقبة.')
      else {
        setError('حدث خطأ أثناء بدء الجلسة.')
        handleLogError(err)
      }
      stopStream()
    } finally {
      setIsStarting(false)
    }
  }

  async function stopMonitoring() {
    clearInterval(detectionIntervalRef.current)
    clearInterval(sessionTimerRef.current)
    stopStream()

    if (sessionIdRef.current) {
      try { await monitoringApi.endSession(user, sessionIdRef.current) }
      catch (err) { handleLogError(err) }
    }

    setIsMonitoring(false)
    sessionIdRef.current = null
    await fetchMySessions()
  }

  const totalDistractions = Object.values(eventCounts).reduce((s, v) => s + v, 0)

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, direction: 'rtl', maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} mb={3} color="primary">
        مراقبة التركيز
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {modelsLoading && (
        <Paper elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            جاري تحميل نماذج الذكاء الاصطناعي — {loadingStep}
          </Typography>
          <LinearProgress />
        </Paper>
      )}

      {/* Camera + Status panel */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>

        {/* Camera feed */}
        <Paper
          elevation={3}
          sx={{
            flex: '1 1 360px',
            minHeight: 300,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!isMonitoring && (
            <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
              <VideocamOffIcon sx={{ fontSize: 64, mb: 1 }} />
              <Typography variant="body2">الكاميرا غير مفعلة</Typography>
            </Box>
          )}

          {/* Mirror the video so it feels like a selfie camera */}
          <video
            ref={videoRef}
            muted
            playsInline
            style={{
              display: isMonitoring ? 'block' : 'none',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />
          {/* Canvas mirrors too so boxes align with the mirrored video */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              transform: 'scaleX(-1)',
            }}
          />

          {/* Distraction alert overlay */}
          {currentAlert && (
            <Box
              sx={{
                position: 'absolute',
                top: 12, left: 12, right: 12,
                bgcolor: EVENT_META[currentAlert]?.color || '#ef4444',
                color: '#fff',
                borderRadius: 2,
                px: 2, py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <WarningAmberIcon />
              <Typography fontWeight={700}>{EVENT_META[currentAlert]?.label}</Typography>
            </Box>
          )}

          {/* Focused status badge */}
          {isMonitoring && !currentAlert && (
            <Chip
              icon={<CheckCircleOutlineIcon />}
              label="مركّز"
              sx={{
                position: 'absolute',
                top: 12, left: 12,
                bgcolor: '#22c55e',
                color: '#fff',
                fontWeight: 700,
                '& .MuiChip-icon': { color: '#fff' },
              }}
            />
          )}
        </Paper>

        {/* Controls + stats */}
        <Box sx={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Session timer */}
          {isMonitoring && (
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
              <AccessTimeIcon color="primary" sx={{ mb: 0.5 }} />
              <Typography variant="h4" fontWeight={700} color="primary" fontFamily="monospace">
                {formatDuration(sessionDuration)}
              </Typography>
              <Typography variant="caption" color="text.secondary">مدة الجلسة</Typography>
            </Paper>
          )}

          {/* Distraction counters */}
          {isMonitoring && (
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                التشتيتات المكتشفة ({totalDistractions})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(EVENT_META).map(([type, meta]) => (
                  <Chip
                    key={type}
                    label={`${meta.label}: ${eventCounts[type] || 0}`}
                    size="small"
                    sx={{
                      bgcolor: meta.bg,
                      color: meta.color,
                      fontWeight: 600,
                      border: `1px solid ${meta.color}30`,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Start / Stop */}
          {!isMonitoring ? (
            <Button
              variant="contained"
              size="large"
              startIcon={isStarting ? <CircularProgress size={20} color="inherit" /> : <VideocamIcon />}
              onClick={startMonitoring}
              disabled={!modelsLoaded || isStarting}
              sx={{ borderRadius: 3, py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              {isStarting ? 'جاري البدء...' : 'بدء المراقبة'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<VideocamOffIcon />}
              onClick={stopMonitoring}
              sx={{ borderRadius: 3, py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              إيقاف المراقبة
            </Button>
          )}

          {/* Recent alerts log */}
          {recentAlerts.length > 0 && (
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, maxHeight: 220, overflowY: 'auto' }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>آخر التنبيهات</Typography>
              {recentAlerts.map((a, i) => (
                <Box
                  key={i}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}
                >
                  <Chip
                    label={EVENT_META[a.type]?.label || a.type}
                    size="small"
                    sx={{
                      bgcolor: EVENT_META[a.type]?.bg,
                      color: EVENT_META[a.type]?.color,
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {a.time.toLocaleTimeString('ar')}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Past sessions */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>جلسات سابقة</Typography>
        </Box>
        {mySessions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">لا توجد جلسات سابقة</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell align="right">تاريخ البدء</TableCell>
                  <TableCell align="right">تاريخ الانتهاء</TableCell>
                  <TableCell align="right">المدة</TableCell>
                  <TableCell align="right">التشتيتات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mySessions.map((s, i) => (
                  <TableRow key={s.id || i} hover>
                    <TableCell align="right">{formatDateTime(s.startTime)}</TableCell>
                    <TableCell align="right">{formatDateTime(s.endTime)}</TableCell>
                    <TableCell align="right">
                      {s.durationSeconds != null ? formatDuration(s.durationSeconds) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={Object.entries(s.eventCounts || {})
                          .map(([k, v]) => `${EVENT_META[k]?.label || k}: ${v}`)
                          .join(' | ')}
                      >
                        <Chip
                          label={s.distractionCount ?? s.totalDistractions ?? '—'}
                          size="small"
                          color={(s.distractionCount ?? s.totalDistractions ?? 0) > 5 ? 'error' : 'success'}
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
}
