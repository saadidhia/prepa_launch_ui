import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Stop as StopIcon } from '@mui/icons-material';
import { useChronometer } from '../../context/ChronometerContext';

const Stopwatch = ({ onStart, onStop, textInput, subject }) => {
  const { isRunning, time } = useChronometer();

  // CRITICAL FIX: Format time correctly from milliseconds
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartClick = () => {
    if (!textInput || !subject) {
      alert('Veuillez remplir la description et la matière');
      return;
    }
    onStart();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Time Display */}
      <Box
        sx={{
          background: isRunning
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '12px 24px',
          minWidth: '140px',
          textAlign: 'center',
          boxShadow: isRunning
            ? '0 6px 20px rgba(16, 185, 129, 0.3)'
            : '0 6px 20px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: '700',
            fontSize: '24px',
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}
        >
          {formatTime(time)}
        </Typography>
      </Box>

      {/* Start/Stop Button */}
      <IconButton
        onClick={isRunning ? onStop : handleStartClick}
        disabled={!isRunning && (!textInput || !subject)}
        sx={{
          width: 56,
          height: 56,
          background: isRunning
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          boxShadow: isRunning
            ? '0 6px 20px rgba(239, 68, 68, 0.4)'
            : '0 6px 20px rgba(16, 185, 129, 0.4)',
          '&:hover': {
            background: isRunning
              ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            transform: 'scale(1.05)',
          },
          '&:disabled': {
            background: '#e5e7eb',
            color: '#9ca3af',
            boxShadow: 'none',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {isRunning ? <StopIcon sx={{ fontSize: 28 }} /> : <PlayArrowIcon sx={{ fontSize: 28 }} />}
      </IconButton>

      {/* Status Text */}
      <Typography
        variant="caption"
        sx={{
          color: isRunning ? '#059669' : '#667eea',
          fontWeight: '700',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {isRunning ? 'En cours' : 'Prêt'}
      </Typography>
    </Box>
  );
};

export default Stopwatch;