import React from 'react';
import { Dialog, DialogContent, Box, Typography, IconButton } from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
} from '@mui/icons-material';
import { useChronometer } from '../context/ChronometerContext';

const formatTime = (ms) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

function DocumentViewerModal({ open, onClose, documentUrl, onStop }) {
  const { time, isPaused, pauseTimer, resumeTimer } = useChronometer();

  if (!documentUrl) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(documentUrl);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '92vw',
          height: '92vh',
          maxWidth: '92vw',
          maxHeight: '92vh',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          m: 0,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <PdfIcon sx={{ color: 'white', fontSize: 22 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>
          وثيقة المراجعة
        </Typography>
      </Box>

      {/* Document area */}
      <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {isImage ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#1a1a2e',
              p: 3,
              minHeight: 0,
            }}
          >
            <img
              src={documentUrl}
              alt="وثيقة المراجعة"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            />
          </Box>
        ) : (
          <iframe
            src={documentUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block', flex: 1, minHeight: 0 }}
            title="وثيقة المراجعة"
          />
        )}
      </DialogContent>

      {/* Chronometer footer */}
      <Box
        sx={{
          flexShrink: 0,
          px: 1.5,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Pill — only the controls get the color */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 0.5,
            borderRadius: '20px',
            background: isPaused
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'background 0.3s ease',
          }}
        >
          {/* Pause / Resume */}
          <IconButton
            onClick={isPaused ? resumeTimer : pauseTimer}
            sx={{
              width: 26, height: 26,
              bgcolor: 'rgba(255,255,255,0.18)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.35)',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.32)', transform: 'scale(1.08)' },
            }}
          >
            {isPaused ? <ResumeIcon sx={{ fontSize: 13 }} /> : <PauseIcon sx={{ fontSize: 13 }} />}
          </IconButton>

          {/* Timer display */}
          <Typography
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: '18px',
              fontFamily: 'monospace',
              letterSpacing: '2px',
              lineHeight: 1,
            }}
          >
            {formatTime(time)}
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {isPaused ? 'متوقف' : 'قيد التنفيذ'}
          </Typography>

          {/* Stop */}
          <IconButton
            onClick={onStop}
            sx={{
              width: 26, height: 26,
              bgcolor: 'rgba(239,68,68,0.25)',
              color: 'white',
              border: '1.5px solid rgba(239,68,68,0.6)',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#ef4444', borderColor: '#ef4444', transform: 'scale(1.08)' },
            }}
          >
            <StopIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
}

export default DocumentViewerModal;
