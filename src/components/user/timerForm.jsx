import React, { useState } from 'react'; 
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Box } from '@mui/material';
import Stopwatch from './timer/Stopwatch';
import { useChronometer } from '../context/ChronometerContext';

function TimerForm() {
const { isRunning, startTimer, stopTimer, time } = useChronometer();
  const [textInput, setTextInput] = useState('');
  const [subject, setSubject] = useState('');

  const handleStart = () => {
    if (textInput && subject) {
      startTimer({ description: textInput, subject });
    }
  };

  const handleStop = () => {
    stopTimer();
  }; 

  return (
   
    <Box component="form" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

      <TextField
        label="Description"
        variant="outlined"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
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
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          textInput={textInput}
          subject={subject}
        /> 



      </Box>
    </Box>
    
  );
}

export default TimerForm;
