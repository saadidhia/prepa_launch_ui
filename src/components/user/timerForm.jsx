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
} from '@mui/icons-material';
import Stopwatch from './timer/Stopwatch';
import { useChronometer } from '../context/ChronometerContext';
import subjects from '../../subjects';
import { useAuth } from '../context/AuthContext';
import { useMonitoring, EVENT_META } from '../context/MonitoringContext';

function TimerForm({ fetchTimers }) {
  const { isRunning, startTimer, stopTimer } = useChronometer();
  const [textInput, setTextInput] = useState('');
  const [subject, setSubject]     = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const Auth = useAuth();
  const user = Auth.getUser();
  const userSubjects = subjects.filter(s => s.section.includes(user.data.field));

  const [cameraError, setCameraError] = useState(false);

  const {
    modelsLoaded, modelsLoading,
    isActive, currentAlert, eventCounts, recentAlerts,
    startMonitoring, stopMonitoring, requestCameraAccess,
  } = useMonitoring();

  // Reset toggle whenever the chronometer stops (from any source — including إيقاف نهائي).
  useEffect(() => {
    if (!isRunning) setCameraEnabled(false);
  }, [isRunning]);

  // One-shot: after a page refresh, re-attach camera if a session was active.
  // The ref guard ensures this fires at most once per mount, never on every model reload.
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

  const handleStart = async () => {
    if (!textInput || !subject) return;
    setCameraError(false);

    if (cameraEnabled) {
      const granted = await requestCameraAccess();
      if (!granted) {
        setCameraError(true);
        return;
      }
    }

    const data = await startTimer({
      description: textInput,
      subject,
      cameraControlEnabled: cameraEnabled,
    });
    if (cameraEnabled && data?.monitoringSessionId) {
      await startMonitoring(data.monitoringSessionId);
    }
  };

  const handleStop = async () => {
    if (isActive) stopMonitoring();
    localStorage.removeItem('monitoringSessionId');
    setCameraEnabled(false);
    const stoppedChronometer = await stopTimer();
    if (stoppedChronometer) fetchTimers();
  };

  const totalDistractions = Object.values(eventCounts).reduce((s, v) => s + v, 0);

  return (
    <Card
      sx={{
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: isRunning
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
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
        {isRunning && (
          <Chip
            icon={<PlayArrowIcon sx={{ color: 'white !important' }} />}
            label="قيد التنفيذ"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              color: 'white',
              fontWeight: '700',
              backdropFilter: 'blur(10px)',
            }}
          />
        )}
      </Box>

      <CardContent sx={{ padding: '28px', backgroundColor: '#f8f9fa' }}>

        {/* Row 1: inputs + stopwatch */}
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          {/* Description */}
          <Box sx={{ flex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
              <DescriptionIcon sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                الوصف
              </Typography>
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
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& fieldset': { borderColor: '#e5e7eb', borderWidth: '2px' },
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' },
                  '&.Mui-disabled': { backgroundColor: '#f3f4f6' },
                },
                '& .MuiInputBase-input': { padding: '12px 16px', fontSize: '14px', fontWeight: '500' },
              }}
            />
          </Box>

          {/* Subject */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px' }}>
              <SubjectIcon sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                المادة
              </Typography>
            </Box>
            <FormControl fullWidth disabled={isRunning}>
              <Select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb', borderWidth: '2px' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                  '&.Mui-disabled': { backgroundColor: '#f3f4f6' },
                  '& .MuiSelect-select': { padding: '12px 16px', fontSize: '14px', fontWeight: '500' },
                }}
              >
                <MenuItem value="" disabled>
                  <em style={{ color: '#9ca3af' }}>اختر</em>
                </MenuItem>
                {userSubjects.map((s, i) => (
                  <MenuItem key={i} value={s.name}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Stopwatch buttons */}
          <Box>
            <Stopwatch
              isRunning={isRunning}
              onStart={handleStart}
              onStop={handleStop}
              textInput={textInput}
              subject={subject}
            />
          </Box>
        </Box>

        {/* Row 2: Camera toggle */}
        <Box
          sx={{
            mt: '20px',
            px: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
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
            label={
              <Typography variant="body2" sx={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                مراقبة التركيز بالكاميرا
              </Typography>
            }
            sx={{ m: 0 }}
          />
          {modelsLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CircularProgress size={14} thickness={5} sx={{ color: '#667eea' }} />
              <Typography variant="caption" color="text.secondary">جاري تحميل النماذج...</Typography>
            </Box>
          )}
          {modelsLoaded && !modelsLoading && (
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
              ✓ النماذج جاهزة
            </Typography>
          )}
        </Box>

        {/* Camera permission denied error */}
        {cameraError && (
          <Box
            sx={{
              mt: '12px',
              px: '16px', py: '10px',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1.5px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <VideocamOffIcon sx={{ color: '#ef4444', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
              لم يتم منح إذن الكاميرا. يرجى السماح بالوصول إليها ثم المحاولة مجدداً.
            </Typography>
          </Box>
        )}

        {/* Row 3: Distraction stats (camera feed is in the floating widget) */}
        {isActive && (
          <Box
            sx={{
              mt: '20px',
              borderRadius: '12px',
              border: '2px solid rgba(102,126,234,0.2)',
              bgcolor: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {currentAlert ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WarningAmberIcon sx={{ fontSize: 18, color: EVENT_META[currentAlert]?.color }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: EVENT_META[currentAlert]?.color }}>
                  {EVENT_META[currentAlert]?.label}
                </Typography>
              </Box>
            ) : (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
                label="مركّز"
                size="small"
                sx={{ bgcolor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 11, height: 24 }}
              />
            )}
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, mr: 'auto' }}>
              التشتيتات: {totalDistractions}
            </Typography>
            {Object.entries(EVENT_META).map(([type, meta]) => (
              <Chip
                key={type}
                label={`${meta.label}: ${eventCounts[type] || 0}`}
                size="small"
                sx={{
                  height: 20, fontSize: 10, fontWeight: 700,
                  bgcolor: eventCounts[type] ? meta.bg : '#f3f4f6',
                  color: eventCounts[type] ? meta.color : '#9ca3af',
                  border: `1px solid ${eventCounts[type] ? meta.color + '40' : '#e5e7eb'}`,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ))}
          </Box>
        )}

        {/* Row 4: Info / Running info */}
        {!isRunning && (
          <Box
            sx={{
              mt: '20px',
              p: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(102,126,234,0.05)',
              border: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <TimerIcon sx={{ color: '#667eea', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
              {cameraEnabled
                ? 'ستفتح الكاميرا تلقائياً عند بدء الجلسة لمراقبة تركيزك'
                : 'املأ الوصف والمادة، ثم اضغط على ابدأ لبدء جلستك'}
            </Typography>
          </Box>
        )}

        {isRunning && textInput && subject && (
          <Box
            sx={{
              mt: '20px',
              p: '16px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg,rgba(16,185,129,0.05) 0%,rgba(5,150,105,0.05) 100%)',
              border: '2px solid rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: '#059669', fontWeight: '700', mb: '4px' }}>
                جلسة نشطة {isActive ? '· مراقبة الكاميرا مفعلة' : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
                {textInput} — {subject}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isActive && (
                <Chip
                  icon={<VideocamIcon sx={{ fontSize: '14px !important' }} />}
                  label="كاميرا"
                  size="small"
                  sx={{
                    bgcolor: '#667eea',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '11px',
                    '& .MuiChip-icon': { color: 'white' },
                  }}
                />
              )}
              <Chip
                icon={<PlayArrowIcon />}
                label="قيد التنفيذ"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TimerForm;
