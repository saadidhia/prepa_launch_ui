// src/components/AlertComponent.js
import React from 'react';
import { Slide, Snackbar, Alert as MuiAlert } from '@mui/material';

const Alert = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000} // Set the duration to 4 seconds
      onClose={onClose}
      TransitionComponent={(props) => <Slide {...props} direction="down" />}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Ensure the Snackbar is centered at the top
      sx={{
        '& .MuiSnackbarContent-root': {
          width: '100%',
          maxWidth: '600px', // Adjust the max-width as needed
          margin: '0 auto', // Center align
        },
      }}
    >
      <MuiAlert onClose={onClose} severity="warning" sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;
