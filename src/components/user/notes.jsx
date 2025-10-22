import React, { useState, useRef, useMemo, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import SimpleMDEEditor from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css'; // Import SimpleMDE styles
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../context/AuthContext';
import subjects from '../../subjects';
import context from '../../context';
import contexts from '../../context';
import { candidatsApi } from '../../apis/candidatsApi';
import Board from './Board'; // Commenting out the Board component import
import '../../assets/css/board.css';
import { Menu, IconButton } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FiltreNotes from './FiltreNotes';

export function Notes() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuCardId, setMenuCardId] = useState(null); // Track which card's menu is open

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
    const [editingCard, setEditingCard] = useState(null); // New state to track edited card
    const [currentCard, setCurrentCard] = useState(null);
    const [openNoteDialog, setOpenNoteDialog] = useState(false); // Controls dialog visibility
    const [selectedNote, setSelectedNote] = useState(''); // Stores the note content for the dialog
    const [selectedTitleOfNote, setSelectedTitleOfNote] = useState('');
    const [filterSubject, setFilterSubject] = useState(''); // Manage the selected filter
    const [selectedSubjects, setSelectedSubjects] = useState(new Set());
    const [selectedContexts, setSelectedContexts] = useState(new Set());

    function useQuery() {
    return new URLSearchParams(useLocation().search);
}
const query = useQuery();
const noteIdFromUrl = query.get('id'); // This is the UUID from the URL
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
        const normalizedSubject = subjectName.trim().toLowerCase(); // Normalize subject name
        setSelectedSubjects((prevSelectedSubjects) => {
            const newSelectedSubjects = new Set(prevSelectedSubjects);
    
            if (newSelectedSubjects.has(normalizedSubject)) {
                newSelectedSubjects.delete(normalizedSubject); // Remove subject if already selected
            } else {
                newSelectedSubjects.add(normalizedSubject); // Add subject if not selected
            }
    
            return newSelectedSubjects;
        });
    };
      
    // Filter function to apply the selected subject
    const filterCards = (cards) => {
  return cards.filter((card) => {
    const cardSubject = card.subject?.trim().toLowerCase();
    const cardContext = card.context?.trim().toLowerCase();

    const subjectMatch =
      selectedSubjects.size === 0 || selectedSubjects.has(cardSubject);

    const contextMatch =
      selectedContexts.size === 0 || selectedContexts.has(cardContext);

    return subjectMatch && contextMatch;
  });
};

const filterById = (cards) => {
    if (!noteIdFromUrl) return cards;
    return cards.filter(card => card.id === noteIdFromUrl);
};

