import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';
import Box from '@mui/material/Box';
import { timersApi } from '../../apis/timerApi';
import { useAuth } from '../context/AuthContext';

function TimerForm() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [textInput, setTextInput] = useState('');
  const [subject, setSubject] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    const savedIsRunning = localStorage.getItem('isRunning') === 'true';
    const savedStartTime = parseInt(localStorage.getItem('startTime'), 10);
    const savedTimerId = localStorage.getItem('timerId');

    if (savedIsRunning && !isNaN(savedStartTime)) {
      const currentTime = Date.now();
      setElapsedTime(currentTime - savedStartTime);
      setIsRunning(true);
      setTimerId(savedTimerId);

      const newTimer = setInterval(() => {
        setElapsedTime(Date.now() - savedStartTime);
      }, 1000);
      setTimer(newTimer);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const handleInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isRunning) {
      clearInterval(timer);
      setIsRunning(false);
      setElapsedTime(0);

      try {
        console.log("I will stop", timerId );
        console.log("I will stop", user );
        await timersApi.stopTimer(user, timerId);
        
        
      } catch (error) {
        console.error('Failed to stop timer:', error);
      }
      localStorage.setItem('isRunning', 'false');
      localStorage.removeItem('startTime');
      localStorage.removeItem('timerId');

     
    } else {
      const startTime = Date.now();
      localStorage.setItem('startTime', startTime);
      const newTimer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      setTimer(newTimer);
      setIsRunning(true);
      localStorage.setItem('isRunning', 'true');

      try {
        const response = await timersApi.startTimer(user, { description: textInput, subject, startTime });
        const newTimerId = response.data.id; // Assuming the API returns an object with an id field
        setTimerId(newTimerId);
        localStorage.setItem('timerId', newTimerId);
      } catch (error) {
        console.error('Failed to start timer:', error);
      }
    }
  };

  const formatElapsedTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
    >
      <TextField
        label="Description"
        variant="outlined"
        value={textInput}
        onChange={handleInputChange}
        sx={{ flexGrow: 1 }}
      />
      <FormControl variant="outlined" sx={{ minWidth: 150 }}>
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
      <Button type="submit" variant="contained" color="primary" sx={{ marginLeft: 'auto' }}>
        {isRunning ? 'Stop' : 'Start'}
      </Button>
      <Box sx={{ marginLeft: 2 }}>
        <span>{formatElapsedTime(elapsedTime)}</span>
      </Box>
    </Box>
  );
}

export default TimerForm;
