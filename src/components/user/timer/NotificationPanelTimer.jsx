import React from 'react';
import DisplayTimer from './DisplayTimer';
import { useChronometer } from '../../context/ChronometerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

const NotificationPanelTimer = () => {
  const { isRunning, isPaused, pauseTimer, resumeTimer } = useChronometer();

  // Only render the timer panel if the chronometer is running or paused
  if (!isRunning && !isPaused) return null;

  return (
    <div style={{
      marginTop: '14px',
      position: 'fixed',
      top: '10px',  // Move closer to the top
      right: '10px', // Move closer to the right
      backgroundColor: isPaused ? '#FFA500' : '#4CAF50',
      padding: '5px',
      borderRadius: '6px',
      color: '#fff',
      boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '120px', // Further reduce the width
    }}>
      <p style={{ margin: '0', fontSize: '0.8em', fontWeight: 'bold', textAlign: 'center' }}>
        {isPaused ? "Paused" : "Running"}
      </p>
      <DisplayTimer /> {/* Added space below the timer */}
      <button
        onClick={isPaused ? resumeTimer : pauseTimer}
        style={{
         // marginTop: '0px',
          padding: '4px 8px',
          backgroundColor: isPaused ? '#008CBA' : '#FFA500',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.8em', // Smaller font size for compactness
        }}
      >
        <FontAwesomeIcon icon={isPaused ? faPlay : faPause} style={{ marginRight: '2px' }} />
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};

export default NotificationPanelTimer;
