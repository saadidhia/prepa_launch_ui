import React, { useState } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import ReactMarkdown from 'react-markdown';
import Button from '@mui/material/Button';
import {useAuth} from '../context/AuthContext'
import { handleLogError } from '../../misc/Helpers'
import 'easymde/dist/easymde.min.css';
import '../../assets/css/motivation.css'
import { adminApi } from '../../apis/adminApi';

export function CreateMotivation() {

    const Auth = useAuth()
  const admin = Auth.getUser()

    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [successmessage, setSuccessMessage] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!(title && description)) {
            return;
        }
        const motivation = { title, description }

        try {
            await adminApi.createMotivation(admin, motivation)
            setSuccessMessage('Motivation Is Created')
           
        } catch (error) {
            handleLogError(error)

        }
    }

        return (
            <div>
                <input
                    type="text"
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="motivationTitle"
                />
                <SimpleMDE value={description} onChange={(value) => setDescription(value)} />
                <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                {successmessage}
                <div className="previewSection">
                    <ReactMarkdown>{description}</ReactMarkdown>
                </div>
            </div>
        )
    }
