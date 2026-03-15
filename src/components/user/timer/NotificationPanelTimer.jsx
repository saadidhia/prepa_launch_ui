import React, { useRef, useState, useEffect } from 'react';
import DisplayTimer from './DisplayTimer';
import { useChronometer } from '../../context/ChronometerContext';
import { Box, Button, Chip, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Timer as TimerIcon,
  Stop as StopIcon,
  MusicNote as MusicNoteIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';

// ─── Web Audio generators ────────────────────────────────────────────────────
// Each returns a { stop() } handle. All sounds are generated in-browser,
// no external URLs needed → never broken.

function playWhiteNoise(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0.03;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return { stop: () => { try { source.stop(); } catch (_) {} } };
}

function playBrownNoise(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (last + 0.02 * white) / 1.02;
    last = data[i];
    data[i] *= 3.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return { stop: () => { try { source.stop(); } catch (_) {} } };
}

function playRain(ctx) {
  // Layered filtered noise that mimics rain
  const nodes = [];
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.15;
  masterGain.connect(ctx.destination);

  const layers = [
    { freq: 800,  Q: 0.8, gain: 0.4  }, // was 0.5
    { freq: 1800, Q: 1.2, gain: 0.25 }, // was 0.35
    { freq: 4000, Q: 2.0, gain: 0.12 }, // was 0.2
  ];

  layers.forEach(({ freq, Q, gain: gVal }) => {
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = Q;

    const g = ctx.createGain();
    g.gain.value = gVal;

    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    src.start();
    nodes.push(src);
  });

  return { stop: () => nodes.forEach(n => { try { n.stop(); } catch (_) {} }) };
}

function playLofi(ctx) {
  // Simple lo-fi beat: kick + hi-hat pattern + mellow bass tone
  let playing = true;
  const bpm = 70;
  const step = (60 / bpm) / 2; // eighth-note duration in seconds

  // Kick drum
  function kick(time) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Hi-hat
  function hihat(time, vol = 0.15) {
    const bufSize = ctx.sampleRate * 0.05;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(time);
  }

  // Mellow chord stab (two detuned oscillators)
  function chordStab(time, freq) {
    [0, 4, 7].forEach((semitone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * Math.pow(2, semitone / 12);
      gain.gain.setValueAtTime(0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 1.3);
    });
  }

  // Pattern: 8 steps, kick on 1 & 5, hihat on every step, chord on 1
  const chords = [261.63, 220.00, 246.94, 196.00]; // C, A, B, G
  let bar = 0;

  function scheduleBar(startTime) {
    if (!playing) return;
    const chord = chords[bar % chords.length];
    for (let i = 0; i < 8; i++) {
      const t = startTime + i * step;
      if (i === 0 || i === 4) kick(t);
      hihat(t, i % 2 === 0 ? 0.18 : 0.08);
      if (i === 0) chordStab(t, chord);
    }
    bar++;
    const nextBar = startTime + 8 * step;
    const delay = (nextBar - ctx.currentTime) * 1000 - 50;
    if (playing) setTimeout(() => scheduleBar(nextBar), Math.max(0, delay));
  }

  scheduleBar(ctx.currentTime + 0.1);
  return { stop: () => { playing = false; } };
}

function playCafe(ctx) {
  // Gentle pink-ish noise + soft low hum (coffeeshop ambience feel)
  const bufSize = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(2, bufSize, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < bufSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
      b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
      b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
      d[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) / 7;
      b6 = w * 0.115926;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0.09;
  src.connect(gain).connect(ctx.destination);
  src.start();
  return { stop: () => { try { src.stop(); } catch (_) {} } };
}

function playForest(ctx) {
  // Layered low + mid noise resembling wind through trees + occasional bird chirp feel
  let active = true;
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(ctx.destination);

  // Wind base
  const bufSize = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufSize; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.003 * w) / 1.003;
    d[i] = last * 12;
  }
  const windSrc = ctx.createBufferSource();
  windSrc.buffer = buf;
  windSrc.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  windSrc.connect(filter).connect(masterGain);
  windSrc.start();

  // Random high chirp notes (birds)
  function chirp() {
    if (!active) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const freq = 1800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(chirp, 2000 + Math.random() * 5000);
  }
  setTimeout(chirp, 1000 + Math.random() * 3000);

  return {
    stop: () => {
      active = false;
      try { windSrc.stop(); } catch (_) {}
    }
  };
}

// ─── Sound catalogue ─────────────────────────────────────────────────────────
const SOUNDS = [
  { label: 'Lo-fi Beat',    emoji: '🎵', fn: playLofi      },
  { label: 'مطر',           emoji: '🌧️', fn: playRain      },
  { label: 'ضوضاء بيضاء',  emoji: '🌊', fn: playWhiteNoise },
  { label: 'Brown Noise',   emoji: '🟤', fn: playBrownNoise },
  { label: 'مقهى',          emoji: '☕', fn: playCafe       },
  { label: 'غابة',          emoji: '🌿', fn: playForest     },
];

