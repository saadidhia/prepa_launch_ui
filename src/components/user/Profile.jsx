import React, { useEffect, useState } from 'react';
import { candidatsApi } from '../../apis/candidatsApi';
import { useAuth } from '../context/AuthContext';
import { Typography, Paper, Grid, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import femaleImage from '../../assets/statics/female.jpg';
import maleImage from '../../assets/statics/male.jpg';

export function Profile() {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [level, setLevel] = useState('');
    const [startDate, setStartDate] = useState('');
    const [months, setMonths] = useState('');
    const [expireDate, setExpireDate] = useState('');
    const [numberPhone, setNumberPhone] = useState('');
    const [newNumberPhone, setNewNumberPhone] = useState(''); // Temporary state for editing
    const [isEditingPhone, setIsEditingPhone] = useState(false); // To track if we're in edit mode
    const [field, setField] = useState(''); // Add this line to define 'field' state
    const [gender, setGender] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State for error message
    const [successMessage, setSuccessMessage] = useState(''); // State for success message

    const Auth = useAuth();
    const user = Auth.getUser();

    const containerStyle = {
        position: 'relative',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    };

    const imageStyle = {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        position: 'absolute',
        top: '0',
        right: '0',
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await candidatsApi.getMyProfile(user);
                setEmail(response.data.email);
                setField(response.data.field); // Set the field value from the response
                setName(response.data.name);
                setUsername(response.data.username);
                setStartDate(response.data.startDate);
                setMonths(response.data.months);
                setExpireDate(response.data.expireDate);
                setLevel(response.data.level);
                setNumberPhone(response.data.numberPhone);
                setNewNumberPhone(response.data.numberPhone); // Initialize with current phone
                setGender(response.data.gender);
            } catch (error) {
                console.error('Error fetching Profile:', error);
            }
        };
        fetchProfile();
    }, []);

    // Function to handle updating the phone number
    const handleUpdatePhone = async () => {
        try {
            setErrorMessage(''); // Clear any previous error

            if (!/^\d{8}$/.test(newNumberPhone)) {
                setErrorMessage("Le numéro de téléphone doit contenir exactement 8 chiffres.");
                return;
            }

            const response = await candidatsApi.updateNumberPhone(user, newNumberPhone); // Send the new numberPhone as a requestParam
            setNumberPhone(newNumberPhone); // Update the UI with the new number
            setIsEditingPhone(false); // Exit edit mode
            setSuccessMessage("Le numéro de téléphone a été mis à jour avec succès !");

            // Hide the success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error updating phone number:', error);
            setErrorMessage("Impossible de mettre à jour le numéro de téléphone. Veuillez réessayer.");
        }
    };

    // Function to handle input validation
    const handlePhoneInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 8) {
            setNewNumberPhone(value);
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                User Information
            </Typography>
            <div style={containerStyle}>
                {gender === 'FEMALE' ? (
                    <img src={femaleImage} alt="Female" style={imageStyle} />
                ) : (
                    <img src={maleImage} alt="Male" style={imageStyle} />
                )}
            </div>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Username: {username}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Name: {name}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Email: {email}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Level: {level}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Field: {field}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Start Date: {startDate}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Months: {months}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Expire Date: {expireDate}</Typography>
                </Grid>
                <Grid item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                        Number Phone:{' '}
                        {isEditingPhone ? (
                            <TextField
                                value={newNumberPhone}
                                onChange={handlePhoneInputChange}
                                size="small"
                            />
                        ) : (
                            numberPhone
                        )}
                    </Typography>
                    {isEditingPhone ? (
                        <IconButton onClick={handleUpdatePhone}>
                            <CheckIcon />
                        </IconButton>
                    ) : (
                        <IconButton onClick={() => setIsEditingPhone(true)}>
                            <EditIcon />
                        </IconButton>
                    )}
                </Grid>
            </Grid>
            {errorMessage && (
                <Typography color="error">
                    {errorMessage}
                </Typography>
            )}
            {successMessage && (
                <Typography color="primary">
                    {successMessage}
                </Typography>
            )}
        </Paper>
    );
}
