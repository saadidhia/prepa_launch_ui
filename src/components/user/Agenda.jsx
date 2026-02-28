import React, { useState, useEffect } from 'react'
import AgendaFormular from '../small/agendaFormular'
import { useAuth } from '../context/AuthContext';
import { candidatsApi } from '../../apis/candidatsApi';
import { useNavigate } from "react-router-dom"
import { 
  Box, 
  Container, 
  Typography, 
  IconButton, 
  Card, 
  CardContent, 
  Chip, 
  LinearProgress,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  CalendarToday as CalendarTodayIcon,
  Notes as NotesIcon
} from '@mui/icons-material';

const WEEK_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function formatDateISO(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  return date.toISOString().slice(0, 10);
}

export default function ModernCalendar() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [agendas, setAgendas] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeAgenda, setActiveAgenda] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const response = await candidatsApi.getAgendas(user);
        setAgendas(response.data);
      } catch (err) {
        console.error('Error fetching agendas:', err);
        setError('Failed to load agendas');
      }
    };
    fetchAgendas();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'low': return '#60a5fa';
      case 'optional': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const getPriorityGradient = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'high': return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
      case 'low': return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
      case 'optional': return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
      default: return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
    }
  };

  const handleDeleteAgenda = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet agenda ?")) return;
    try {
      await candidatsApi.deleteAgenda(user, id);
      setAgendas(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Error deleting agenda:", err);
      alert("❌ Échec de la suppression de l'agenda.");
    }
  };

  const addEvent = (formData) => {
    const newAgenda = {
      ...formData,
      date: formatDateISO(selectedDay),
      alreadySpent: 0,
    };
    setAgendas([...agendas, newAgenda]);
    setShowModal(false);
  };

  const handlePlusClick = (agenda) => {
    setActiveAgenda(agenda);
    setInputVisible(true);
  };

  const handleAddNumber = async () => {
    if (!activeAgenda) return;

    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0 || num > activeAgenda.timeShouldSpent) {
      alert(`Veuillez saisir un nombre d'heures compris entre 0 et ${activeAgenda.timeShouldSpent}`);
      return;
    }

    const newAlreadySpent = (activeAgenda.alreadySpent || 0) + num;

    try {
      await candidatsApi.updateAgendaById(user, activeAgenda.id, newAlreadySpent);

      setAgendas(prev =>
        prev.map(ag =>
          ag.id === activeAgenda.id
            ? { ...ag, alreadySpent: newAlreadySpent }
            : ag
        )
      );

    } catch (err) {
      console.error("Error updating agenda:", err);
      alert("❌ Échec de la mise à jour de l'agenda");
    } finally {
      setInputVisible(false);
      setInputValue('');
    }
  };

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const days = [];
  for (let i = 0; i < startDay.getDay(); i++) days.push(null);
  for (let i = 1; i <= endDay.getDate(); i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));

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
          مواعيد امتحاناتي
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          خطط ونظّم فعالياتك
        </Typography>
      </Box>

      {/* Calendar Card */}
      <Card sx={{ 
        marginBottom: '32px', 
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
      }}>
        <CardContent sx={{ padding: isMobile ? '16px' : '32px' }}>
          {/* Month Navigation */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <IconButton 
              onClick={prevMonth}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: '700',
                color: '#1a1a1a',
                textTransform: 'capitalize',
              }}
            >
              {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </Typography>
            
            <IconButton 
              onClick={nextMonth}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* Calendar Grid */}
          <Grid container spacing={1}>
            {/* Week Days Header */}
            {WEEK_DAYS.map(day => (
              <Grid item xs={12/7} key={day}>
                <Box sx={{ 
                  textAlign: 'center',
                  fontWeight: '700',
                  color: '#6b7280',
                  fontSize: isMobile ? '12px' : '14px',
                  padding: '8px 0',
                }}>
                  {day}
                </Box>
              </Grid>
            ))}

            {/* Calendar Days */}
            {days.map((day, i) => {
              const dayEvents = day ? agendas.filter(ag => {
                const dateValue = ag.date || ag.eventTime;
                if (!dateValue) return false;
                const parsed = new Date(dateValue);
                if (isNaN(parsed)) return false;
                return formatDateISO(parsed) === formatDateISO(day);
              }) : [];

              return (
                <Grid item xs={12/7} key={i}>
                  <Paper
                    onClick={() => day && (setSelectedDay(day), setShowModal(true))}
                    sx={{
                      minHeight: isMobile ? '60px' : '100px',
                      padding: '8px',
                      cursor: day ? 'pointer' : 'default',
                      backgroundColor: day ? '#ffffff' : '#f3f4f6',
                      border: '2px solid',
                      borderColor: day ? '#e5e7eb' : '#d1d5db',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': day ? {
                        borderColor: '#667eea',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                      } : {},
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {day && (
                      <>
                        <Typography 
                          sx={{ 
                            fontWeight: '700',
                            fontSize: isMobile ? '14px' : '16px',
                            color: '#1a1a1a',
                            marginBottom: '4px',
                          }}
                        >
                          {day.getDate()}
                        </Typography>
                        
                        {/* Event indicators */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {dayEvents.slice(0, isMobile ? 1 : 2).map((ag, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                fontSize: isMobile ? '9px' : '11px',
                                background: getPriorityGradient(ag.priority),
                                color: 'white',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: '600',
                              }}
                            >
                              {ag.title}
                            </Box>
                          ))}
                          {dayEvents.length > (isMobile ? 1 : 2) && (
                            <Typography sx={{ fontSize: '10px', color: '#667eea', fontWeight: '600' }}>
                              +{dayEvents.length - (isMobile ? 1 : 2)} plus
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Agendas List */}
      <Box>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          جميع الفعاليات
          <Chip 
            label={agendas.length}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: '700',
            }}
          />
        </Typography>

        {agendas.length === 0 && (
          <Paper sx={{
            padding: '40px',
            textAlign: 'center',
            borderRadius: '20px',
            border: '2px dashed #e5e7eb',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}>
            <CalendarTodayIcon sx={{ fontSize: 64, color: '#9ca3af', marginBottom: '16px' }} />
            <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: '600' }}>
              لا توجد فعاليات
            </Typography>
            <Typography sx={{ color: '#9ca3af', marginTop: '8px' }}>
              اضغط على تاريخ لإنشاء فعالية جديدة
            </Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          {agendas.map((ag, i) => {
            const now = new Date();
            const remind = new Date(ag.remindTime);
            const event = new Date(ag.eventTime);
            const isActive = remind < now && now < event;

            const should = ag.timeShouldSpent || 0;
            const spent = ag.alreadySpent || 0;
            const percentage = should > 0 ? Math.min((spent / should) * 100, 100) : 0;
            const isCompleted = percentage >= 100;

            return (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '20px',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.15)',
                    transition: 'all 0.3s ease',
                    border: `3px solid ${getPriorityColor(ag.priority)}`,
                    position: 'relative',
                    background: isCompleted 
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)'
                      : 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
                    },
                  }}
                >
                  <CardContent sx={{ padding: '24px', position: 'relative' }}>
                    {/* Action Buttons */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      display: 'flex',
                      gap: '8px',
                    }}>
                      <IconButton
                        disabled={!isActive}
                        onClick={() => handlePlusClick(ag)}
                        sx={{
                          background: isActive 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : '#e5e7eb',
                          color: 'white',
                          width: '36px',
                          height: '36px',
                          '&:hover': isActive ? {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            transform: 'scale(1.1)',
                          } : {},
                          '&:disabled': {
                            color: '#9ca3af',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        onClick={() => handleDeleteAgenda(ag.id)}
                        sx={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          width: '36px',
                          height: '36px',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Priority Badge */}
                    <Chip
                      label={ag.priority || 'Normal'}
                      sx={{
                        background: getPriorityGradient(ag.priority),
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '11px',
                        height: '24px',
                        marginBottom: '12px',
                      }}
                    />

                    {/* Title */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '16px',
                        paddingRight: '80px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {ag.title}
                    </Typography>

                    {/* Event Details */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <EventIcon sx={{ fontSize: 18, color: '#667eea' }} />
                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px' }}>
                          {ag.eventTime && new Date(ag.eventTime).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: '#667eea' }} />
                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '13px' }}>
                         أول تذكير: {new Date(ag.remindTime).toLocaleDateString('fr-FR')} · {new Date(ag.remindTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Section */}
                    <Box sx={{ 
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      marginBottom: '16px',
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Typography variant="body2" sx={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                          التقدّم
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: '700', color: isCompleted ? '#22c55e' : '#667eea', fontSize: '13px' }}>
                          {percentage.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage}
                        sx={{
                          height: '8px',
                          borderRadius: '4px',
                          backgroundColor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: '4px',
                            background: isCompleted 
                              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {spent}h / {should}h
                        </Typography>
                        {isCompleted && (
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                        )}
                      </Box>
                    </Box>

                    {/* Notes */}
                    {ag.notes && ag.notes.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <NotesIcon sx={{ fontSize: 16, color: '#667eea' }} />
                          <Typography variant="body2" sx={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                           الملاحظات المرتبطة
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ag.notes.map((note, nIdx) => (
                            <Chip
                              key={nIdx}
                              label={note.title}
                              onClick={() => navigate(`/dashboard/notes?id=${note.id}`)}
                              sx={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                color: '#667eea',
                                fontWeight: '600',
                                fontSize: '12px',
                                border: '1px solid #c7d2fe',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  transform: 'scale(1.05)',
                                },
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Time Input Dialog */}
      <Dialog 
        open={inputVisible} 
        onClose={() => setInputVisible(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '8px',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontWeight: '700',
          color: '#1a1a1a',
        }}>
          {activeAgenda?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', marginBottom: '24px' }}>
            <Typography variant="body2" sx={{ color: '#6b7280', marginBottom: '4px' }}>
              الوقت المستغرق بالفعل
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: '700', color: '#667eea' }}>
              {activeAgenda?.alreadySpent || 0} heures
            </Typography>
          </Box>

          <TextField
            fullWidth
            type="number"
            label="إضافة ساعات"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            inputProps={{ 
              min: 0, 
              max: activeAgenda?.timeShouldSpent - (activeAgenda?.alreadySpent || 0),
              step: 0.5,
            }}
            sx={{
              marginBottom: '24px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: '#e5e7eb',
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: '12px' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddNumber}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: '700',
                textTransform: 'none',
                fontSize: '15px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              إضافة
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setInputVisible(false)}
              sx={{
                borderRadius: '12px',
                padding: '12px',
                fontWeight: '700',
                textTransform: 'none',
                fontSize: '15px',
                borderColor: '#e5e7eb',
                borderWidth: '2px',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#667eea',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                },
              }}
            >
             إلغاء
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Agenda Form Modal */}
      {showModal && selectedDay && (
        <AgendaFormular
          onClose={() => setShowModal(false)}
          onSave={addEvent}
          date={selectedDay}
        />
      )}
    </Container>
  );
}