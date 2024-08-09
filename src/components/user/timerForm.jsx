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

 useEffect(() => {
    const savedIsRunning = localStorage.getItem('isRunning') === 'true';
    const savedTimerId = localStorage.getItem('timerId');

    if (savedIsRunning) {
      setIsRunning(true);
      setTimerId(savedTimerId);
    }
  }, []);

  const handleInputChange = (event) => {
    setTextInput(event.target.value);
  };


const handleStart = async () => {
    if (textInput === '' || subject === '') return;

    const startTime = Date.now();
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('isRunning', 'true');

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
      localStorage.removeItem('startTime');
      localStorage.removeItem('timerId');
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
        <InputLabel id="subject-label">Matiere</InputLabel>
        <Select
          labelId="subject-label"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          label="Matiere"
        >
          <MenuItem value="MATH1">Math</MenuItem>
          <MenuItem value="PHYSIQUE">Physique</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ marginLeft: 2 }}>
        <Stopwatch textInput={textInput} subject={subject} isRunning={isRunning} onStart={handleStart} onStop={handleStop} />
      </Box>
    </Box>
  );
}

export default TimerForm;
