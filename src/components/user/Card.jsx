import React, {useState, useMemo, useRef} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useAuth} from "../context/AuthContext"
import {candidatsApi} from '../../apis/candidatsApi'

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
import threeStatus from '../../Status'
import { ContentCutRounded } from '@mui/icons-material';






const CustomCard = ({ content, onDelete, onUpdate}) => {

  const Auth = useAuth();
  const user = Auth.getUser();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [status, setStatus] = useState('');

  const getCardColor = (subject) => {
    console.log('Subject:', subject);
    if (subject === 'Chimie'.toUpperCase()) {
      return '33FF33'; // green
    }else if (subject==='Math1'.toUpperCase()){
      return 'red';
    }else if (subject==='Math2'.toUpperCase()){
      return 'yellow';

    }else if (subject==='Physique'.toUpperCase()){
      return 'blue';
    }else if (subject==='STA'.toUpperCase()){
      return '66B2FF'
    }
    // You can define other subject-color associations here if needed
    // For example:
    // if (subject === 'AnotherSubject') {
    //   return 'anotherColorClass';
    // }
   // return ''; // Default class if no match is found
  };

  const userSubjects = subjects.filter(subject => subject.section.includes(user.data.field));
  const simpleMDE = useRef(null);
  const autofocusNoSpellcheckerOptions = useMemo(() => {
    return {
        previewRender: function (plainText) {
            return ReactDOMServer.renderToString(React.createElement(ReactMarkdown, { children: plainText }));
        }
    };
}, []);
  const handleDelete = async () => {
    try {
      await candidatsApi.deleteCard(user,content.id);
    console.log("DELETe")
      onDelete(); // Trigger the parent component to update state or re-fetch data
    } catch (error) {
      console.error('Error deleting card:', error);
    }


};

const handleOpen = async () => {

  setOpen(true);
 // console.log("update"+content.id)
  const response =await candidatsApi.getCardById(user,content.id)
  console.log("jjjjjjj",response.data )
  setTitle(response.data.title)
  setNote(response.data.note)
  setContext(response.data.context)
  setStatus(response.data.status)

};

const handleUpdate = async () => {
  const card = { title, note, context, status}

  try {
    console.log("update????",user)
    console.log("CArdiB",card)
    await candidatsApi.updateCardById(user,content.id,card);
    onUpdate();
    handleClose()
   
  } catch (error) {
    console.error('Error updating card:', error);
  }
}

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
          {content.note}
        </Typography>
      </CardContent>
    </Card>
     <Dialog open={open} onClose={handleClose}>
     <DialogTitle>update a note</DialogTitle>
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
