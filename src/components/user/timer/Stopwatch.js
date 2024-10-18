import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import StopwatchDisplay from "./StopwatchDisplay";

const Stopwatch = ({ isRunning, onStart, onStop, textInput, subject }) => {
  const [status, setStatus] = useState(isRunning ? 'running' : 'stopped');
  const [startButtonDisabled, setStartButtonDisabled] = useState(true);
  const [value, setValue] = useState(0); // Initial value

  // Restore the elapsed time and status on page refresh
  useEffect(() => {
    const savedIsRunning = localStorage.getItem('isRunning') === 'true';
    const savedElapsedTime = parseInt(localStorage.getItem('elapsedTime'), 10) || 0;
    const savedStartTime = parseInt(localStorage.getItem('startTime'), 10) || 0;

    if (savedIsRunning) {
      const currentTime = Date.now();
      const timeElapsedSinceStart = currentTime - savedStartTime;
      setValue(savedElapsedTime + timeElapsedSinceStart); // Restore timer value based on elapsed time
      setStatus('running');
    } else {
      setValue(savedElapsedTime); // Just restore the last elapsed time
    }
  }, []);

  useEffect(() => {
    setStartButtonDisabled(textInput === '' || subject === '');
  }, [textInput, subject]);

  useEffect(() => {
    let interval = null;

    if (status === 'running') {
      interval = setInterval(() => {
        setValue((prevState) => {
          const newElapsedTime = prevState + 10;
          localStorage.setItem('elapsedTime', newElapsedTime); // Update elapsed time in localStorage
          return newElapsedTime;
        });
      }, 10);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [status]);

  const handlePause = () => {
    setStatus('paused');
    localStorage.setItem('isRunning', 'false'); // Sync with localStorage
  };

  const handleResume = () => {
    const startTime = Date.now();
    localStorage.setItem('startTime', startTime); // Set the new start time
    setStatus('running');
    localStorage.setItem('isRunning', 'true'); // Sync with localStorage
  };

  const handleStart = () => {
    const startTime = Date.now();
    localStorage.setItem('startTime', startTime); // Set the start time when timer begins
    localStorage.setItem('elapsedTime', '0'); // Reset elapsed time
    onStart();
    setStatus('running');
    localStorage.setItem('isRunning', 'true'); // Sync with localStorage
  };

  const handleStop = () => {
    onStop();
    setStatus('stopped');
    setValue(0);
    localStorage.setItem('isRunning', 'false'); // Sync with localStorage
    localStorage.setItem('elapsedTime', '0'); // Reset elapsed time
  };

  return (
    <div className="stopwatch-container">
      <StopwatchDisplay value={value} />
      <div className="button-container">
        {status === 'stopped' ? (
          <Button variant="outlined" onClick={handleStart} disabled={startButtonDisabled}>
            Start
          </Button>
        ) : status === 'running' ? (
          <>
            <Button variant="outlined" color="error" onClick={handlePause}>
              Pause
            </Button>
            <Button variant="outlined" onClick={handleStop}>
              Stop
            </Button>
          </>
        ) : status === 'paused' ? (
          <>
            <Button variant="outlined" onClick={handleResume}>
              Resume
            </Button>
            <Button variant="outlined" onClick={handleStop}>
              Stop
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Stopwatch;
