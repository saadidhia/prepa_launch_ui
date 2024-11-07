import React from 'react';
import { useChronometer } from '../../context/ChronometerContext';

const DisplayTimer = () => {
    const { isRunning, startTimer, stopTimer, time } = useChronometer();

  const formatTime = (time) => {

    console.log("lalala", time)
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div>
      <h3>{formatTime(time)}</h3>
    </div>
  );
};

export default DisplayTimer;
