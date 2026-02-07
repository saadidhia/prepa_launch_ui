import React, { useState, useRef, useMemo, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation } from 'react-router-dom';
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
    const cardType = event.dataTransfer.getData('cardType');
    let movedCard;

    if (cardType === 'created') {
      if (status === 'CREATED') return;
      movedCard = createdCards.find((card) => card.id === cardId);
      setCreatedCards(createdCards.filter((card) => card.id !== cardId));
    } else if (cardType === 'inProgress') {
      if (status === 'INPROGRESS') return;
      movedCard = inProgressCards.find((card) => card.id === cardId);
      setInProgressCards(inProgressCards.filter((card) => card.id !== cardId));
    } else if (cardType === 'finished') {
      if (status === 'FINISHED') return;
      movedCard = finishedCards.find((card) => card.id === cardId);
      setFinishedCards(finishedCards.filter((card) => card.id !== cardId));
    }

    if (!movedCard) {
      console.error('Card not found');
      return;
    }

    try {
      await candidatsApi.updateCardStatusById(user, movedCard.id, status);
    } catch (error) {
      console.error('Error updating card status:', error);
      if (cardType === 'created') {
        setCreatedCards([...createdCards, movedCard]);
      } else if (cardType === 'inProgress') {
        setInProgressCards([...inProgressCards, movedCard]);
      } else if (cardType === 'finished') {
        setFinishedCards([...finishedCards, movedCard]);
      }
      return;
    }

    movedCard.status = status;
    if (status === 'CREATED') {
      setCreatedCards([...createdCards, movedCard]);
    } else if (status === 'INPROGRESS') {
      setInProgressCards([...inProgressCards, movedCard]);
    } else if (status === 'FINISHED') {
      setFinishedCards([...finishedCards, movedCard]);
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
            Insérer des symboles mathématiques
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
  const renderCard = (card, columnType) => (
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
        border: '2px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        cursor: 'grab',
        transition: 'all 0.3s ease',
        opacity: isDragging && draggedCard?.id === card.id ? 0.5 : 1,
        '&:hover': {
          borderColor: '#667eea',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent sx={{ padding: '16px', position: 'relative' }}>
        <DragIndicatorIcon
          sx={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            color: '#9ca3af',
            fontSize: 20,
          }}
        />

        <IconButton
          onClick={(e) => handleMenuOpen(e, card.id)}
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#667eea',
            color: 'white',
            padding: '6px',
            '&:hover': {
              backgroundColor: '#764ba2',
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
            marginBottom: '12px',
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
            color: '#667eea',
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
            icon={<SubjectIcon sx={{ fontSize: 14 }} />}
            sx={{
              backgroundColor: '#667eea',
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
      </CardContent>
    </Card>
  );

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
          Mes Notes
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '24px',
          }}
        >
          Organisez vos notes avec le système Kanban
        </Typography>
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
            {openEdit ? 'Éditer la note' : 'Créer une nouvelle note'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '32px', backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => {
                const inputValue = e.target.value;
                const alphabeticInput = inputValue.replace(/[^a-zA-Z ]/g, '');
                if (alphabeticInput.length <= 100) {
                  setTitle(alphabeticInput);
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
              Insérer des symboles
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
                Sujet
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
                Context
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
            Annuler
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
            Aperçu du basculeur
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
            Valider
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
          onTouchEnd={(e) => handleTouchEnd(e, 'CREATED')}
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
              CRÉÉ
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
          onTouchEnd={(e) => handleTouchEnd(e, 'INPROGRESS')}
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
              EN COURS
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
          onTouchEnd={(e) => handleTouchEnd(e, 'FINISHED')}
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
              TERMINÉ
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