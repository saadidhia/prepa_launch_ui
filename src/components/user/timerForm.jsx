import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';
import Box from '@mui/material/Box';
import { timersApi } from '../../apis/timerApi';
import { useAuth } from '../context/AuthContext';
import Stopwatch from './timer/Stopwatch';

function TimerForm({ onTimerUpdate }) {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [textInput, setTextInput] = useState('');
  const [subject, setSubject] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerId, setTimerId] = useState(null);

  // Restore timer state from localStorage when component mounts
  useEffect(() => {
    const savedIsRunning = localStorage.getItem('isRunning') === 'true';
    const savedTimerId = localStorage.getItem('timerId');
    const savedStartTime = localStorage.getItem('startTime');
    const savedElapsedTime = parseInt(localStorage.getItem('elapsedTime'), 10) || 0;

    if (savedIsRunning && savedStartTime) {
      const currentTime = Date.now();
      const timeElapsedSinceStart = currentTime - parseInt(savedStartTime, 10);
      setElapsedTime(savedElapsedTime + timeElapsedSinceStart); // Update elapsed time
      setIsRunning(true);
      setTimerId(savedTimerId);
    }
  }, []);

  // Update localStorage when timer state changes
  useEffect(() => {
    localStorage.setItem('elapsedTime', elapsedTime);
    localStorage.setItem('isRunning', isRunning.toString());
    if (!isRunning) {
      localStorage.removeItem('startTime');
      localStorage.removeItem('timerId');
    }
  }, [elapsedTime, isRunning]);

  // Timer interval to update elapsed time
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      const startTime = Date.now();
      intervalId = setInterval(() => {
        const newElapsedTime = elapsedTime + (Date.now() - startTime);
        setElapsedTime(newElapsedTime);
      }, 1000);
    }
    return () => clearInterval(intervalId); // Cleanup interval on unmount or when isRunning changes
  }, [isRunning]);

  const handleInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleStart = async () => {
    if (textInput === '' || subject === '') return;

    const startTime = Date.now();
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('isRunning', 'true');
    setElapsedTime(0); // Reset elapsed time when starting a new timer

    try {
      const response = await timersApi.startTimer(user, { description: textInput, subject, startTime });
      const newTimerId = response.data.id;
      setTimerId(newTimerId);
      localStorage.setItem('timerId', newTimerId);
      onTimerUpdate();
      setIsRunning(true);
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleStop = async () => {
    try {
      await timersApi.stopTimer(user, timerId);
      localStorage.setItem('isRunning', 'false');
      setIsRunning(false);
      setTextInput('');
      setSubject('');
      onTimerUpdate();
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  const formatElapsedTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Box
      component="form"
      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
    >
      <TextField
        label="Description"
        variant="outlined"
        value={textInput}
        onChange={handleInputChange}
        sx={{ flexGrow: 1 }}
        disabled={isRunning}
      />
      <FormControl variant="outlined" sx={{ minWidth: 150 }} disabled={isRunning}>
        <InputLabel id="subject-label">Matière</InputLabel>
        <Select
          labelId="subject-label"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          label="Matière"
        >
          <MenuItem value="MATH1">Math</MenuItem>
          <MenuItem value="PHYSIQUE">Physique</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ marginLeft: 2 }}>
        <Stopwatch
          textInput={textInput}
          subject={subject}
          isRunning={isRunning}
          elapsedTime={elapsedTime}
          formattedElapsedTime={formatElapsedTime(elapsedTime)} // Pass the formatted time
          onStart={handleStart}
          onStop={handleStop}
        />
      </Box>
    </Box>
  );
}

export default TimerForm;