// ─── Component ───────────────────────────────────────────────────────────────
const NotificationPanelTimer = () => {
  const { isRunning, isPaused, pauseTimer, resumeTimer, stopTimer } = useChronometer();

  const audioCtxRef  = useRef(null);
  const soundHandleRef = useRef(null);   // { stop() }
  const [isMusicOn, setIsMusicOn]   = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Stop music when panel disappears
  useEffect(() => {
    if (!isRunning && !isPaused) {
      stopSound();
      setIsMusicOn(false);
    }
  }, [isRunning, isPaused]);

  // Cleanup on unmount
  useEffect(() => () => stopSound(), []);

  function getCtx() {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function stopSound() {
    soundHandleRef.current?.stop();
    soundHandleRef.current = null;
  }

  function startSound(idx) {
    stopSound();
    const ctx = getCtx();
    soundHandleRef.current = SOUNDS[idx].fn(ctx);
  }

  const handleToggleMusic = () => {
    if (isMusicOn) {
      stopSound();
      setIsMusicOn(false);
    } else {
      startSound(selectedIdx);
      setIsMusicOn(true);
    }
  };

  const handleSelectSound = (idx) => {
    setMenuAnchor(null);
    setSelectedIdx(idx);
    if (isMusicOn) {
      startSound(idx); // seamlessly switch
    }
  };

  if (!isRunning && !isPaused) return null;

  const sound = SOUNDS[selectedIdx];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: isPaused
          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '12px 14px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: isPaused
          ? '0 8px 24px rgba(245,158,11,0.4)'
          : '0 8px 24px rgba(16,185,129,0.4)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        minWidth: '150px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.2)',
        animation: 'slideInRight 0.4s ease-out',
      }}
    >
      {/* Status Chip */}
      <Chip
        icon={<TimerIcon sx={{ fontSize: 14, color: 'white !important' }} />}
        label={isPaused ? 'En pause' : 'En cours'}
        size="small"
        sx={{
          backgroundColor: 'rgba(255,255,255,0.25)',
          color: 'white',
          fontWeight: '700',
          fontSize: '11px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          '& .MuiChip-icon': { color: 'white' },
        }}
      />

      {/* Timer display */}
      <Box sx={{
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '8px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.3)',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <DisplayTimer />
      </Box>

      {/* Pause / Resume */}
      <Button
        onClick={isPaused ? resumeTimer : pauseTimer}
        startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
        fullWidth
        sx={{
          padding: '8px 12px', borderRadius: '10px',
          background: isPaused
            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white', fontWeight: '700', fontSize: '12px', textTransform: 'none',
          border: '1px solid rgba(255,255,255,0.3)',
          '&:hover': { transform: 'translateY(-2px)' },
          transition: 'all 0.3s ease',
        }}
      >
        {isPaused ? 'استئناف' : 'إيقاف'}
      </Button>

      {/* Stop definitively */}
      <Button
        onClick={stopTimer}
        startIcon={<StopIcon />}
        fullWidth
        sx={{
          padding: '8px 12px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white', fontWeight: '700', fontSize: '12px', textTransform: 'none',
          boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          border: '1px solid rgba(255,255,255,0.3)',
          '&:hover': { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', transform: 'translateY(-2px)' },
          transition: 'all 0.3s ease',
        }}
      >
        إيقاف نهائي
      </Button>

      {/* ── Music row ── */}
      <Box sx={{
        width: '100%',
        borderTop: '1px solid rgba(255,255,255,0.25)',
        paddingTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {/* Toggle silence ↔ sound */}
        <Button
          onClick={handleToggleMusic}
          startIcon={isMusicOn ? <MusicNoteIcon sx={{ fontSize: 15 }} /> : <VolumeOffIcon sx={{ fontSize: 15 }} />}
          fullWidth
          sx={{
            padding: '7px 10px', borderRadius: '10px',
            background: isMusicOn ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)',
            color: 'white', fontWeight: '700', fontSize: '12px', textTransform: 'none',
            border: isMusicOn ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.25)',
            '&:hover': { background: 'rgba(255,255,255,0.35)' },
            transition: 'all 0.3s ease',
          }}
        >
          {isMusicOn ? `${sound.emoji} ${sound.label}` : 'صامت'}
        </Button>

        {/* Sound picker — only when music is on */}
        {isMusicOn && (
          <Tooltip title="غيّر الصوت" placement="left">
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '8px', padding: '6px', flexShrink: 0,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.35)' },
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>⚙️</span>
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Dropdown menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '2px solid #e5e7eb',
            minWidth: '170px',
          },
        }}
      >
        {SOUNDS.map((s, idx) => (
          <MenuItem
            key={s.label}
            onClick={() => handleSelectSound(idx)}
            selected={selectedIdx === idx}
            sx={{
              fontWeight: '600', fontSize: '13px',
              borderRadius: '8px', margin: '4px 8px', gap: '8px',
              '&.Mui-selected': {
                background: 'linear-gradient(135deg,rgba(102,126,234,0.15) 0%,rgba(118,75,162,0.15) 100%)',
                color: '#667eea',
              },
            }}
          >
            {s.emoji} {s.label}
          </MenuItem>
        ))}
      </Menu>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Box>
  );
};

export default NotificationPanelTimer;