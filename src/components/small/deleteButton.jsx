import React from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const DeleteButton = ({ onDelete }) => {
    return (
        <IconButton onClick={onDelete}>
            <DeleteIcon />
        </IconButton>
    );
};

export default DeleteButton;