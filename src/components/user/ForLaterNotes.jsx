import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BookmarkAdded as BookmarkAddedIcon,
  Subject as SubjectIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  Inbox as InboxIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { candidatsApi } from '../../apis/candidatsApi';

const subjectColors = {
  'ARABE':    { border: '#f59e0b', bg: '#fef3c7', chip: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  'FRANCAIS': { border: '#3b82f6', bg: '#eff6ff', chip: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  'ANGLAIS':  { border: '#8b5cf6', bg: '#f5f3ff', chip: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
  'TECHNIQUE':{ border: '#ef4444', bg: '#fef2f2', chip: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
  'SCIENCE':  { border: '#ef4444', bg: '#fef2f2', chip: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
};

function getSubjectColor(subject) {
  return subjectColors[subject?.toUpperCase()] || {
    border: '#667eea',
    bg: '#f0f4ff',
    chip: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };
}

export function ForLaterNotes() {
  const navigate = useNavigate();
  const Auth = useAuth();
  const user = Auth.getUser();

  const [cards, setCards] = useState([]);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCardId, setMenuCardId] = useState(null);
  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await candidatsApi.getForLaterCards(user);
        setCards(response.data || []);
      } catch (error) {
        console.error('Error fetching for-later cards:', error);
      }
    };
    fetchCards();
  }, []);

  const handleMenuOpen = (event, cardId) => {
    setAnchorEl(event.currentTarget);
    setMenuCardId(cardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCardId(null);
  };

  const handleMoveToBoard = (card) => {
    setCards((prev) => prev.filter((c) => String(c.id) !== String(card.id)));
    candidatsApi.updateCardStatusById(user, card.id, 'CREATED').catch((error) => {
      console.error('Error moving card back to board:', error);
    });
  };

  const handleDeleteConfirmed = async () => {
    try {
      await candidatsApi.deleteCard(user, confirmDeleteCard.id);
      setCards((prev) => prev.filter((c) => String(c.id) !== String(confirmDeleteCard.id)));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
    setConfirmDeleteCard(null);
  };

  return (
    <Container maxWidth="xl" sx={{ paddingY: '32px' }}>
      {/* Header */}
      <Box sx={{ marginBottom: '32px' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/notes')}
          sx={{
            marginBottom: '20px',
            borderRadius: '10px',
            color: '#667eea',
            fontWeight: '700',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.08)' },
          }}
        >
          العودة إلى الملاحظات
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <BookmarkAddedIcon sx={{ fontSize: 40, color: '#764ba2' }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              محفوظة للاحقاً
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>
            الملاحظات التي حفظتها لمراجعتها لاحقاً
          </Typography>
        </Box>
      </Box>

      {/* Subject filter chips */}
      {cards.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px', justifyContent: 'center' }}>
          <Chip
            label="الكل"
            onClick={() => setSelectedSubject(null)}
            sx={{
              fontWeight: '700',
              fontSize: '13px',
              backgroundColor: selectedSubject === null ? '#667eea' : '#f3f4f6',
              color: selectedSubject === null ? 'white' : '#6b7280',
              cursor: 'pointer',
              '&:hover': { backgroundColor: selectedSubject === null ? '#5a6fd6' : '#e5e7eb' },
            }}
          />
          {[...new Set(cards.map((c) => c.subject || 'AUTRE'))].map((subject) => {
            const color = getSubjectColor(subject);
            const isSelected = selectedSubject === subject;
            return (
              <Chip
                key={subject}
                label={subject}
                onClick={() => setSelectedSubject(isSelected ? null : subject)}
                sx={{
                  fontWeight: '700',
                  fontSize: '13px',
                  backgroundColor: isSelected ? color.chip : '#f3f4f6',
                  color: isSelected ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${color.border}` : '2px solid transparent',
                  '&:hover': { backgroundColor: isSelected ? color.chip : '#e5e7eb' },
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            padding: '80px 20px',
            borderRadius: '20px',
            border: '2px dashed #e5e7eb',
            backgroundColor: '#f8f9fa',
          }}
        >
          <InboxIcon sx={{ fontSize: 64, color: '#d1d5db', marginBottom: '16px' }} />
          <Typography variant="h6" sx={{ color: '#9ca3af', fontWeight: '600', marginBottom: '8px' }}>
            لا توجد ملاحظات محفوظة للاحقاً
          </Typography>
          <Typography variant="body2" sx={{ color: '#d1d5db' }}>
            عند الضغط على "حفظ للاحقاً" في قسم المنتهية، ستظهر الملاحظات هنا
          </Typography>
        </Box>
      )}

      {/* Cards grouped by subject */}
      {Object.entries(
        cards
          .filter((card) => !selectedSubject || (card.subject || 'AUTRE') === selectedSubject)
          .reduce((groups, card) => {
            const subject = card.subject || 'AUTRE';
            if (!groups[subject]) groups[subject] = [];
            groups[subject].push(card);
            return groups;
          }, {})
      ).map(([subject, subjectCards]) => {
        const color = getSubjectColor(subject);
        return (
          <Box key={subject} sx={{ marginBottom: '40px' }}>
            {/* Subject header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: `3px solid ${color.border}`,
              }}
            >
              <Box
                sx={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: color.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SubjectIcon sx={{ fontSize: 20, color: 'white' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: '700', color: color.border, fontSize: '20px' }}
              >
                {subject}
              </Typography>
              <Chip
                label={subjectCards.length}
                size="small"
                sx={{ backgroundColor: color.chip, color: 'white', fontWeight: '700' }}
              />
            </Box>

            {/* Cards grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {subjectCards.map((card) => (
                <Card
                  key={card.id}
                  sx={{
                    borderRadius: '12px',
                    border: `2px solid ${color.border}`,
                    backgroundColor: color.bg,
                    boxShadow: `0 2px 8px ${color.border}33`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 4px 16px ${color.border}55`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ padding: '16px', position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        borderRadius: '12px 12px 0 0',
                        background: color.gradient,
                      }}
                    />

                    {/* Three-dot menu */}
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, card.id)}
                      sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: color.chip,
                        color: 'white',
                        padding: '6px',
                        '&:hover': { backgroundColor: color.border, filter: 'brightness(0.85)' },
                      }}
                      size="small"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && menuCardId === card.id}
                      onClose={handleMenuClose}
                      PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
                    >
                      <MenuItem
                        onClick={() => {
                          setConfirmDeleteCard(card);
                          handleMenuClose();
                        }}
                        sx={{ gap: '8px' }}
                      >
                        <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                        <Typography sx={{ color: '#ef4444', fontWeight: '600' }}>حذف</Typography>
                      </MenuItem>
                    </Menu>

                    {card.created && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          marginTop: '12px',
                          marginBottom: '4px',
                          color: '#9ca3af',
                          fontSize: '11px',
                        }}
                      >
                        {new Date(card.created).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    )}

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginTop: card.created ? '0px' : '12px',
                        marginBottom: '12px',
                        fontSize: '16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        paddingRight: '32px',
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        color: color.chip,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => {
                        setSelectedNote(card.note);
                        setSelectedTitle(card.title);
                        setOpenNoteDialog(true);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: '600', fontSize: '13px' }}>
                        Voir la note
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <Chip
                        label={card.context}
                        size="small"
                        icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                        sx={{ backgroundColor: '#10b981', color: 'white', fontWeight: '600', fontSize: '11px' }}
                      />
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => handleMoveToBoard(card)}
                      sx={{
                        borderRadius: '8px',
                        borderColor: '#667eea',
                        color: '#667eea',
                        fontWeight: '600',
                        fontSize: '12px',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#667eea',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        },
                      }}
                    >
                      إعادة إلى اللوحة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );
      })}

      {/* Note viewer dialog */}
      <Dialog
        open={openNoteDialog}
        onClose={() => setOpenNoteDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)' } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px 32px',
            fontWeight: '700',
          }}
        >
          {selectedTitle}
        </DialogTitle>
        <DialogContent sx={{ padding: '28px 32px' }}>
          <Box sx={{ '& *': { fontFamily: 'inherit' } }}>
            <ReactMarkdown>{selectedNote}</ReactMarkdown>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 28px' }}>
          <Button
            onClick={() => setOpenNoteDialog(false)}
            sx={{ borderRadius: '10px', padding: '8px 20px', fontWeight: '700', textTransform: 'none' }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(confirmDeleteCard)}
        onClose={() => setConfirmDeleteCard(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: '700', color: '#1a1a1a', textAlign: 'center', paddingTop: '28px' }}>
          هل أنت متأكد؟
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', color: '#6b7280' }}>
          <Typography>
            هل تريد حذف الملاحظة "<strong>{confirmDeleteCard?.title}</strong>" نهائياً؟
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: '8px', justifyContent: 'center' }}>
          <Button
            onClick={() => setConfirmDeleteCard(null)}
            sx={{
              borderRadius: '10px',
              padding: '8px 24px',
              fontWeight: '700',
              textTransform: 'none',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            variant="contained"
            sx={{
              borderRadius: '10px',
              padding: '8px 24px',
              fontWeight: '700',
              textTransform: 'none',
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' },
            }}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
