import React, { useState, useRef, useMemo } from 'react';
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
import { useAuth } from '../context/AuthContext'
import subjects from '../../subjects';
import contexts from '../../context'
import { candidatsApi } from '../../apis/candidatsApi';
import Board from './Board';
import   '../../assets/css/board.css'
export function Notes() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [subject, setSubject] = useState('');
    const [context, setContext] = useState('');

    const cards = [
        { title: 'Card 1', content: 'Content of Card 1' },
        { title: 'Card 2', content: 'Content of Card 2' },
        { title: 'Card 3', content: 'Content of Card 3' },
      ];

    const autofocusNoSpellcheckerOptions = useMemo(() => {
        return {
            previewRender: function(plainText) {
                return ReactDOMServer.renderToString(React.createElement(ReactMarkdown, { children: plainText }));
            }
        };
    }, []);

    const simpleMDE = useRef(null);
    const Auth = useAuth();
    const user = Auth.getUser();
    const userSubjects = subjects.filter(subject => subject.section.includes(user.data.field));

    const handleClose = () => {
        resetInputs();
        setOpen(false);
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
        e.preventDefault()
        console.log('Title:', title);
        console.log('Markdown:', note);

        console.log('Subject Option:', subject);
        console.log('Context Option:', context);
        if (!(title && note && subject && context)) {
            return;
        }
        const card ={note, title, context, subject }
        console.log("My card ",card)
        try {
        await candidatsApi.createNote(user,card);
        }catch(error){
         console.log(error)
        }
        resetInputs();
        handleClose();
    };

    const togglePreview = () => {
        if (simpleMDE.current) {
            simpleMDE.current.togglePreview();
        }
    };

    return (
        <>

            <Button variant="contained" color="primary" onClick={handleOpen}>
                Create Card
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>create a note</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                    />
                    <SimpleMDEEditor
                        value={note}
                        onChange={(value) => {
                            setNote(value);
                        }}
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

            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    <Board cards={cards} />
                </div>
                <div style={{ flex: 1 }}>
                    <Board cards={cards} />
                </div>
                <div style={{ flex: 1 }}>
                    <Board cards={cards} />
                </div>
            </div>
           
        </>
    );
}
