import React, { useState, useEffect } from 'react';
import PaginatedTable from '../utilComponent/PaginatedTable';
import TimerForm from './timerForm';
import { useAuth } from "../context/AuthContext";
import { useChronometer } from '../context/ChronometerContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
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
  ResponsiveContainer,
  Cell,
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

  // Calculate total time
  const totalMinutes = filteredTimers.reduce((acc, timer) => acc + toMinutes(timer.elapsedTime), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Reset filter & remove from localStorage
  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);

    const currentFilter = JSON.parse(localStorage.getItem('filter_stat') || '{}');
    delete currentFilter.chrono;
    localStorage.setItem('filter_stat', JSON.stringify(currentFilter));
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            border: '2px solid #667eea',
          }}
        >
          <Typography sx={{ fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
            {payload[0].payload.day}
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
            Temps: {payload[0].value} heures
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ paddingY: '32px' }}>
      {/* Header */}
      <Box sx={{ marginBottom: '32px', textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Chronomètre
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          Suivez et analysez votre temps d'étude
        </Typography>
      </Box>

      {/* Timer Form */}
      <Box sx={{ marginBottom: '32px' }}>
        <TimerForm fetchTimers={fetchTimers} />
      </Box>

      {/* Filter Card */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <TimerIcon sx={{ color: 'white', fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}
            >
              Filtrer par période
            </Typography>
          </Box>
          {filteredTimers.length > 0 && (
            <Chip
              label={`${filteredTimers.length} session(s)`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                fontWeight: '700',
                backdropFilter: 'blur(10px)',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ padding: '28px', backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            {/* Start Date */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <CalendarIcon sx={{ color: '#667eea', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                  Date de début
                </Typography>
              </Box>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Début"
                customInput={
                  <Button
                    fullWidth
                    sx={{
                      justifyContent: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      color: startDate ? '#1a1a1a' : '#9ca3af',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'none',
                      backgroundColor: 'white',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {startDate ? startDate.toLocaleDateString('fr-FR') : "Date de début"}
                  </Button>
                }
              />
            </Box>

            {/* End Date */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <DateRangeIcon sx={{ color: '#667eea', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '13px' }}>
                  Date de fin
                </Typography>
              </Box>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Fin"
                customInput={
                  <Button
                    fullWidth
                    sx={{
                      justifyContent: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      color: endDate ? '#1a1a1a' : '#9ca3af',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'none',
                      backgroundColor: 'white',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {endDate ? endDate.toLocaleDateString('fr-FR') : "Date de fin"}
                  </Button>
                }
              />
            </Box>

            {/* Reset Button */}
            <Button
              variant="contained"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
              sx={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: '700',
                fontSize: '14px',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Réinitialiser
            </Button>
          </Box>

          {/* Date Range Summary */}
          {startDate && endDate && (
            <Paper
              sx={{
                marginTop: '20px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: '600', fontSize: '13px' }}>
                {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
              </Typography>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                <Chip
                  label={`${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} jours`}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '11px',
                  }}
                />
                <Chip
                  label={`${totalHours}h ${remainingMinutes}m`}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '11px',
                  }}
                />
              </Box>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <BarChartIcon sx={{ color: 'white', fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}
            >
              Temps par jour
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}
            >
              Visualisation de votre activité quotidienne
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ padding: '32px' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={1} />
                    <stop offset="100%" stopColor="#764ba2" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  label={{ value: 'Heures', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontWeight: 600 } }}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', padding: '60px 20px' }}>
              <BarChartIcon sx={{ fontSize: 64, color: '#9ca3af', marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: '600' }}>
                Aucune donnée disponible
              </Typography>
              <Typography sx={{ color: '#9ca3af', marginTop: '8px' }}>
                Démarrez un chronomètre pour voir vos statistiques
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <TableChartIcon sx={{ color: 'white', fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}
            >
              Historique des sessions
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}
            >
              Détails de toutes vos sessions de travail
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ padding: '24px' }}>
          <PaginatedTable
            columns={columns}
            rows={filteredTimers}
            actualResponse={actualResponse}
            fetchTimers={fetchTimers}
          />
        </CardContent>
      </Card>

      <style>
        {`
          .react-datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker {
            border-radius: 16px;
            border: 2px solid #e5e7eb;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          .react-datepicker__header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-bottom: none;
            border-radius: 14px 14px 0 0;
            padding: 16px;
          }
          .react-datepicker__current-month {
            color: white;
            font-weight: 700;
            font-size: 16px;
          }
          .react-datepicker__day-name {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
          }
          .react-datepicker__day {
            border-radius: 8px;
            transition: all 0.2s ease;
            font-weight: 600;
          }
          .react-datepicker__day:hover {
            background-color: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }
          .react-datepicker__day--selected {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            font-weight: 700;
          }
          .react-datepicker__day--keyboard-selected {
            background-color: rgba(102, 126, 234, 0.2);
            color: #667eea;
          }
          .react-datepicker__navigation-icon::before {
            border-color: white;
          }
        `}
      </style>
    </Container>
  );
};

export default Chronometer;