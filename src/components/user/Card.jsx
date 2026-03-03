import React, { useState, useMemo, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from "../context/AuthContext";
import { candidatsApi } from '../../apis/candidatsApi';

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
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

import subjects from '../../subjects';
import contexts from '../../context';
import threeStatus from '../../Status';

const CustomCard = ({ content, onDelete, onUpdate }) => {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [status, setStatus] = useState('');
  const [showFullNote, setShowFullNote] = useState(false);

  const handleDelete = async () => {
    try {
      await candidatsApi.deleteCard(user, content.id);
      onDelete(); // Trigger the parent component to update state or re-fetch data
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    const response = await candidatsApi.getCardById(user, content.id);
    setTitle(response.data.title);
    setNote(response.data.note);
    setContext(response.data.context);
    setStatus(response.data.status);
  };

  const handleUpdate = async () => {
    const card = { title, note, context, status };
    try {
      await candidatsApi.updateCardById(user, content.id, card);
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleClose = () => {
    resetInputs();
    setOpen(false);
  };

  const resetInputs = () => {
    setTitle('');
    setNote('');
    setSubject('');
    setContext('');
  };

const getCardColor = (subject) => {
  console.log('Subject:', subject); // Debugging log
  switch (subject?.toUpperCase()) {
    case 'ARABE':
      return '#33FF33';
    case 'FRANCAIS':
      return '#FF4444';
    case 'ANGLAIS':
      return '#FFFF00';
    case 'PHYSIQUE':
      return '#33FF33';
    case 'OPTION':
      return '#66B2FF';
    default:
      return '#ffffff';
  }
};

  // Truncate note to first 30 words
  const truncatedNote = content.note
    ? content.note.split('').slice(0, 30).join('') + (content.note.split(' ').length > 30 ? '...' : '')
    : 'No content available';

  return (
    <>
      <Card variant="outlined" style={{ backgroundColor: getCardColor(content.subject) }}>
        <CardContent>
          <Button variant="contained" color="secondary" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Update
          </Button>
          <Typography variant="h5" component="h2">
            {content.created}
          </Typography>
          <Typography variant="h5" component="h2">
            {content.title}
          </Typography>
          <Typography variant="body2" component="p">
            {truncatedNote}
            {content.note && content.note.length > 2 && (
              <Button color="primary" onClick={() => setShowFullNote(true)} size="small">
                See More
              </Button>
            )}
          </Typography>
        </CardContent>
      </Card>

      {/* Dialog to show full content */}
      <Dialog open={showFullNote} onClose={() => setShowFullNote(false)}>
        <DialogTitle>Full Content</DialogTitle>
        <DialogContent>
          <Typography variant="body2" component="p">
            {content.note}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFullNote(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update a Note</DialogTitle>
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
            options={{
              previewRender: (plainText) => ReactDOMServer.renderToString(React.createElement(ReactMarkdown, { children: plainText })),
            }}
          />
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
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            variant="outlined"
            label="Status Option"
            margin="normal"
            labelId="status-label"
          >
            {threeStatus.map((status, index) => (
              <MenuItem key={index} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomCard;
