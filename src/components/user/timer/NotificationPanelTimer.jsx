import React from 'react';
import DisplayTimer from './DisplayTimer';
import { useChronometer } from '../../context/ChronometerContext';

const NotificationPanelTimer = () => {
  const { isRunning } = useChronometer();

  if (!isRunning) return null; // Only render if the timer is running

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#4CAF50', // Green background
      padding: '15px',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <p style={{ margin: '0', fontWeight: 'bold', textAlign: 'center' }}>
        Timer is running...
      </p>
      <DisplayTimer />
    </div>
  );
};


export default NotificationPanelTimer;
