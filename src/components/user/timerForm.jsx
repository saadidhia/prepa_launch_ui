import React, { useState } from 'react'; 
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Box } from '@mui/material';
import Stopwatch from './timer/Stopwatch';
import { useChronometer } from '../context/ChronometerContext';
import subjects from '../../subjects'
import { useAuth } from '../context/AuthContext';
function TimerForm({fetchTimers}) {
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
                        {userSubjects.map((subject, index) => (
                            <MenuItem key={index} value={subject.name}>
                                {subject.name}
                            </MenuItem>
                        ))}
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
