import React from "react";
import "./Stopwatch.css";

const StopwatchDisplay = ({ value }) => {
  return (
    <div className="time-display" >
      <div>{("0" + Math.floor((value / 60_000) % 60)).slice(-2)}</div>:
      <div>{("0" + Math.floor((value / 1_000) % 60)).slice(-2)}</div>:
      <div>{("0" + ((value / 10) % 1_000)).slice(-2)}</div>
    </div>
  );
};

export default StopwatchDisplay;
