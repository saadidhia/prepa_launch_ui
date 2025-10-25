import React, { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Subject as SubjectIcon,
  Timer as TimerIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import Stopwatch from './timer/Stopwatch';
import { useChronometer } from '../context/ChronometerContext';
import subjects from '../../subjects';
import { useAuth } from '../context/AuthContext';

function TimerForm({ fetchTimers }) {
  const { isRunning, startTimer, stopTimer, time } = useChronometer();
  const [textInput, setTextInput] = useState('');
  const [subject, setSubject] = useState('');
  const Auth = useAuth();
  const user = Auth.getUser();
  const userSubjects = subjects.filter(subject => subject.section.includes(user.data.field));

  const handleStart = () => {
    if (textInput && subject) {
      startTimer({ description: textInput, subject });
    }
  };

  const handleStop = async () => {
    const stoppedChronometer = await stopTimer();
    if (stoppedChronometer) {
      fetchTimers();
    }
  };

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
          <Typography
            variant="h6"
            sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}
          >
            {isRunning ? 'Session en cours' : 'Nouvelle session'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}
          >
            {isRunning ? 'Le chronomètre est actif' : 'Démarrez votre session de travail'}
          </Typography>
        </Box>
        {isRunning && (
          <Chip
            icon={<PlayArrowIcon sx={{ color: 'white !important' }} />}
            label="En cours"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: 'white',
              fontWeight: '700',
              backdropFilter: 'blur(10px)',
            }}
          />
        )}
      </Box>

      <CardContent sx={{ padding: '28px', backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          {/* Description Input */}
          <Box sx={{ flex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <DescriptionIcon sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                Description
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Ex: Révision du cours de physique"
              variant="outlined"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isRunning}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              }}
            />
          </Box>

          {/* Subject Select */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <SubjectIcon sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                Matière
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
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                    borderWidth: '2px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                  },
                  '& .MuiSelect-select': {
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em style={{ color: '#9ca3af' }}>Sélectionner</em>
                </MenuItem>
                {userSubjects.map((subject, index) => (
                  <MenuItem key={index} value={subject.name}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Stopwatch Component */}
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

        {/* Info Message */}
        {!isRunning && (
          <Box
            sx={{
              marginTop: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(102, 126, 234, 0.05)',
              border: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <TimerIcon sx={{ color: '#667eea', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
              Remplissez la description et la matière, puis cliquez sur démarrer pour commencer votre session
            </Typography>
          </Box>
        )}

        {/* Running Info */}
        {isRunning && textInput && subject && (
          <Box
            sx={{
              marginTop: '20px',
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: '#059669', fontWeight: '700', marginBottom: '4px' }}>
                Session active
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>
                {textInput} - {subject}
              </Typography>
            </Box>
            <Chip
              icon={<PlayArrowIcon />}
              label="En cours"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontWeight: '700',
                fontSize: '12px',
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TimerForm;