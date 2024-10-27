import React, { useEffect, useState } from 'react';
import { candidatsApi } from '../../apis/candidatsApi';
import { useAuth } from '../context/AuthContext';
import { Typography, Paper, Grid, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
    const [field, setField] = useState('');
    const [gender, setGender] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State for error message
    const [successMessage, setSuccessMessage] = useState(''); // State for success message
    const [subscriptions, setSubscriptions] = useState([]); // State for subscription data

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
                setField(response.data.field);
                setName(response.data.name);
                setUsername(response.data.username);
                setStartDate(response.data.startDate);
                setMonths(response.data.months);
                setExpireDate(response.data.expireDate);
                setLevel(response.data.level);
                setNumberPhone(response.data.numberPhone);
                setNewNumberPhone(response.data.numberPhone);
                setGender(response.data.gender);

                // Fetch subscriptions
           //     const subscriptionsResponse = await candidatsApi.getUserSubscriptions(user);
             //   setSubscriptions(subscriptionsResponse.data); // Assuming the response contains the subscription data
            } catch (error) {
                console.error('Error fetching profile or subscriptions:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdatePhone = async () => {
        try {
            setErrorMessage('');

            if (!/^\d{8}$/.test(newNumberPhone)) {
                setErrorMessage("Le numéro de téléphone doit contenir exactement 8 chiffres.");
                return;
            }

            const response = await candidatsApi.updateNumberPhone(user, newNumberPhone);
            setNumberPhone(newNumberPhone);
            setIsEditingPhone(false);
            setSuccessMessage("Le numéro de téléphone a été mis à jour avec succès !");

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error updating phone number:', error);
            setErrorMessage("Impossible de mettre à jour le numéro de téléphone. Veuillez réessayer.");
        }
    };

    const handlePhoneInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 8) {
            setNewNumberPhone(value);
        }
    };

    return (
        <>
        <Paper sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ marginBottom: '20px' }}>
                Mon profil
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
                    <Typography variant="subtitle1">Surnom: {username}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Nom: {name}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Email: {email}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Niveau: {level}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Branche: {field}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Date de début: {startDate}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Mois: {months}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Date d'expiration: {expireDate}</Typography>
                </Grid>
                <Grid item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                        Numéro de téléphone:{' '}
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
         {/* Subscription Table */}
         <Typography variant="h6" gutterBottom align="center" sx={{ marginTop: '20px' }}>
         Mes Abonnements
     </Typography>
     <TableContainer component={Paper}>
         <Table>
             <TableHead>
                 <TableRow>
                     <TableCell>Numéro d'abonnement</TableCell>
                     <TableCell>Mois</TableCell>
                     <TableCell>Date de début</TableCell>
                     <TableCell>Date d'expiration</TableCell>
                     <TableCell>Prix</TableCell>
                 </TableRow>
             </TableHead>
             <TableBody>
                 {subscriptions.map((sub, index) => (
                     <TableRow key={index}>
                         <TableCell>{sub.subscriptionCount}</TableCell>
                         <TableCell>{sub.months}</TableCell>
                         <TableCell>{sub.startDate}</TableCell>
                         <TableCell>{sub.expireDate}</TableCell>
                         <TableCell>{sub.price} Dt</TableCell>
                     </TableRow>
                 ))}
             </TableBody>
         </Table>
     </TableContainer>
     </>
    );
}