const filteredCreatedCards = filterById(filterCards(createdCards));
const filteredInProgressCards = filterById(filterCards(inProgressCards));
const filteredFinishedCards = filterById(filterCards(finishedCards));


      
    // Opens the dialog and sets the selected note
    const handleOpenNoteDialog = (note, title) => {
        setSelectedTitleOfNote(title)
        setSelectedNote(note); // Set the selected note content
        setOpenNoteDialog(true); // Open the dialog
    };

    // Closes the dialog
    const handleCloseNoteDialog = () => {
        setSelectedNote(''); // Clear the selected note content
        setSelectedTitleOfNote('')
        setOpenNoteDialog(false); // Close the dialog
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
            // onDelete(); // Trigger the parent component to update state or re-fetch data
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

            // Update the state to reflect the changes of the updated card
            setCreatedCards((prevCards) =>
                prevCards.map((card) => (card.id === id ? updatedCard : card))
            );
            setInProgressCards((prevCards) =>
                prevCards.map((card) => (card.id === id ? updatedCard : card))
            );
            setFinishedCards((prevCards) =>
                prevCards.map((card) => (card.id === id ? updatedCard : card))
            );



            //   setCreatedCards((prev) => prev.filter((card) => card.id !== id));
            //    onUpdate();
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

    const userSubjects = subjects.filter(subject => subject.section.includes(user.data.field)); // Default subjects, removing dependency on authentication

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
        setOpenEdit(false)
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
            // onDelete(); // Trigger the parent component to update state or re-fetch data
            setCreatedCards((prevCards) => [...prevCards, response.data]);
        } catch (error) {
            console.error('Error creating  card:', error);
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

        // Check if the card is dropped in the same section
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
            console.log('Card status updated successfully');
        } catch (error) {
            console.error('Error updating card status:', error);
            // Optionally revert the card status locally if the API call fails
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
            <Dialog open={open} onClose={onClose}>
                <DialogTitle style={{ fontSize: '16px' }}>Insérer des symboles mathématiques</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {symbols.map((symbol, index) => (
                            <Button
                                style={{ fontSize: '16px' }}
                                key={index}
                                variant="outlined"
                                onClick={() => {
                                    onSelectSymbol(symbol);
                                    onClose();
                                }}
                            >
                                {symbol}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button style={{ fontSize: '12px' }} onClick={onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <>
           
       
    
   <FiltreNotes
      userSubjects={userSubjects}
      selectedSubjects={selectedSubjects}
      selectedContexts={selectedContexts}
      toggleSubject={toggleSubject}
      toggleContext={toggleContext}
      handleOpenCreate={handleOpenCreate}
    />
           

            <SymbolDialog
                open={openSymbolDialog}
                onClose={handleCloseSymbolDialog}
                onSelectSymbol={handleSelectSymbol}
            />

            <Dialog open={openCreate || openEdit} onClose={handleClose}>
                <DialogTitle></DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            // Allow only alphabets and ensure the max length is 100
                            const alphabeticInput = inputValue.replace(/[^a-zA-Z ]/g, "");
                            if (alphabeticInput.length <= 100) {
                                setTitle(alphabeticInput);
                            }
                        }}
                        margin="normal"
                        inputProps={{
                            maxLength: 100, // Enforce max length on the input element
                        }}
                    />
                    {/* **NEW: Button to Open Symbol Dialog** */}
                    <Button onClick={handleOpenSymbolDialog} style={{ border: '1px solid black', color: 'black', margin: '5px 0' }}> Insérer des symboles</Button>
                    <SimpleMDEEditor
                        value={note}
                        onChange={(value) => setNote(value)}
                        options={autofocusNoSpellcheckerOptions}
                        getMdeInstance={(instance) => (simpleMDE.current = instance)}
                    />
                    <InputLabel id="subject-label">Sujet</InputLabel>
                    <Select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        fullWidth
                        variant="outlined"
                        label="Subject Option"
                        margin="normal"
                        labelId="subject-label"
                    >
                        {userSubjects.map((subject, index) => (
                            <MenuItem key={index} value={subject.name}>
                                {subject.name}
                            </MenuItem>
                        ))}
                    </Select>
                    <InputLabel id="context-label">Context</InputLabel>
                    <Select
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        fullWidth
                        variant="outlined"
                        label="Context Option"
                        margin="normal"
                        labelId="context-label"
                    >
                        {contexts.map((context, index) => (
                            <MenuItem key={index} value={context}>
                                {context}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Valider
                    </Button>
                    <Button onClick={togglePreview} color="primary">
                        Aperçu du basculeur
                    </Button>
                </DialogActions>
            </Dialog>

            <div className='notes-row' style={{ margin: '20px', justifyContent: 'center' }}>
                <div
                    className='notes-card-div'
                    style={{ border: '1px solid blue', backgroundColor: '#eee', margin: '20px', borderRadius: '10px', minHeight: '60vh' }}
                    onDrop={(e) => handleDrop(e, 'CREATED')}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <h1 style={{ margin: '10px', textAlign: 'center' }}>CRÉÉ</h1>
                    {/* <Board handleDelete={handleDelete} handleUpdate={fetchCards} cards={createdCards} /> */}
                    {filteredCreatedCards.map((card, index) => (
                         <div
                         style={{
                           position: "relative", // Required for absolute positioning of child elements
                           padding: "10px",
                           width: "95%",
                           margin: "5px auto",
                           borderRadius: "5px",
                           backgroundColor: "white",
                           border: "2px solid #1875d2", // Add border with the specified color
                         }}
                         className="card"
                         draggable
                         onDragStart={(e) => handleDragStart(e, card, "created")}
                     
                       >
                         {/* Three-dot menu */}
                         <IconButton
                           onClick={(e) => handleMenuOpen(e, card.id)}
                           style={{
                             position: "absolute",
                             top: "10px",
                             right: "10px",
                             zIndex: 1,
                             backgroundColor: "#1875d2",
                             color: "white",
                           }}
                         >
                           <MoreHorizIcon />
                         </IconButton>
                         <Menu
                           anchorEl={anchorEl}
                           open={Boolean(anchorEl) && menuCardId === card.id}
                           onClose={handleMenuClose}
                         >
                           <MenuItem
                             onClick={() => {
                               handleDelete(card.id);
                               handleMenuClose();
                             }}
                           >
                             Supprimer
                           </MenuItem>
                           <MenuItem
                             onClick={() => {
                               handleOpenEdit(card);
                               handleMenuClose();
                             }}
                           >
                             Editer
                           </MenuItem>
                         </Menu>
                   
                         {/* Card Content */}
                         <h3
                           style={{
                             fontSize: "calc(1.5em + 0.5vw)",
                             wordWrap: "break-word",
                             overflow: "hidden",
                             textOverflow: "ellipsis",
                             whiteSpace: "nowrap",
                             lineHeight: "1.4",
                           }}
                         >
                           {card.title}
                         </h3>
                         <p>
                           Note:{" "}
                           <span
                             style={{ textDecoration: "underline", cursor: "pointer" }}
                             onClick={() => handleOpenNoteDialog(card.note, card.title)}
                           >
                             Voir
                           </span>
                         </p>
                         <p>Sujet: {card.subject}</p>
                         <p>Context: {card.context}</p>
                       </div>
                    ))}
                </div>

                <div
                    className='notes-card-div'
                    style={{ border: '1px solid blue', backgroundColor: '#eee', margin: '20px', borderRadius: '10px', minHeight: '60vh' }}
                    onDrop={(e) => handleDrop(e, 'INPROGRESS')}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <h1 style={{ margin: '10px', textAlign: 'center' }}>EN COURS</h1>
                    {filteredInProgressCards.map((card, index) => (
                         <div
                         style={{
                           position: "relative", // Required for absolute positioning of child elements
                           padding: "10px",
                           width: "95%",
                           margin: "5px auto",
                           borderRadius: "5px",
                           backgroundColor: "white",
                           border: "2px solid #1875d2", // Add border with the specified color
                         }}
                         className="card"
                         draggable
                         onDragStart={(e) => handleDragStart(e, card, "inProgress")}
                     
                       >
                         {/* Three-dot menu */}
                         <IconButton
                           onClick={(e) => handleMenuOpen(e, card.id)}
                           style={{
                             position: "absolute",
                             top: "10px",
                             right: "10px",
                             zIndex: 1,
                             backgroundColor: "#1875d2",
                             color: "white",
                           }}
                         >
                           <MoreHorizIcon />
                         </IconButton>
                         <Menu
                           anchorEl={anchorEl}
                           open={Boolean(anchorEl) && menuCardId === card.id}
                           onClose={handleMenuClose}
                         >
                           <MenuItem
                             onClick={() => {
                               handleDelete(card.id);
                               handleMenuClose();
                             }}
                           >
                             Supprimer
                           </MenuItem>
                           <MenuItem
                             onClick={() => {
                               handleOpenEdit(card);
                               handleMenuClose();
                             }}
                           >
                             Editer
                           </MenuItem>
                         </Menu>
                            <h3
                                style={{
                                    fontSize: 'calc(1.5em + 0.5vw)', // Responsive font size
                                    wordWrap: 'break-word',          // Handle long words
                                    overflow: 'hidden',              // Prevent content overflow
                                    textOverflow: 'ellipsis',        // Add ellipsis for overflowed text
                                    whiteSpace: 'nowrap',            // Prevent wrapping (change to 'normal' for multi-line)
                                    lineHeight: '1.4'                // Adjust line height for better readability
                                }}
                            >
                                {card.title}
                            </h3>
                            <p>
                                Note:{' '}
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleOpenNoteDialog(card.note, card.title)}>
                                    Voir
                                </span>
                            </p>
                            <p>Subject:{card.subject}</p>
                            <p>Context: {card.context}</p>
                        </div>
                    ))}
                </div>

                <div
                    className='notes-card-div'
                    style={{ border: '1px solid blue', backgroundColor: '#eee', margin: '20px', borderRadius: '10px', minHeight: '60vh' }}
                    onDrop={(e) => handleDrop(e, 'FINISHED')}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <h1 style={{ margin: '10px', textAlign: 'center' }}>TERMINÉ</h1>
                    {filteredFinishedCards.map((card, index) => (
                       <div
                       style={{
                         position: "relative", // Required for absolute positioning of child elements
                         padding: "10px",
                         width: "95%",
                         margin: "5px auto",
                         borderRadius: "5px",
                         backgroundColor: "white",
                         border: "2px solid #1875d2", // Add border with the specified color
                       }}
                       className="card"
                       draggable
                       onDragStart={(e) => handleDragStart(e, card, "finished")}
                   
                     >
                       {/* Three-dot menu */}
                       <IconButton
                         onClick={(e) => handleMenuOpen(e, card.id)}
                         style={{
                           position: "absolute", // Position in the top-right corner
                           top: "10px",
                           right: "10px",
                           zIndex: 1,
                           backgroundColor: "#1875d2", // Set background color
                           color: "white", // Set icon color to contrast with the background
                           
                         }}
                       >
                         <MoreHorizIcon />
                       </IconButton>
                       <Menu
                         anchorEl={anchorEl}
                         open={Boolean(anchorEl) && menuCardId === card.id}
                         onClose={handleMenuClose}
                       >
                         <MenuItem
                           onClick={() => {
                             handleDelete(card.id);
                             handleMenuClose();
                           }}
                         >
                           Supprimer
                         </MenuItem>
                         <MenuItem
                           onClick={() => {
                             handleOpenEdit(card);
                             handleMenuClose();
                           }}
                         >
                             Editer
                           </MenuItem>
                       </Menu>
                            <h3
                                style={{
                                    fontSize: 'calc(1.5em + 0.5vw)', // Responsive font size
                                    wordWrap: 'break-word',          // Handle long words
                                    overflow: 'hidden',              // Prevent content overflow
                                    textOverflow: 'ellipsis',        // Add ellipsis for overflowed text
                                    whiteSpace: 'nowrap',            // Prevent wrapping (change to 'normal' for multi-line)
                                    lineHeight: '1.4'                // Adjust line height for better readability
                                }}
                            >
                                {card.title}
                            </h3>
                            <p>
                                Note:{' '}
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleOpenNoteDialog(card.note, card.title)}>
                                    Voir
                                </span>
                            </p>
                            <p>Sujet:{card.subject}</p>
                            <p>Context: {card.context}</p>
                            
                        </div>
                    ))}
                </div>
            </div>
            <Dialog
                open={openNoteDialog}
                onClose={handleCloseNoteDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    style: {
                        padding: '20px',
                        overflow: 'hidden', // Prevent horizontal scrolling
                    },
                }}
            >
                <DialogTitle
                    style={{
                        display: 'block', // Ensures proper rendering within the dialog
                        maxWidth: '100%', // Constrain title width within the dialog
                        wordWrap: 'break-word', // Wrap long words
                        whiteSpace: 'pre-wrap', // Preserve line breaks
                        border: '2px solid #4CAF50', // Green border for the title
                        borderRadius: '8px', // Rounded corners
                        padding: '12px', // Inner padding for spacing
                        backgroundColor: '#f0f8ff', // Light blue background
                        textAlign: 'center', // Center-align the text
                        boxSizing: 'border-box', // Include border size in the element's dimensions
                    }}
                >
                    <h3
                        style={{
                            margin: 0, // Remove default margin
                            overflow: 'hidden', // Prevent content from overflowing
                            textOverflow: 'ellipsis', // Add ellipsis for overflowing text
                            lineHeight: '1.5', // Improve readability
                        }}
                    >
                        {selectedTitleOfNote}
                    </h3>
                </DialogTitle>
                <DialogContent
                    style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        maxWidth: '100%',
                        margin: '16px 0',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        backgroundColor: '#f9f9f9',
                        overflowWrap: 'break-word',
                    }}
                >
                    <ReactMarkdown>{selectedNote}</ReactMarkdown>
                </DialogContent>
            </Dialog>
        </>
    );
}
