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

// ─── YouTube video IDs (audio only matters, video is hidden) ─────────────────
// These are long lofi/ambient YouTube videos — free & always available
const SOUNDS = [
  { label: 'Lo-fi Beat',   emoji: '🎵', videoId: 'jfKfPfyJRdk' }, // lofi girl 24/7 ✅
  { label: 'مطر',          emoji: '🌧️', videoId: 'mPZkdNFkNps' }, // rain 8h ✅
  { label: 'ضوضاء بيضاء', emoji: '🌊', videoId: 'nMfPqeZjc2c' }, // white noise 10h ✅
  { label: 'مقهى', emoji: '☕', videoId: 'DSGyEsJ17cI' },
  { label: 'غابة',         emoji: '🌿', videoId: 'xNN7iTA57jM' }, // forest birds ✅
  { label: 'بيانو هادئ',  emoji: '🎹', videoId: 'lTRiuFIWV54' }, // calm piano study ✅ FIXED
];

let ytApiLoaded = false;

const NotificationPanelTimer = () => {
  const { isRunning, isPaused, pauseTimer, resumeTimer, stopTimer } = useChronometer();

  const playerRef    = useRef(null); // YouTube player instance
  const containerRef = useRef(null); // div where player mounts

  const [isMusicOn, setIsMusicOn] = useState(() =>
    localStorage.getItem('timer_music_on') === 'true'
  );
  const [selectedIdx, setSelectedIdx] = useState(() =>
    parseInt(localStorage.getItem('timer_music_idx') || '0', 10)
  );
  const [playerReady, setPlayerReady] = useState(false);
  const [menuAnchor,  setMenuAnchor]  = useState(null);

  // ── Load YouTube IFrame API once ─────────────────────────────────────────
  useEffect(() => {
    if (ytApiLoaded) return;
    ytApiLoaded = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  // ── Create player once API + DOM are ready ────────────────────────────────
  useEffect(() => {
    if (!isRunning && !isPaused) return;

    const initPlayer = () => {
      if (playerRef.current) return; // already created
      if (!window.YT || !window.YT.Player) return;
      if (!containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '1',
        width: '1',
        videoId: SOUNDS[selectedIdx].videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: SOUNDS[selectedIdx].videoId, // needed for loop
          mute: 0,
        },
        events: {
          onReady: (e) => {
            setPlayerReady(true);
            e.target.setVolume(70);
            // If music was ON before refresh, start playing
            if (isMusicOn) {
              e.target.playVideo();
            }
          },
        },
      });
    };

    // YT API may already be loaded
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Wait for API to call onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
        setPlayerReady(false);
      }
    };
  }, [isRunning, isPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop music when timer stops ───────────────────────────────────────────
  useEffect(() => {
    if (!isRunning && !isPaused) {
      try { playerRef.current?.stopVideo(); } catch (_) {}
      setIsMusicOn(false);
      localStorage.setItem('timer_music_on', 'false');
    }
  }, [isRunning, isPaused]);

  // ── Resume when tab becomes visible again ─────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isMusicOn && playerRef.current) {
        try { playerRef.current.playVideo(); } catch (_) {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isMusicOn]);

  if (!isRunning && !isPaused) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleMusic = () => {
    if (!playerRef.current || !playerReady) return;
    if (isMusicOn) {
      try { playerRef.current.pauseVideo(); } catch (_) {}
      setIsMusicOn(false);
      localStorage.setItem('timer_music_on', 'false');
    } else {
      try { playerRef.current.playVideo(); } catch (_) {}
      setIsMusicOn(true);
      localStorage.setItem('timer_music_on', 'true');
    }
  };

  const handleSelectSound = (idx) => {
    setMenuAnchor(null);
    setSelectedIdx(idx);
    localStorage.setItem('timer_music_idx', String(idx));
    if (playerRef.current && playerReady) {
      try {
        playerRef.current.loadVideoById({
          videoId: SOUNDS[idx].videoId,
          startSeconds: 0,
        });
        if (!isMusicOn) {
          playerRef.current.pauseVideo();
        }
      } catch (_) {}
    }
  };

  const sound = SOUNDS[selectedIdx];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: isPaused
          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '12px 14px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: isPaused
          ? '0 8px 24px rgba(245,158,11,0.4)'
          : '0 8px 24px rgba(102,126,234,0.4)',
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
      {/* Hidden YouTube player div */}
      <Box sx={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div ref={containerRef} />
      </Box>

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
          '&:hover': {
            background: isPaused
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            transform: 'translateY(-2px)',
          },
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
          '&:hover': {
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            transform: 'translateY(-2px)',
          },
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
        <Button
          onClick={handleToggleMusic}
          startIcon={isMusicOn
            ? <MusicNoteIcon sx={{ fontSize: 15 }} />
            : <VolumeOffIcon sx={{ fontSize: 15 }} />
          }
          disabled={!playerReady}
          fullWidth
          sx={{
            padding: '7px 10px', borderRadius: '10px',
            background: isMusicOn ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)',
            color: 'white', fontWeight: '700', fontSize: '12px', textTransform: 'none',
            border: isMusicOn
              ? '1px solid rgba(255,255,255,0.6)'
              : '1px solid rgba(255,255,255,0.25)',
            '&:hover': { background: 'rgba(255,255,255,0.35)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.4)' },
            transition: 'all 0.3s ease',
          }}
        >
          {!playerReady
            ? '...'
            : isMusicOn
              ? `${sound.emoji} ${sound.label}`
              : 'صامت'
          }
        </Button>

        {isMusicOn && playerReady && (
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

      {/* Sound picker dropdown */}
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
                background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
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