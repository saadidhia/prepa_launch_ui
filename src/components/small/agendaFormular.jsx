import { useState, useEffect } from 'react'
import { candidatsApi } from '../../apis/candidatsApi';
import { useAuth } from '../context/AuthContext';
import subjects from '../../subjects';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Label as LabelIcon,
  Notes as NotesIcon,
  Subject as SubjectIcon,
} from '@mui/icons-material';

export default function AgendaFormular({ onClose, onSave }) {
  const Auth = useAuth();
  const user = Auth.getUser();
  const userSubjects = subjects.filter(subject => subject.section.includes(user.data.field));

  const [cards, setCards] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    eventTime: '',
    subject: '',
    timeShouldSpent: '',
    remindTime: '',
    cardIds: []
  });

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await candidatsApi.getCards(user);
        const allCards = response.data;

        if (formData.subject) {
          const filtered = allCards.filter(
            card => card.subject?.toLowerCase() === formData.subject.toLowerCase()
          );
          setCards(filtered);
        } else {
          setCards([]);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
        setCards([]);
      }
    };

    fetchCards();
  }, [formData.subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Date validation
    if (formData.remindTime && formData.eventTime) {
      const remind = new Date(formData.remindTime);
      const event = new Date(formData.eventTime);
      if (event <= remind) {
        alert('L\'heure de l\'événement doit être après l\'heure de rappel');
        return;
      }
    }
    
    try {
      const data = await candidatsApi.createAgenda(user, formData);
      if (onSave) onSave(formData);
      alert('✅ Agenda créé avec succès !');
      onClose();
    } catch (error) {
      console.error('Error creating agenda:', error);
      alert('❌ Erreur lors de la création de l\'agenda');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'CONTROLE': return '#8b5cf6';
      case 'SYNTHESE': return '#ec4899';
      case 'OTHER': return '#64748b';
      default: return '#94a3b8';
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px 32px',
        position: 'relative',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <EventIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: '700', marginBottom: '4px' }}>
                حدث جديد
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '14px' }}>
                خطط لفعاليتك القادمة
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ padding: '32px', backgroundColor: '#f8f9fa' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <LabelIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    العنوان
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: Examen de physique"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <DescriptionIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    الوصف
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="وصف قصير..."
                  multiline
                  rows={2}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Type */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    نوع الفعالية
                  </Typography>
                  {formData.type && (
                    <Chip 
                      label={formData.type}
                      size="small"
                      sx={{
                        backgroundColor: getTypeColor(formData.type),
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '11px',
                      }}
                    />
                  )}
                </Box>
                <Select
                  fullWidth
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  <MenuItem value="" disabled>حدد نوع الفعالية</MenuItem>
                  <MenuItem value="CONTROLE">CONTROLE</MenuItem>
                  <MenuItem value="SYNTHESE">SYNTHESE</MenuItem>
                  <MenuItem value="OTHER">AUTRE</MenuItem>
                </Select>
              </Box>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    الأولوية
                  </Typography>
                  {formData.priority && (
                    <Chip 
                      label={formData.priority}
                      size="small"
                      sx={{
                        backgroundColor: getPriorityColor(formData.priority),
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '11px',
                      }}
                    />
                  )}
                </Box>
                <Select
                  fullWidth
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  <MenuItem value="" disabled>اختر أولوية</MenuItem>
                  <MenuItem value="LOW">Basse</MenuItem>
                  <MenuItem value="MEDIUM">Moyenne</MenuItem>
                  <MenuItem value="HIGH">Haute</MenuItem>
                  <MenuItem value="CRITICAL">Critique</MenuItem>
                </Select>
              </Box>
            </Grid>

            {/* Event Time */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <EventIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    وقت الحدث
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="datetime-local"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Subject */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <SubjectIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    المادة
                  </Typography>
                </Box>
                <Select
                  fullWidth
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  <MenuItem value="" disabled>اختر مادة</MenuItem>
                  {userSubjects.map((subj, idx) => (
                    <MenuItem key={idx} value={subj.name}>{subj.name}</MenuItem>
                  ))}
                </Select>
              </Box>
            </Grid>

            {/* Time Should Spent */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AccessTimeIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    المدة المتوقعة (ساعات)

                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  name="timeShouldSpent"
                  value={formData.timeShouldSpent}
                  onChange={handleChange}
                  placeholder="مثال: 4"
                  inputProps={{ min: 1, step: 0.5 }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Remind Time */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  borderColor: '#667eea',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AccessTimeIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    وقت التذكير الأول	
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="datetime-local"
                  name="remindTime"
                  value={formData.remindTime}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Notes Selection */}
            <Grid item xs={12}>
              <Box sx={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <NotesIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#374151' }}>
                    اختر الملاحظات

                  </Typography>
                  {formData.cardIds?.length > 0 && (
                    <Chip 
                      label={`${formData.cardIds.length} sélectionné(s)`}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '11px',
                      }}
                    />
                  )}
                </Box>

                <Paper
                  sx={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {cards.length === 0 ? (
                    <Typography 
                      sx={{ 
                        color: '#9ca3af', 
                        fontSize: '14px',
                        textAlign: 'center',
                        padding: '20px',
                      }}
                    >
                      {formData.subject 
                        ? 'لا توجد ملاحظات متاحة لهذه المادة' 
                        : 'يرجى اختيار مادة أولاً'}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {cards.map(card => (
                        <FormControlLabel
                          key={card.id}
                          control={
                            <Checkbox
                              checked={formData.cardIds?.includes(card.id) || false}
                              onChange={(e) => {
                                const selected = formData.cardIds || [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, cardIds: [...selected, card.id] });
                                } else {
                                  setFormData({
                                    ...formData,
                                    cardIds: selected.filter(id => id !== card.id)
                                  });
                                }
                              }}
                              sx={{
                                color: '#667eea',
                                '&.Mui-checked': {
                                  color: '#667eea',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                              {card.title}
                            </Typography>
                          }
                          sx={{
                            padding: '8px 12px',
                            margin: 0,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.05)',
                              borderColor: '#667eea',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      {/* Actions */}
      <Divider />
      <DialogActions sx={{ 
        padding: '20px 32px',
        backgroundColor: 'white',
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            padding: '12px 32px',
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: '12px',
            padding: '12px 32px',
            fontWeight: '700',
            textTransform: 'none',
            fontSize: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          حفظ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
