import React, { useState, useRef, useMemo, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import {
  Button,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Menu,
  IconButton,
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Container,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  DragIndicator as DragIndicatorIcon,
  Subject as SubjectIcon,
  Category as CategoryIcon,
  Functions as FunctionsIcon,
  BookmarkAdd as BookmarkAddIcon,
} from '@mui/icons-material';
import SimpleMDEEditor from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { useAuth } from '../context/AuthContext';
import subjects from '../../subjects';
import contexts from '../../context';
import { candidatsApi } from '../../apis/candidatsApi';
import Board from './Board';
import '../../assets/css/board.css';
import FiltreNotes from './FiltreNotes';

export function Notes() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCardId, setMenuCardId] = useState(null);

  // Add these new state variables for touch support
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedCardType, setDraggedCardType] = useState(null);

  const handleMenuOpen = (event, cardId) => {
    setAnchorEl(event.currentTarget);
    setMenuCardId(cardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCardId(null);
  };

  const navigate = useNavigate();
  const Auth = useAuth();
  const user = Auth.getUser();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [createdCards, setCreatedCards] = useState([]);
  const [inProgressCards, setInProgressCards] = useState([]);
  const [finishedCards, setFinishedCards] = useState([]);
  const [openSymbolDialog, setOpenSymbolDialog] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedTitleOfNote, setSelectedTitleOfNote] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [selectedContexts, setSelectedContexts] = useState(new Set());

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const query = useQuery();
  const noteIdFromUrl = query.get('id');

  // Subject color mapping
  const subjectColors = {
    'ARABE': { border: '#f59e0b', bg: '#fef3c7', chip: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    'FRANCAIS': { border: '#3b82f6', bg: '#eff6ff', chip: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    'ANGLAIS': { border: '#8b5cf6', bg: '#f5f3ff', chip: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
    'TECHNIQUE': { border: '#ef4444', bg: '#fef2f2', chip: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
    'SCIENCE': { border: '#ef4444', bg: '#fef2f2', chip: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
    'MATH': { border: '#06b6d4', bg: '#ecfeff', chip: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
    'INFORMATIQUE': { border: '#10b981', bg: '#ecfdf5', chip: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    'SVT': { border: '#84cc16', bg: '#f7fee7', chip: '#84cc16', gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)' },
    'PHILOSOPHIE': { border: '#f97316', bg: '#fff7ed', chip: '#f97316', gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' },
    'ECONOMIE': { border: '#14b8a6', bg: '#f0fdfa', chip: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' },
    'HISTORY': { border: '#a855f7', bg: '#faf5ff', chip: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' },
    'BASES_DE_DONNEES': { border: '#0ea5e9', bg: '#f0f9ff', chip: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' },
    'ALGORITHMES': { border: '#ec4899', bg: '#fdf2f8', chip: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    'GESTION':   { border: '#facc15', bg: '#fefce8', chip: '#facc15', gradient: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)' },
    'PENSEE_ISLAMIQUE':      { border: '#a78bfa', bg: '#f5f3ff', chip: '#a78bfa', gradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)' },
    'HISTOIRE_GEOGRAPHIE':    { border: '#34d399', bg: '#ecfdf5', chip: '#34d399', gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
    'OPTION': { border: '#94a3b8', bg: '#f8fafc', chip: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)' },
    'PHYSIQUE':        { border: '#f472b6', bg: '#fdf2f8', chip: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)' },

  };

  const getSubjectColor = (subjectName) => {
    if (!subjectName) return { border: '#667eea', bg: '#f0f0ff', chip: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    const key = subjectName.trim().toUpperCase();
    return subjectColors[key] || { border: '#667eea', bg: '#f0f0ff', chip: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
  };

  const toggleContext = (contextName) => {
    const normalizedContext = contextName.trim().toLowerCase();
    setSelectedContexts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(normalizedContext)) {
        newSet.delete(normalizedContext);
      } else {
        newSet.add(normalizedContext);
      }
      return newSet;
    });
  };

  const toggleSubject = (subjectName) => {
    const normalizedSubject = subjectName.trim().toLowerCase();
    setSelectedSubjects((prevSelectedSubjects) => {
      const newSelectedSubjects = new Set(prevSelectedSubjects);

      if (newSelectedSubjects.has(normalizedSubject)) {
        newSelectedSubjects.delete(normalizedSubject);
      } else {
        newSelectedSubjects.add(normalizedSubject);
      }

      return newSelectedSubjects;
    });
  };

  const filterCards = (cards) => {
    return cards.filter((card) => {
      const cardSubject = card.subject?.trim().toLowerCase();
      const cardContext = card.context?.trim().toLowerCase();

      const subjectMatch = selectedSubjects.size === 0 || selectedSubjects.has(cardSubject);
      const contextMatch = selectedContexts.size === 0 || selectedContexts.has(cardContext);

      return subjectMatch && contextMatch;
    });
  };

  const filterById = (cards) => {
    if (!noteIdFromUrl) return cards;
    return cards.filter((card) => card.id === noteIdFromUrl);
  };

  const filteredCreatedCards = filterById(filterCards(createdCards));
  const filteredInProgressCards = filterById(filterCards(inProgressCards));
  const filteredFinishedCards = filterById(filterCards(finishedCards));

  const handleOpenNoteDialog = (note, title) => {
    setSelectedTitleOfNote(title);
    setSelectedNote(note);
    setOpenNoteDialog(true);
  };

  const handleCloseNoteDialog = () => {
    setSelectedNote('');
    setSelectedTitleOfNote('');
    setOpenNoteDialog(false);
  };

  const autofocusNoSpellcheckerOptions = useMemo(() => {
    return {
      previewRender: function (plainText) {
        return ReactDOMServer.renderToString(
          React.createElement(ReactMarkdown, { children: plainText })
        );
      },
    };
  }, []);

  const handleOpenEdit = (card) => {
    setOpenEdit(true);
    setEditingCard(card);
    setTitle(card.title);
    setNote(card.note);
    setSubject(card.subject);
    setContext(card.context);
  };

  const handleDelete = async (id) => {
    try {
      await candidatsApi.deleteCard(user, id);
      setCreatedCards((prev) => prev.filter((card) => card.id !== id));
      setInProgressCards((prev) => prev.filter((card) => card.id !== id));
      setFinishedCards((prev) => prev.filter((card) => card.id !== id));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleUpdate = async (id) => {
    const card = { title, note, context, subject };
    try {
      const response = await candidatsApi.updateCardById(user, id, card);
      const updatedCard = response.data;

      setCreatedCards((prevCards) =>
        prevCards.map((card) => (card.id === id ? updatedCard : card))
      );
      setInProgressCards((prevCards) =>
        prevCards.map((card) => (card.id === id ? updatedCard : card))
      );
      setFinishedCards((prevCards) =>
        prevCards.map((card) => (card.id === id ? updatedCard : card))
      );

      handleClose();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const simpleMDE = useRef(null);
  const symbols = [
    'δ', 'θ', 'λ', 'μ', 'π', 'σ', 'τ', 'Φ', 'Ω', '∞',
    '√', '∑', '∫', '≠', '≈', '≡', '≤', '≥', '∂', '∇',
    '∈', '∉', '⊂', '⊆', '⊄', '⊇', '⊕', '⊗', '⊥', '∩',
    '∪', '∅', '∝', '∞', 'ℵ', 'ℶ', '↔', '⇔', '⇐', '⇒',
    '∀', '∃', '∅', '⊤', '∠', '∿', '⊆', '∃', '∇', '⊢'
  ];

  const handleOpenSymbolDialog = () => {
    setOpenSymbolDialog(true);
  };

  const handleCloseSymbolDialog = () => {
    setOpenSymbolDialog(false);
  };

  const handleSelectSymbol = (symbol) => {
    if (simpleMDE.current) {
      const cursor = simpleMDE.current.codemirror.getCursor();
      simpleMDE.current.codemirror.replaceRange(symbol, cursor);
    }
  };

  const userSubjects = subjects.filter((subject) => subject.section.includes(user.data.field));

  const fetchCards = async () => {
    if (!user || !user.data) {
      console.error('User is not authenticated or missing data');
      return;
    }

    try {
      const response = await candidatsApi.getCards(user);
     //  console.log('API response:', response);
      if (!response || !response.data) {
        console.error('Invalid response from API');
        return;
      }

      const data = response.data;

      const created = data.filter((card) => card.status === 'CREATED');
      const inProgress = data.filter((card) => card.status === 'INPROGRESS');
      const finished = data.filter((card) => card.status === 'FINISHED');

      setCreatedCards(created);
      setInProgressCards(inProgress);
      setFinishedCards(finished);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleClose = () => {
    resetInputs();
    setOpenCreate(false);
    setOpenEdit(false);
    setEditingCard(null);
  };

  const handleOpenCreate = () => {
    setOpenCreate(true);
  };

  const resetInputs = () => {
    setTitle('');
    setNote('');
    setSubject('');
    setContext('');
  };

  const handleCreate = async (card) => {
    try {
      const response = await candidatsApi.createNote(user, card);
      setCreatedCards((prevCards) => [...prevCards, response.data]);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    if (!(title && note && subject && context)) {
      return;
    }

    const updatedCard = {
      note,
      title,
      context,
      subject,
      status: editingCard ? editingCard.status : 'CREATED',
    };

    if (openCreate) {
      handleCreate(updatedCard);
      setOpenCreate(false);
    }
    if (openEdit) {
      handleUpdate(editingCard.id);
    }

    resetInputs();
    handleClose();
  };

  const togglePreview = () => {
    if (simpleMDE.current) {
      simpleMDE.current.togglePreview();
    }
  };

  const handleDrop = async (event, status) => {
    const cardId = event.dataTransfer.getData('cardId');
    if (!cardId) return;

    const movedCard = [...createdCards, ...inProgressCards, ...finishedCards]
      .find((card) => String(card.id) === String(cardId));

    if (!movedCard || movedCard.status === status) {
      return;
    }

    const updatedMovedCard = { ...movedCard, status };

    // Remove from all columns first to avoid temporary duplication, then add to target.
    setCreatedCards((prev) => prev.filter((card) => String(card.id) !== String(cardId)));
    setInProgressCards((prev) => prev.filter((card) => String(card.id) !== String(cardId)));
    setFinishedCards((prev) => prev.filter((card) => String(card.id) !== String(cardId)));

    if (status === 'CREATED') {
      setCreatedCards((prev) => [...prev, updatedMovedCard]);
    } else if (status === 'INPROGRESS') {
      setInProgressCards((prev) => [...prev, updatedMovedCard]);
    } else if (status === 'FINISHED') {
      setFinishedCards((prev) => [...prev, updatedMovedCard]);
    }

    try {
      await candidatsApi.updateCardStatusById(user, movedCard.id, status);
    } catch (error) {
      console.error('Error updating card status:', error);
      // Re-sync from backend on failure to keep UI consistent.
      fetchCards();
    }
  };

  const handleMoveToForLater = async (card) => {
    setFinishedCards((prev) => prev.filter((c) => String(c.id) !== String(card.id)));
    try {
      await candidatsApi.updateCardStatusById(user, card.id, 'FOR_LATER');
    } catch (error) {
      console.error('Error updating card status:', error);
      fetchCards();
    }
  };

  const handleDragStart = (event, card, type) => {
    event.dataTransfer.setData('cardId', card.id);
    event.dataTransfer.setData('cardType', type);
  };

  // Add touch handlers for mobile support
  const handleTouchStart = (e, card, type) => {
    setIsDragging(true);
    setDraggedCard(card);
    setDraggedCardType(type);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling while dragging
  };

  const handleTouchEnd = (e, targetStatus) => {
    if (!draggedCard) return;

    // Get the touch position
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // Find the closest drop zone
    const dropZone = dropTarget?.closest('.notes-card-div');

    if (dropZone) {
      // Get the status from the drop zone's data attribute
      const status = dropZone.getAttribute('data-status');

      if (status && status !== draggedCard.status) {
        // Create a mock event object for handleDrop
        const mockEvent = {
          dataTransfer: {
            getData: (key) => {
              if (key === 'cardId') return draggedCard.id;
              if (key === 'cardType') return draggedCardType;
            }
          }
        };
        handleDrop(mockEvent, status);
      }
    }

    // Reset dragging state
    setIsDragging(false);
    setDraggedCard(null);
    setDraggedCardType(null);
  };

  const deleteCard = (cardId, status) => {
    if (status === 'CREATED') {
      setCreatedCards((prev) => prev.filter((card) => card.id !== cardId));
    } else if (status === 'INPROGRESS') {
      setInProgressCards((prev) => prev.filter((card) => card.id !== cardId));
    } else if (status === 'FINISHED') {
      setFinishedCards((prev) => prev.filter((card) => card.id !== cardId));
    }
  };

  const handleDeleteCard = (cardId, status) => {
    deleteCard(cardId, status);
  };

  const SymbolDialog = ({ open, onClose, onSelectSymbol }) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <FunctionsIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: '700' }}>
            إدراج رموز رياضية
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '28px' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
            }}
          >
            {symbols.map((symbol, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => {
                  onSelectSymbol(symbol);
                  onClose();
                }}
                sx={{
                  fontSize: '20px',
                  padding: '12px',
                  borderRadius: '10px',
                  borderColor: '#e5e7eb',
                  color: '#667eea',
                  fontWeight: '700',
                  '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                {symbol}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 28px' }}>
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: '700',
              textTransform: 'none',
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render card component
  const renderCard = (card, columnType) => {
    const subjectColor = getSubjectColor(card.subject);
    return (
      <Card
        key={card.id}
        draggable
        onDragStart={(e) => handleDragStart(e, card, columnType)}
        onTouchStart={(e) => handleTouchStart(e, card, columnType)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="card"
        sx={{
          marginBottom: '12px',
          borderRadius: '12px',
          border: `2px solid ${subjectColor.border}`,
          backgroundColor: subjectColor.bg,
          boxShadow: `0 2px 8px ${subjectColor.border}33`,
          cursor: 'grab',
          transition: 'all 0.3s ease',
          opacity: isDragging && draggedCard?.id === card.id ? 0.5 : 1,
          '&:hover': {
            borderColor: subjectColor.border,
            boxShadow: `0 4px 12px ${subjectColor.border}55`,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <CardContent sx={{ padding: '16px', position: 'relative' }}>
          {/* Colored top accent bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              borderRadius: '12px 12px 0 0',
              background: subjectColor.gradient,
            }}
          />

          <DragIndicatorIcon
            sx={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              color: subjectColor.border,
              fontSize: 20,
            }}
          />

          {card.created && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: '14px',
                left: '36px',
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

          <IconButton
            onClick={(e) => handleMenuOpen(e, card.id)}
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: subjectColor.chip,
              color: 'white',
              padding: '6px',
              '&:hover': {
                backgroundColor: subjectColor.border,
                filter: 'brightness(0.85)',
              },
            }}
            size="small"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && menuCardId === card.id}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleOpenEdit(card);
                handleMenuClose();
              }}
              sx={{ gap: '8px' }}
            >
              <EditIcon fontSize="small" sx={{ color: '#667eea' }} />
              Editer
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDelete(card.id);
                handleMenuClose();
              }}
              sx={{ gap: '8px' }}
            >
              <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
              Supprimer
            </MenuItem>
          </Menu>

          <Typography
            variant="h6"
            sx={{
              fontWeight: '700',
              color: '#1a1a1a',
              marginTop: '24px',
              marginBottom: '4px',
              fontSize: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {card.title}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
              cursor: 'pointer',
              color: subjectColor.chip,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => handleOpenNoteDialog(card.note, card.title)}
          >
            <VisibilityIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: '600', fontSize: '13px' }}>
              Voir la note
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
            <Chip
              label={card.subject}
              size="small"
              icon={<SubjectIcon sx={{ fontSize: 14, color: 'white !important' }} />}
              sx={{
                backgroundColor: subjectColor.chip,
                color: 'white',
                fontWeight: '600',
                fontSize: '11px',
              }}
            />
            <Chip
              label={card.context}
              size="small"
              icon={<CategoryIcon sx={{ fontSize: 14 }} />}
              sx={{
                backgroundColor: '#10b981',
                color: 'white',
                fontWeight: '600',
                fontSize: '11px',
              }}
            />
          </Box>

          {columnType === 'finished' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<BookmarkAddIcon />}
              onClick={() => handleMoveToForLater(card)}
              sx={{
                marginTop: '12px',
                width: '100%',
                borderRadius: '8px',
                borderColor: '#764ba2',
                color: '#764ba2',
                fontWeight: '600',
                fontSize: '12px',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#764ba2',
                  backgroundColor: 'rgba(118, 75, 162, 0.08)',
                },
              }}
            >
              حفظ للاحقاً
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ paddingY: '32px' }}>
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
          ملاحظاتي
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '16px',
          }}
        >
          اكتب ملاحظات أو ملخصات لكل مادة
        </Typography>
        <Button
          variant="contained"
          startIcon={<BookmarkAddIcon />}
          onClick={() => navigate('/dashboard/for-later')}
          sx={{
            borderRadius: '12px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd6 0%, #6a3d9a 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.45)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          محفوظة للاحقاً
        </Button>
      </Box>

      <Box sx={{ marginBottom: '32px' }}>
        <FiltreNotes
          userSubjects={userSubjects}
          selectedSubjects={selectedSubjects}
          selectedContexts={selectedContexts}
          toggleSubject={toggleSubject}
          toggleContext={toggleContext}
          handleOpenCreate={handleOpenCreate}
        />
      </Box>

      <SymbolDialog
        open={openSymbolDialog}
        onClose={handleCloseSymbolDialog}
        onSelectSymbol={handleSelectSymbol}
      />

      <Dialog
        open={openCreate || openEdit}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px 32px',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: '700' }}>
            {openEdit ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '32px', backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
            <TextField
              label="عنوان الملاحظة"
              fullWidth
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setTitle(e.target.value);
                }
              }}
              inputProps={{
                maxLength: 100,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                },
              }}
            />

            <Button
              onClick={handleOpenSymbolDialog}
              startIcon={<FunctionsIcon />}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                padding: '10px 20px',
                fontWeight: '700',
                textTransform: 'none',
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#764ba2',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                },
              }}
            >
              إدراج رموز رياضية
            </Button>

            <Box>
              <InputLabel sx={{ marginBottom: '8px', fontWeight: '600', color: '#1a1a1a' }}>
                Note
              </InputLabel>
              <SimpleMDEEditor
                value={note}
                onChange={(value) => setNote(value)}
                options={autofocusNoSpellcheckerOptions}
                getMdeInstance={(instance) => (simpleMDE.current = instance)}
              />
            </Box>

            <Box>
              <InputLabel sx={{ marginBottom: '8px', fontWeight: '600', color: '#1a1a1a' }}>
                المادة
              </InputLabel>
              <Select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                }}
              >
                {userSubjects.map((subject, index) => (
                  <MenuItem key={index} value={subject.name}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box>
              <InputLabel sx={{ marginBottom: '8px', fontWeight: '600', color: '#1a1a1a' }}>
                السياق
              </InputLabel>
              <Select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                }}
              >
                {contexts.map((context, index) => (
                  <MenuItem key={index} value={context}>
                    {context}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '20px 32px', backgroundColor: '#f8f9fa' }}>
          <Button
            onClick={handleClose}
            sx={{
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: '700',
              textTransform: 'none',
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={togglePreview}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: '700',
              textTransform: 'none',
              borderColor: '#667eea',
              color: '#667eea',
            }}
          >
            معاينة 
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: '700',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
             حفظ
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        className="notes-row"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          margin: '20px 0',
        }}
      >
        <Paper
          className="notes-card-div"
          data-status="CREATED"
          onDrop={(e) => handleDrop(e, 'CREATED')}
          onDragOver={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
          sx={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#f8f9fa',
            border: '2px dashed #667eea',
            minHeight: '60vh',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: '700', fontSize: '16px' }}
            >
              جديدة
            </Typography>
            <Chip
              label={filteredCreatedCards.length}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: '700',
              }}
            />
          </Box>
          {filteredCreatedCards.map((card) => renderCard(card, 'created'))}
        </Paper>

        <Paper
          className="notes-card-div"
          data-status="INPROGRESS"
          onDrop={(e) => handleDrop(e, 'INPROGRESS')}
          onDragOver={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
          sx={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#f8f9fa',
            border: '2px dashed #f59e0b',
            minHeight: '60vh',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: '700', fontSize: '16px' }}
            >
قيد التقدم
            </Typography>
            <Chip
              label={filteredInProgressCards.length}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: '700',
              }}
            />
          </Box>
          {filteredInProgressCards.map((card) => renderCard(card, 'inProgress'))}
        </Paper>

        <Paper
          className="notes-card-div"
          data-status="FINISHED"
          onDrop={(e) => handleDrop(e, 'FINISHED')}
          onDragOver={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
          sx={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#f8f9fa',
            border: '2px dashed #10b981',
            minHeight: '60vh',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: '700', fontSize: '16px' }}
            >
              مكتملة
            </Typography>
            <Chip
              label={filteredFinishedCards.length}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: '700',
              }}
            />
          </Box>
          {filteredFinishedCards.map((card) => renderCard(card, 'finished'))}
        </Paper>
      </Box>

      <Dialog
        open={openNoteDialog}
        onClose={handleCloseNoteDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px 32px',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: '700' }}>
            {selectedTitleOfNote}
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            padding: '32px',
            backgroundColor: 'white',
            '& .markdown-body': {
              fontFamily: 'inherit',
            },
          }}
        >
          <ReactMarkdown>{selectedNote}</ReactMarkdown>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 32px' }}>
          <Button
            onClick={handleCloseNoteDialog}
            variant="contained"
            sx={{
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: '700',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}