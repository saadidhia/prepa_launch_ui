import React from "react";
import "./Stopwatch.css";

const StopwatchDisplay = ({ value }) => {
  const totalSeconds = Math.floor(value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Formatting to ensure two digits with leading zeros
  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="time-display">
      <div>{formatNumber(hours)}</div>:
      <div>{formatNumber(minutes)}</div>:
      <div>{formatNumber(seconds)}</div>
    </div>
  );
};

export default StopwatchDisplay;
