import React from 'react';
import DisplayTimer from './DisplayTimer';
import { useChronometer } from '../../context/ChronometerContext';
import { Box, Button, Typography, Chip } from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

const NotificationPanelTimer = () => {
  const { isRunning, isPaused, pauseTimer, resumeTimer } = useChronometer();

  // Only render the timer panel if the chronometer is running or paused
  if (!isRunning && !isPaused) return null;

  return (
    <Box
      sx={{
        marginTop: '14px',
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
          ? '0 8px 24px rgba(245, 158, 11, 0.4)'
          : '0 8px 24px rgba(16, 185, 129, 0.4)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        minWidth: '140px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideInRight 0.4s ease-out',
      }}
    >
      {/* Status Chip */}
      <Chip
        icon={<TimerIcon sx={{ fontSize: 14, color: 'white !important' }} />}
        label={isPaused ? 'En pause' : 'En cours'}
        size="small"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          color: 'white',
          fontWeight: '700',
          fontSize: '11px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          '& .MuiChip-icon': {
            color: 'white',
          },
        }}
      />

      {/* Display Timer */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <DisplayTimer />
      </Box>

      {/* Pause/Resume Button */}
      <Button
        onClick={isPaused ? resumeTimer : pauseTimer}
        startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
        fullWidth
        sx={{
          padding: '8px 12px',
          borderRadius: '10px',
          background: isPaused
            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          fontWeight: '700',
          fontSize: '12px',
          textTransform: 'none',
          boxShadow: isPaused
            ? '0 4px 12px rgba(59, 130, 246, 0.3)'
            : '0 4px 12px rgba(245, 158, 11, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          '&:hover': {
            background: isPaused
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            transform: 'translateY(-2px)',
            boxShadow: isPaused
              ? '0 6px 16px rgba(59, 130, 246, 0.4)'
              : '0 6px 16px rgba(245, 158, 11, 0.4)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {isPaused ? 'استئناف' : 'إيقاف'}
      </Button>

      <style>
        {`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default NotificationPanelTimer;