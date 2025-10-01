import React, { useState, useEffect } from 'react';
import PaginatedTable from '../utilComponent/PaginatedTable';
import TimerForm from './timerForm';
import { useAuth } from "../context/AuthContext";
import { useChronometer } from '../context/ChronometerContext';
import { Box, Paper, Typography, Button } from '@mui/material';
import { chronometersApi } from '../../apis/chronometersApi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const columns = [
  { id: 'day', label: 'Jour' },
  { id: 'start', label: 'Début' },
  { id: 'day_fin', label: 'Fin Jour' },
  { id: 'stop', label: 'Fin' },
  { id: 'elapsedTime', label: 'Durée' },
  { id: 'subject', label: 'Matière' },
  { id: 'description', label: 'Description' },
];

const Chronometer = () => {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [timers, setTimers] = useState([]);
  const [actualResponse, setActualResponse] = useState([]);
  const { isRunning, startTimer, stopTimer, time } = useChronometer();

  // Load saved dates from localStorage
  const savedFilter = JSON.parse(localStorage.getItem('filter_stat') || '{}');
  const savedChrono = savedFilter.chrono || {};

  const [startDate, setStartDate] = useState(savedChrono.startDate ? new Date(savedChrono.startDate) : null);
  const [endDate, setEndDate] = useState(savedChrono.endDate ? new Date(savedChrono.endDate) : null);

  // Persist dates to localStorage whenever they change
  useEffect(() => {
    const currentFilter = JSON.parse(localStorage.getItem('filter_stat') || '{}');
    localStorage.setItem(
      'filter_stat',
      JSON.stringify({
        ...currentFilter,
        chrono: {
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null
        }
      })
    );
  }, [startDate, endDate]);

  // Convert ISO 8601 duration (PTxxHxxMxxS) into HH:mm:ss
  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+(\.\d+)?S)?/);
    if (!match) return "00:00:00";

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseFloat(match[3]) : 0;

    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = Math.floor(seconds).toString().padStart(2, '0');

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
  };

  const toMinutes = (hhmmss) => {
    const [h, m, s] = hhmmss.split(":").map(Number);
    return h * 60 + m + Math.floor(s / 60);
  };

  const fetchTimers = async () => {
    try {
      const response = await chronometersApi.getChronometers(user);
      const data = response.data;

      const processedData = data.map(timer => {
        const startDate = new Date(timer.start);
        const day = startDate.toISOString().split('T')[0];
        const start = startDate.toISOString().split('T')[1].split('.')[0];

        let day_fin = '';
        let stop = '';
        if (timer.stop) {
          const stopDate = new Date(timer.stop);
          day_fin = stopDate.toISOString().split('T')[0];
          stop = stopDate.toISOString().split('T')[1].split('.')[0];
        }

        const elapsedTime = formatDuration(timer.elapsedTime);
        return { ...timer, day, start, day_fin, stop, elapsedTime };
      });

      setTimers(processedData);
      setActualResponse(data);
    } catch (error) {
      console.error('Error fetching Timers:', error);
    }
  };

  useEffect(() => {
    fetchTimers();
  }, []);

  const filteredTimers = timers.filter(timer => {
    const date = new Date(timer.day);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });

  const dailySummary = filteredTimers.reduce((acc, timer) => {
    const minutes = toMinutes(timer.elapsedTime);
    if (!acc[timer.day]) acc[timer.day] = 0;
    acc[timer.day] += minutes;
    return acc;
  }, {});

  const chartData = Object.entries(dailySummary)
    .map(([day, minutes]) => ({
      day,
      hours: (minutes / 60).toFixed(2),
      minutes
    }))
    .sort((a, b) => new Date(a.day) - new Date(b.day));

  // Reset filter & remove from localStorage
  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);

    const currentFilter = JSON.parse(localStorage.getItem('filter_stat') || '{}');
    delete currentFilter.chrono;
    localStorage.setItem('filter_stat', JSON.stringify(currentFilter));
  };

  return (
    <div style={{ padding: 20 }}>
      <TimerForm fetchTimers={fetchTimers} />

      <Paper
        elevation={3}
        sx={{
          maxWidth: 1200,
          margin: "20px auto",
          padding: 3,
          borderRadius: 2,
          backgroundColor: "#f9f9f9"
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
              customInput={
                <Button variant="outlined" fullWidth>
                  {startDate ? startDate.toLocaleDateString() : "Date de début"}
                </Button>
              }
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              customInput={
                <Button variant="outlined" fullWidth>
                  {endDate ? endDate.toLocaleDateString() : "Date de fin"}
                </Button>
              }
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', flex: 0.5 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReset}
            >
              Réinitialiser le filtre
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ marginTop: 4 }}>
        <PaginatedTable
          columns={columns}
          rows={filteredTimers}
          actualResponse={actualResponse}
          fetchTimers={fetchTimers}
        />
      </Box>

      <Box sx={{ marginTop: 4 }}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Temps passé par jour (en heures)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Heures', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#1976d2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </div>
  );
};

export default Chronometer;
