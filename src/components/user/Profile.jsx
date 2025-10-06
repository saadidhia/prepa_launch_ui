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


    const fetchProfileData = async () => {
        try {
            const response = await candidatsApi.getMyProfile(user);
            const profileData = response.data;
    
            // Set profile details
            setEmail(profileData.email);
            setField(profileData.field);
            setName(profileData.name);
            setUsername(profileData.username);
            setLevel(profileData.level);
            setNumberPhone(profileData.numberPhone);
            setNewNumberPhone(profileData.numberPhone);
            setGender(profileData.gender === "FEMALE" ? "Femme" : "Homme");
    
            // Fetch subscriptions if needed
            await fetchSubscriptions();
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };
    
    const fetchSubscriptions = async () => {
        try {
            const subscriptionsResponse = await candidatsApi.getSubscriptions(user);
            setSubscriptions(subscriptionsResponse.data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };
    
    // Example usage:
    // Call these functions when needed
    // fetchProfileData();
    
    useEffect(() => {
     fetchProfileData()
    }, []);

    const handleUpdatePhone = async () => {
        try {
            setErrorMessage('');
            setErrorMessage('');

            // ✅ Check if the new number is the same as the current one
        if (newNumberPhone === numberPhone) {
        setErrorMessage("Le même numéro est inséré. Aucune modification n'a été effectuée.");
          setTimeout(() => {
            setErrorMessage('');
        }, 3000);
        setIsEditingPhone(false);
        return;
      } 

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
                    <Typography variant="subtitle1">Genre: {gender}</Typography>
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
                     <TableCell>Mois</TableCell>
                     <TableCell>Date de début</TableCell>
                     <TableCell>Date d'expiration</TableCell>
                     <TableCell>Prix</TableCell>
                 </TableRow>
             </TableHead>
             <TableBody>
                 {subscriptions.map((sub, index) => (
                     <TableRow key={index}>
                         <TableCell>{sub.duration}</TableCell>
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
