import React, { useEffect, useState } from "react";
import "./Stopwatch.css";
import { Button } from "@mui/material";
import StopwatchDisplay from "./StopwatchDisplay";

const Stopwatch = ({ isRunning, onStart, onStop, textInput, subject }) => {
  const [status, setStatus] = useState(isRunning ? 'running' : 'stopped');
  const [startButtonDisabled, setStartButtonDisabled] = useState(true);
  const [value, setValue] = useState(0);
  const [buttonText, setButtonText] = useState(isRunning ? 'Pause' : 'Start');

useEffect(() => {
    setStartButtonDisabled(textInput === '' || subject === '');
  }, [textInput, subject]);


  useEffect(() => {
    let interval = null;

    if (status === 'running') {
         interval = setInterval(() => {
           setValue((prevState) => prevState + 10);
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
  };

  const handleResume = () => {
    setStatus('running');
  };

  const handleStart = () => {
    onStart();
    setStatus('running');
  };

  const handleStop = () => {
    onStop();
    setStatus('stopped');
    setValue(0);
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
