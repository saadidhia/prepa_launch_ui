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
 import { useAuth } from '../context/AuthContext';
import subjects from '../../subjects';
import contexts from '../../context';
import { candidatsApi } from '../../apis/candidatsApi';
 import Board from './Board'; // Commenting out the Board component import
import '../../assets/css/board.css';

export function Notes() {
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
      // **NEW: State for the mathematical symbol dialog**
      const [openSymbolDialog, setOpenSymbolDialog] = useState(false); 
      const [editingCard, setEditingCard] = useState(null); // New state to track edited card
      const [currentCard, setCurrentCard] = useState(null);


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
        const card = { title, note, context };
        try {
         const  response =await candidatsApi.updateCardById(user, id, card);
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
         const response= await candidatsApi.createNote(user, card);
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
        if (openCreate){
            handleCreate(updatedCard);
            setOpenCreate(false);
          }
         if (openEdit){
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
        
        if (!movedCard) {
            console.error('Card not found');
            return;
        }

        try {
            await candidatsApi.updateCardStatusById(user, movedCard.id,  status );
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

            <Button style={{margin:'20px', fontSize:'17px'}} variant="contained" color="primary" onClick={handleOpenCreate}>
                Create Card
            </Button>
            
            <SymbolDialog
                open={openSymbolDialog}
                onClose={handleCloseSymbolDialog}
                onSelectSymbol={handleSelectSymbol}
            />

            <Dialog open={openCreate || openEdit} onClose={handleClose}>
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
                            <Button onClick={() => handleDelete(card.id)}  color="secondary">Delete</Button>
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
                            <Button onClick={() => handleDelete(card.id)} color="secondary">Delete</Button>
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
                            <Button  onClick={() => handleDelete(card.id)}  color="secondary">Delete</Button>
                            <Button onClick={() => handleOpenEdit(card)} color="primary">Edit</Button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
