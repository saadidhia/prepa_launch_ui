import React, { useState, useEffect } from 'react';
import PaginatedTable from '../utilComponent/PaginatedTable';
import TimerForm from './timerForm';
import { useAuth } from "../context/AuthContext";
import { useChronometer } from '../context/ChronometerContext';
import { Box } from '@mui/material';
import DisplayTimer from './timer/DisplayTimer';
import {chronometersApi} from '../../apis/chronometersApi'


const columns = [
  { id: 'day', label: 'Jour' },
  { id: 'start', label: 'Debut' },
  { id: 'day_fin', label: 'Fin Jour' },
  { id: 'stop', label: 'Fin' },
  { id: 'elapsedTime', label: 'Duree'},
  { id: 'subject', label: 'Matiere' },
  { id: 'description', label: 'Description' },
];

const Chronometer = () => {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [timers, setTimers] = useState([]);
  const [actualResponse, setActualResponse] = useState([]);
  const { isRunning, startTimer, stopTimer, time } = useChronometer();

  
  const fetchTimers = async () => {
     try {
       const response = await chronometersApi.getChronometers(user);
       const data = response.data;
       console.log("timers", data);
       // Process the data to split the start and stop fields into day and time parts
       const processedData = data.map(timer => {
         const startDate = new Date(timer.start);
         const day = startDate.toISOString().split('T')[0]; // Get date part of start
         const start = startDate.toISOString().split('T')[1].split('.')[0]; // Get time part of start without milliseconds
 
         let day_fin = '';
         let stop = '';
 
         if (timer.stop) {
           const stopDate = new Date(timer.stop);
           day_fin = stopDate.toISOString().split('T')[0]; // Get date part of stop
           stop = stopDate.toISOString().split('T')[1].split('.')[0]; // Get time part of stop without milliseconds
         }
 
         return {
           ...timer,
           day,
           start,
           day_fin,
           stop,
         };
       });
 
       setTimers(processedData);
       setActualResponse(data)
     } catch (error) {
       console.error('Error fetching Timers:', error);
     }
   };
 
  /* const updateTimers = () => {
     //  fetchTimers();
     };*/
 
   useEffect(() => {
     fetchTimers();
  console.log("ttttttttttttttttttttttttttttttttttttt")
   }, []);


  return (
    <div style={{ padding: 20 }}>
      <h1>Timer</h1>
     <DisplayTimer />

      <TimerForm />
      <Box sx={{ marginLeft: 2 }}>
      </Box>
       <PaginatedTable
       columns={columns}
       rows={timers}
       actualResponse={actualResponse}
       fetchTimers={fetchTimers}
       /> 
    </div>
  );
};

export default Chronometer;