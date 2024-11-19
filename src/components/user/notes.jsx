import React, { useState, useRef, useMemo, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
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
// import { useAuth } from '../context/AuthContext'; // Commenting out user authentication
import subjects from '../../subjects';
import contexts from '../../context';
import { candidatsApi } from '../../apis/candidatsApi';
// import Board from './Board'; // Commenting out the Board component import
import '../../assets/css/board.css';

export function Notes() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [subject, setSubject] = useState('');
    const [context, setContext] = useState('');
    const [createdCards, setCreatedCards] = useState([]);
    const [inProgressCards, setInProgressCards] = useState([]);
    const [finishedCards, setFinishedCards] = useState([]);
      // **NEW: State for the mathematical symbol dialog**
      const [openSymbolDialog, setOpenSymbolDialog] = useState(false); 
      const [editingCard, setEditingCard] = useState(null); // New state to track edited card


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
        setEditingCard(card);
        setTitle(card.title);
        setNote(card.note);
        setSubject(card.subject);
        setContext(card.context);
        setOpen(true);  // Open the dialog
    };
    
    


    const simpleMDE = useRef(null);
    // const Auth = useAuth(); // Commenting out authentication logic
    // const user = Auth.getUser(); // Commenting out user fetching logic

    // Safely filter user subjects
    // const userSubjects = user && user.data && subjects 
    //     ? subjects.filter((subject) => subject.section.includes(user.data.field)) 
    //     : []; // Commenting out logic dependent on user authentication

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

    const userSubjects = subjects; // Default subjects, removing dependency on authentication

    const fetchCards = async () => {
        // if (!user || !user.data) { // Commenting out user checks
        //     console.error('User is not authenticated or missing data');
        //     return;
        // }

        try {
            // const response = await candidatsApi.getCards(user); // Commenting out API call that depends on user
            const response = await candidatsApi.getCards(); // Remove user authentication from API call

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
        fetchCards(); // Removing user dependency for fetching cards
    }, []);

    const handleClose = () => {
        resetInputs();
        setOpen(false);
        setEditingCard(null);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const resetInputs = () => {
        setTitle('');
        setNote('');
        setSubject('');
        setContext('');
    };

    const handleSubmit = async (e) => {
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
    
        try {
            if (editingCard) {
                // Update the card in the appropriate list without changing its status
                if (editingCard.status === 'CREATED') {
                    const updatedCards = createdCards.map(card =>
                        card.title === editingCard.title ? updatedCard : card
                    );
                    setCreatedCards(updatedCards);
                } else if (editingCard.status === 'INPROGRESS') {
                    const updatedCards = inProgressCards.map(card =>
                        card.title === editingCard.title ? updatedCard : card
                    );
                    setInProgressCards(updatedCards);
                } else if (editingCard.status === 'FINISHED') {
                    const updatedCards = finishedCards.map(card =>
                        card.title === editingCard.title ? updatedCard : card
                    );
                    setFinishedCards(updatedCards);
                }
            } else {
                setCreatedCards([...createdCards, updatedCard]); // Add a new card if not editing
            }
        } catch (error) {
            console.error('Error creating/updating note:', error);
        }
    
        resetInputs();
        handleClose();
    };
    
    

    const togglePreview = () => {
        if (simpleMDE.current) {
            simpleMDE.current.togglePreview();
        }
    };

    const handleDrop = (event, status) => {
        const cardId = event.dataTransfer.getData('cardId');
        const cardType = event.dataTransfer.getData('cardType');
        let movedCard;

        // Check if the card is dropped in the same section
        if (cardType === 'created') {
            if (status === 'CREATED') return; 
            movedCard = createdCards.find((card) => card.title === cardId);
            setCreatedCards(createdCards.filter((card) => card.title !== cardId));
        } else if (cardType === 'inProgress') {
            if (status === 'INPROGRESS') return;
            movedCard = inProgressCards.find((card) => card.title === cardId);
            setInProgressCards(inProgressCards.filter((card) => card.title !== cardId));
        } else if (cardType === 'finished') {
            if (status === 'FINISHED') return; 
            movedCard = finishedCards.find((card) => card.title === cardId);
            setFinishedCards(finishedCards.filter((card) => card.title !== cardId));
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
        event.dataTransfer.setData('cardId', card.title);
        event.dataTransfer.setData('cardType', type);
    };

    
    const deleteCard = (cardTitle, status) => {
        if (status === 'CREATED') {
            setCreatedCards((prev) => prev.filter((card) => card.title !== cardTitle));
        } else if (status === 'INPROGRESS') {
            setInProgressCards((prev) => prev.filter((card) => card.title !== cardTitle));
        } else if (status === 'FINISHED') {
            setFinishedCards((prev) => prev.filter((card) => card.title !== cardTitle));
        }
    };
    
    const handleDeleteCard = (cardTitle, status) => {
        deleteCard(cardTitle, status);
    };
    
    

    const SymbolDialog = ({ open, onClose, onSelectSymbol }) => {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogTitle style={{fontSize:'16px'}}>Insert Mathematical Symbol</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {symbols.map((symbol, index) => (
                            <Button
                                style={{fontSize:'16px'}}
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
                    <Button style={{fontSize:'12px'}} onClick={onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <>
            <div 
                style={{padding: '10px 30px',
                backgroundColor: '#3f95db',
                boxShadow:' 0 2px 5px 0 rgb(82, 82, 82)',
                textAlign: 'right',
                fontSize: '16px',
                }}>
                    <a href='' style={{  color: 'white',textDecoration: 'none'}}><i className="bi bi-box-arrow-right"></i> DECONNEXION <i className="bi bi-person-circle"></i></a>
            </div>

            <Button style={{margin:'20px', fontSize:'17px'}} variant="contained" color="primary" onClick={handleOpen}>
                Create Card
            </Button>
            
            <SymbolDialog
                open={openSymbolDialog}
                onClose={handleCloseSymbolDialog}
                onSelectSymbol={handleSelectSymbol}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create a Note</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                    />
                     {/* **NEW: Button to Open Symbol Dialog** */}
                        <Button onClick={handleOpenSymbolDialog} style={{border: '1px solid black', color:'black', margin:'5px 0'}}> Insert Symbol</Button>
                    <SimpleMDEEditor
                        value={note}
                        onChange={(value) => setNote(value)}
                        options={autofocusNoSpellcheckerOptions}
                        getMdeInstance={(instance) => (simpleMDE.current = instance)}
                    />
                    <InputLabel id="subject-label">Subject</InputLabel>
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
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                    <Button onClick={togglePreview} color="primary">
                        Toggle Preview
                    </Button>
                </DialogActions>
            </Dialog>

            <div className='notes-row' style={{ margin: '20px', justifyContent:'center' }}>
                <div
                    className='notes-card-div'
                    style={{ border: '1px solid blue' , backgroundColor:'#eee',margin: '20px', borderRadius: '10px', minHeight: '60vh' }}
                    onDrop={(e) => handleDrop(e, 'CREATED')}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <h1 style={{margin:'10px', textAlign:'center'}}>CREATED</h1>
                    {/* <Board handleDelete={handleDelete} handleUpdate={fetchCards} cards={createdCards} /> */}
                    {createdCards.map((card, index) => (
                        <div style={{padding: '10px', width:'95%', margin: '5px auto', borderRadius:'5px', backgroundColor:'white' }}
                            key={index}
                            className="card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, card, 'created')}
                        >
                            <h3>Title: {card.title}</h3>
                            <p>Note: {card.note}</p>
                            <p>Subject:{card.subject}</p>
                            <p>Context: {card.context}</p>
                            <p>Status: {card.status}</p>
                            <Button onClick={() => handleDeleteCard(card.title, card.status)}  color="secondary">Delete</Button>
                            <Button onClick={() => handleOpenEdit(card)} color="primary">Edit</Button>
                        </div>
                    ))}
                </div>

                <div
                    className='notes-card-div'
                    style={{border: '1px solid blue' , backgroundColor:'#eee',margin: '20px', borderRadius: '10px', minHeight: '60vh'}}
                    onDrop={(e) => handleDrop(e, 'INPROGRESS')}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <h1 style={{margin:'10px', textAlign:'center'}}>IN PROGRESS</h1>
                    {inProgressCards.map((card, index) => (
                        <div style={{padding: '10px', width:'95%', margin: '5px auto', borderRadius:'5px', backgroundColor:'white' }}
                            key={index}
                            className="card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, card, 'inProgress')}
                        >
                            <h3>Title: {card.title}</h3>
                            <p>Note: {card.note}</p>
                            <p>Subject:{card.subject}</p>
                            <p>Context: {card.context}</p>
                            <p>Status: {card.status}</p>
                            <Button onClick={() => handleDeleteCard(card.title, card.status)} color="secondary">Delete</Button>
                            <Button onClick={() => handleOpenEdit(card)} color="primary">Edit</Button>
                        </div>
                    ))}
                </div>

                <div
                    className='notes-card-div'
                    style={{ border: '1px solid blue' , backgroundColor:'#eee',margin: '20px', borderRadius: '10px',  minHeight: '60vh'}}
                    onDrop={(e) => handleDrop(e, 'FINISHED')}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <h1 style={{margin:'10px', textAlign:'center'}}>FINISHED</h1>
                    {finishedCards.map((card, index) => (
                        <div style={{padding: '10px', width:'95%', margin: '5px auto', borderRadius:'5px', backgroundColor:'white' }}
                            key={index}
                            className="card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, card, 'finished')}
                        >
                            <h3>Title: {card.title}</h3>
                            <p>Note: {card.note}</p>
                            <p>Subject:{card.subject}</p>
                            <p>Context: {card.context}</p>
                            <p>Status: {card.status}</p>
                            <Button  onClick={() => handleDeleteCard(card.title, card.status)}  color="secondary">Delete</Button>
                            <Button onClick={() => handleOpenEdit(card)} color="primary">Edit</Button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
