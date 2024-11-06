import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import StopwatchDisplay from './StopwatchDisplay';
import { useChronometer } from '../../context/ChronometerContext';

const Stopwatch = ({ isRunning, onStart, onStop, textInput, subject }) => {
  const { time, startTimer, stopTimer } = useChronometer();
  const [startButtonDisabled, setStartButtonDisabled] = useState(true);

  useEffect(() => {
    setStartButtonDisabled(textInput === '' || subject === '');
  }, [textInput, subject]);

  const handleStart = () => {
    onStart();
  };

  const handleStop = () => {
    onStop();
  };

  return (
    <div className="stopwatch-container">
      <StopwatchDisplay value={time} />
      <div className="button-container">
        {isRunning ? (
          <Button variant="outlined" color="error" onClick={handleStop}>
            Stop
          </Button>
        ) : (
          <Button variant="outlined" onClick={handleStart} disabled={startButtonDisabled}>
            Start
          </Button>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;

