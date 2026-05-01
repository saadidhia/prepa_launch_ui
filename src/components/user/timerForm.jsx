import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Subject as SubjectIcon,
  Timer as TimerIcon,
  PlayArrow as PlayArrowIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircleOutline as CheckCircleIcon,
  UploadFile as UploadFileIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Article as ArticleIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AccessAlarm as AlarmIcon,
} from '@mui/icons-material';
import Stopwatch from './timer/Stopwatch';
import { useChronometer } from '../context/ChronometerContext';
import subjects from '../../subjects';
import { useAuth } from '../context/AuthContext';
import { useMonitoring, EVENT_META } from '../context/MonitoringContext';
import DocumentViewerModal from './DocumentViewerModal';

const DURATIONS = [
  { value: null,     label: '∞',      title: 'بلا حد' },
  { value: 60,       label: '1س',     title: 'ساعة واحدة' },
  { value: 120,      label: '2س',     title: 'ساعتان' },
  { value: 180,      label: '3س',     title: '3 ساعات' },
  { value: 240,      label: '4س',     title: '4 ساعات' },
  { value: 'custom', label: 'مخصص',   title: 'مدة مخصصة' },
];

const formatRemaining = (ms) => {
  if (!ms || ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

function TimerForm({ fetchTimers }) {
  const { isRunning, documentUrl, startTimer, stopTimer } = useChronometer();
  const [textInput, setTextInput]         = useState('');
  const [subject, setSubject]             = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [file, setFile]                   = useState(null);
  const [fileError, setFileError]         = useState('');
  const [docViewerOpen, setDocViewerOpen] = useState(false);

  // Auto-stop duration
  const [selectedDuration, setSelectedDuration] = useState(null); // null | 60 | 120 | 180 | 240 | 'custom'
  const [customHours, setCustomHours]           = useState('1');
  const [customMins, setCustomMins]             = useState('0');
  const [remainingMs, setRemainingMs]           = useState(null);
  const autoStopTimerRef    = useRef(null);
  const remainingTickRef    = useRef(null);
  const autoStopScheduledRef = useRef(false);

  const fileInputRef = useRef(null);
  const MAX_FILE_MB  = 20;

  const Auth         = useAuth();
  const user         = Auth.getUser();
  const userSubjects = subjects.filter(s => s.section.includes(user.data.field));

  const [cameraError, setCameraError] = useState(false);

  const {
    modelsLoaded, modelsLoading,
    isActive, currentAlert, eventCounts,
    startMonitoring, stopMonitoring, requestCameraAccess,
  } = useMonitoring();

  // ── Auto-stop helpers ──────────────────────────────────────────────────────
  const clearAutoStop = () => {
    if (autoStopTimerRef.current)   { clearTimeout(autoStopTimerRef.current);  autoStopTimerRef.current  = null; }
    if (remainingTickRef.current)   { clearInterval(remainingTickRef.current); remainingTickRef.current  = null; }
    localStorage.removeItem('autoStopAt');
    setRemainingMs(null);
  };

  const scheduleAutoStop = (stopAt, stopFn) => {
    clearAutoStop();
    localStorage.setItem('autoStopAt', String(stopAt));

    const tick = () => {
      const r = stopAt - Date.now();
      setRemainingMs(r > 0 ? r : 0);
      if (r <= 0) clearInterval(remainingTickRef.current);
    };
    tick();
    remainingTickRef.current = setInterval(tick, 1000);

    const delay = stopAt - Date.now();
    if (delay <= 0) { stopFn(); return; }
    autoStopTimerRef.current = setTimeout(stopFn, delay);
  };

  // ── Reset when session stops ───────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) {
      setCameraEnabled(false);
      setFile(null);
      setDocViewerOpen(false);
      clearAutoStop();
      autoStopScheduledRef.current = false;
      docRestoredRef.current = false;
    }
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup timers on unmount ──────────────────────────────────────────────
  useEffect(() => () => { clearAutoStop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Restore auto-stop after page refresh ──────────────────────────────────
  useEffect(() => {
    if (!isRunning || autoStopScheduledRef.current) return;
    const stored = localStorage.getItem('autoStopAt');
    if (!stored) return;
    autoStopScheduledRef.current = true;
    scheduleAutoStop(parseInt(stored, 10), handleStop); // eslint-disable-line react-hooks/exhaustive-deps
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Restore PDF modal after page refresh ──────────────────────────────────
  const docRestoredRef = useRef(false);
  useEffect(() => {
    if (docRestoredRef.current || !isRunning || !documentUrl) return;
    docRestoredRef.current = true;
    setDocViewerOpen(true);
  }, [isRunning, documentUrl]);

  // ── Restore camera after page refresh ─────────────────────────────────────
  const resumedRef = useRef(false);
  useEffect(() => {
    if (resumedRef.current || !isRunning || !modelsLoaded || isActive) return;
    const savedId = localStorage.getItem('monitoringSessionId');
    if (savedId) {
      resumedRef.current = true;
      setCameraEnabled(true);
      startMonitoring(savedId);
    }
  }, [isRunning, modelsLoaded, isActive, startMonitoring]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    e.target.value = '';
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`حجم الملف يتجاوز ${MAX_FILE_MB} ميغابايت المسموح بها`);
      setFile(null);
      return;
    }
    setFileError('');
    setFile(f);
  };

  const getDurationMs = () => {
    if (!selectedDuration) return null;
    if (selectedDuration === 'custom') {
      const h = parseInt(customHours || '0', 10);
      const m = parseInt(customMins  || '0', 10);
      const total = (h * 60 + m) * 60 * 1000;
      return total > 0 ? total : null;
    }
    return selectedDuration * 60 * 1000;
  };

  const handleStart = async () => {
    if (!textInput || !subject) return;
    setCameraError(false);
    setFileError('');

    if (cameraEnabled) {
      const granted = await requestCameraAccess();
      if (!granted) { setCameraError(true); return; }
    }

    const data = await startTimer({ description: textInput, subject, cameraControlEnabled: cameraEnabled, file });

    if (data?.__error === 'FILE_TOO_LARGE') {
      setFileError('الخادم رفض الملف — يرجى إخبار المسؤول برفع حد الرفع في إعدادات Spring Boot');
      return;
    }
    if (!data) return;

    if (cameraEnabled && data.monitoringSessionId) await startMonitoring(data.monitoringSessionId);
    if (data.documentUrl) setDocViewerOpen(true);

    // Schedule auto-stop if a duration was chosen
    const durationMs = getDurationMs();
    if (durationMs) {
      autoStopScheduledRef.current = true;
      scheduleAutoStop(Date.now() + durationMs, handleStop); // eslint-disable-line no-use-before-define
    }
  };

  const handleStop = async () => {
    clearAutoStop();
    if (isActive) stopMonitoring();
    localStorage.removeItem('monitoringSessionId');
    setCameraEnabled(false);
    const stopped = await stopTimer();
    if (stopped) fetchTimers();
  };

  const isImageFile = (f) => f && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name);
  const totalDistractions = Object.values(eventCounts).reduce((s, v) => s + v, 0);
  const isLastMinute = remainingMs !== null && remainingMs < 60_000;

  return (
    <>
      <Card sx={{ borderRadius: '20px', boxShadow: '0 8px 24px rgba(102,126,234,0.15)', overflow: 'hidden' }}>

        {/* Header */}
        <Box
          sx={{
            background: isRunning
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 28px',
            display: 'flex', alignItems: 'center', gap: '12px',
            transition: 'all 0.3s ease',
          }}
        >
          <TimerIcon sx={{ color: 'white', fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
              {isRunning ? 'الجلسة الحالية' : 'جلسة جديدة'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
              {isRunning ? 'مؤقت التركيز نشط' : 'ابدأ جلستك الدراسية'}
            </Typography>
          </Box>
          {isRunning && remainingMs !== null && (
            <Chip
              icon={<AlarmIcon sx={{ color: `${isLastMinute ? '#fef2f2' : 'white'} !important`, fontSize: '14px !important' }} />}
              label={formatRemaining(remainingMs)}
              sx={{
                bgcolor: isLastMinute ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 700,
                fontFamily: 'monospace',
                fontSize: '13px',
                letterSpacing: '1px',
                backdropFilter: 'blur(10px)',
                animation: isLastMinute ? 'pulse 1s infinite' : 'none',
              }}
            />
          )}
          {isRunning && (
            <Chip
              icon={<PlayArrowIcon sx={{ color: 'white !important' }} />}
              label="قيد التنفيذ"
              sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: '700', backdropFilter: 'blur(10px)' }}
            />
          )}
        </Box>

        <CardContent sx={{ padding: '28px', backgroundColor: '#f8f9fa' }}>

          {/* Row 1: inputs + stopwatch */}
          <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <Box sx={{ flex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
                <DescriptionIcon sx={{ color: '#667eea', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>الوصف</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="مثال: Révision du cours de physique"
                variant="outlined"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isRunning}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px', backgroundColor: 'white',
                    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '2px' },
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    '&.Mui-disabled': { backgroundColor: '#f3f4f6' },
                  },
                  '& .MuiInputBase-input': { padding: '12px 16px', fontSize: '14px', fontWeight: '500' },
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
                <SubjectIcon sx={{ color: '#667eea', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>المادة</Typography>
              </Box>
              <FormControl fullWidth disabled={isRunning}>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px', backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb', borderWidth: '2px' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                    '&.Mui-disabled': { backgroundColor: '#f3f4f6' },
                    '& .MuiSelect-select': { padding: '12px 16px', fontSize: '14px', fontWeight: '500' },
                  }}
                >
                  <MenuItem value="" disabled><em style={{ color: '#9ca3af' }}>اختر</em></MenuItem>
                  {userSubjects.map((s, i) => <MenuItem key={i} value={s.name}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Stopwatch isRunning={isRunning} onStart={handleStart} onStop={handleStop} textInput={textInput} subject={subject} />
            </Box>
          </Box>

          {/* Row 2: Camera toggle */}
          <Box sx={{ mt: '20px', px: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <VideocamIcon sx={{ color: cameraEnabled ? '#667eea' : '#9ca3af', fontSize: 22, flexShrink: 0 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={cameraEnabled}
                  onChange={(e) => { setCameraEnabled(e.target.checked); setCameraError(false); }}
                  disabled={isRunning || modelsLoading}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#667eea' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#667eea' },
                  }}
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>مراقبة التركيز بالكاميرا</Typography>}
              sx={{ m: 0 }}
            />
            {modelsLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CircularProgress size={14} thickness={5} sx={{ color: '#667eea' }} />
                <Typography variant="caption" color="text.secondary">جاري تحميل النماذج...</Typography>
              </Box>
            )}
            {modelsLoaded && !modelsLoading && (
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>✓ النماذج جاهزة</Typography>
            )}
          </Box>

          {cameraError && (
            <Box sx={{ mt: '12px', px: '16px', py: '10px', borderRadius: '10px', background: '#fef2f2', border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <VideocamOffIcon sx={{ color: '#ef4444', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                لم يتم منح إذن الكاميرا. يرجى السماح بالوصول إليها ثم المحاولة مجدداً.
              </Typography>
            </Box>
          )}

          {/* Row 3: Auto-stop duration — only before starting */}
          {!isRunning && (
            <Box sx={{ mt: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
                <AlarmIcon sx={{ color: '#667eea', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                  إيقاف تلقائي{' '}
                  <Typography component="span" variant="caption" sx={{ color: '#9ca3af', fontWeight: 400 }}>(اختياري)</Typography>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {DURATIONS.map(({ value, label, title }) => {
                  const active = selectedDuration === value;
                  return (
                    <Chip
                      key={String(value)}
                      label={label}
                      title={title}
                      onClick={() => setSelectedDuration(value)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '12px',
                        height: 32,
                        cursor: 'pointer',
                        bgcolor: active ? '#667eea' : 'white',
                        color: active ? 'white' : '#374151',
                        border: `2px solid ${active ? '#667eea' : '#e5e7eb'}`,
                        transition: 'all 0.15s ease',
                        '&:hover': { bgcolor: active ? '#5a6fd6' : '#f3f4f6', transform: 'translateY(-1px)' },
                        '& .MuiChip-label': { px: 1.5 },
                      }}
                    />
                  );
                })}
              </Box>

              {/* Custom duration inputs */}
              {selectedDuration === 'custom' && (
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    type="number"
                    label="ساعات"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    inputProps={{ min: 0, max: 23 }}
                    size="small"
                    sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' } }}
                  />
                  <Typography sx={{ color: '#9ca3af', fontWeight: 700 }}>:</Typography>
                  <TextField
                    type="number"
                    label="دقائق"
                    value={customMins}
                    onChange={(e) => setCustomMins(e.target.value)}
                    inputProps={{ min: 0, max: 59 }}
                    size="small"
                    sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' } }}
                  />
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    المجموع: {Math.floor((parseInt(customHours||0)*60 + parseInt(customMins||0)))} دقيقة
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Row 4: Document upload — only before starting */}
          {!isRunning && (
            <Box sx={{ mt: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
                <ArticleIcon sx={{ color: '#667eea', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                  وثيقة للمراجعة{' '}
                  <Typography component="span" variant="caption" sx={{ color: '#9ca3af', fontWeight: 400 }}>(اختياري)</Typography>
                </Typography>
              </Box>

              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg" style={{ display: 'none' }} onChange={handleFileChange} />

              {!file ? (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed #e5e7eb', borderRadius: '12px', p: '14px 20px',
                    display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', bgcolor: 'white',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#667eea', bgcolor: 'rgba(102,126,234,0.03)', transform: 'translateY(-1px)' },
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(102,126,234,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <UploadFileIcon sx={{ color: '#667eea', fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#374151', fontSize: '13px', fontWeight: 600 }}>انقر لتحميل وثيقة</Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>PDF أو صورة (PNG, JPG…)</Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ border: '2px solid rgba(102,126,234,0.35)', borderRadius: '12px', p: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', bgcolor: 'rgba(102,126,234,0.05)' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(102,126,234,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isImageFile(file) ? <ImageIcon sx={{ color: '#667eea', fontSize: 22 }} /> : <PictureAsPdfIcon sx={{ color: '#667eea', fontSize: 22 }} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#374151', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {file.size < 1024*1024 ? `${(file.size/1024).toFixed(0)} KB` : `${(file.size/1024/1024).toFixed(1)} MB`}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(''); }} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}

              {fileError && (
                <Box sx={{ mt: '10px', px: '14px', py: '10px', borderRadius: '10px', background: '#fef2f2', border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloseIcon sx={{ color: '#ef4444', fontSize: 17, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>{fileError}</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Row 5: Distraction stats */}
          {isActive && (
            <Box sx={{ mt: '20px', borderRadius: '12px', border: '2px solid rgba(102,126,234,0.2)', bgcolor: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {currentAlert ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WarningAmberIcon sx={{ fontSize: 18, color: EVENT_META[currentAlert]?.color }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: EVENT_META[currentAlert]?.color }}>{EVENT_META[currentAlert]?.label}</Typography>
                </Box>
              ) : (
                <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />} label="مركّز" size="small" sx={{ bgcolor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 11, height: 24 }} />
              )}
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, mr: 'auto' }}>التشتيتات: {totalDistractions}</Typography>
              {Object.entries(EVENT_META).map(([type, meta]) => (
                <Chip key={type} label={`${meta.label}: ${eventCounts[type] || 0}`} size="small"
                  sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: eventCounts[type] ? meta.bg : '#f3f4f6', color: eventCounts[type] ? meta.color : '#9ca3af', border: `1px solid ${eventCounts[type] ? meta.color+'40' : '#e5e7eb'}`, '& .MuiChip-label': { px: 1 } }}
                />
              ))}
            </Box>
          )}

          {/* Row 6: Info hint (idle) */}
          {!isRunning && (
            <Box sx={{ mt: '20px', p: '12px 16px', borderRadius: '12px', background: 'rgba(102,126,234,0.05)', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TimerIcon sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
                {cameraEnabled ? 'ستفتح الكاميرا تلقائياً عند بدء الجلسة لمراقبة تركيزك' : 'املأ الوصف والمادة، ثم اضغط على ابدأ لبدء جلستك'}
              </Typography>
            </Box>
          )}

          {/* Row 6: Running info */}
          {isRunning && textInput && subject && (
            <Box sx={{ mt: '20px', p: '16px 20px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(16,185,129,0.05) 0%,rgba(5,150,105,0.05) 100%)', border: '2px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#059669', fontWeight: '700', mb: '4px' }}>
                  جلسة نشطة {isActive ? '· مراقبة الكاميرا مفعلة' : ''}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
                  {textInput} — {subject}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                {remainingMs !== null && (
                  <Chip
                    icon={<AlarmIcon sx={{ fontSize: '13px !important', color: `${isLastMinute ? '#dc2626' : '#667eea'} !important` }} />}
                    label={formatRemaining(remainingMs)}
                    size="small"
                    sx={{
                      bgcolor: isLastMinute ? '#fef2f2' : 'rgba(102,126,234,0.1)',
                      color: isLastMinute ? '#dc2626' : '#667eea',
                      fontWeight: 700, fontSize: '11px', fontFamily: 'monospace',
                      border: `1.5px solid ${isLastMinute ? '#fca5a5' : 'rgba(102,126,234,0.3)'}`,
                      animation: isLastMinute ? 'pulse 1s infinite' : 'none',
                    }}
                  />
                )}
                {documentUrl && (
                  <Button size="small" variant="outlined" startIcon={<ArticleIcon sx={{ fontSize: '14px !important' }} />} onClick={() => setDocViewerOpen(true)}
                    sx={{ borderRadius: '20px', fontSize: '11px', fontWeight: 700, borderColor: 'rgba(102,126,234,0.5)', color: '#667eea', height: 28, px: 1.5, textTransform: 'none', '&:hover': { borderColor: '#667eea', bgcolor: 'rgba(102,126,234,0.06)' } }}>
                    عرض الوثيقة
                  </Button>
                )}
                {isActive && (
                  <Chip icon={<VideocamIcon sx={{ fontSize: '14px !important' }} />} label="كاميرا" size="small"
                    sx={{ bgcolor: '#667eea', color: 'white', fontWeight: 700, fontSize: '11px', '& .MuiChip-icon': { color: 'white' } }} />
                )}
                <Chip icon={<PlayArrowIcon />} label="قيد التنفيذ" size="small"
                  sx={{ background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', color: 'white', fontWeight: 700, fontSize: '12px' }} />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <DocumentViewerModal open={docViewerOpen && Boolean(documentUrl)} onClose={() => setDocViewerOpen(false)} documentUrl={documentUrl} onStop={handleStop} />
    </>
  );
}

export default TimerForm;
