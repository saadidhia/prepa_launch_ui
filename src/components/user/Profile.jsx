import React, { useEffect, useState } from 'react';
import { candidatsApi } from '../../apis/candidatsApi';
import { useAuth } from '../context/AuthContext';
import { Typography, Paper, Grid, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Avatar, Chip, Card, CardContent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import WcIcon from '@mui/icons-material/Wc';
import VerifiedIcon from '@mui/icons-material/Verified';
import femaleImage from '../../assets/statics/female.jpg';
import maleImage from '../../assets/statics/male.jpg';

export function Profile() {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [level, setLevel] = useState('');
    const [numberPhone, setNumberPhone] = useState('');
    const [newNumberPhone, setNewNumberPhone] = useState('');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [field, setField] = useState('');
    const [gender, setGender] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [subscriptions, setSubscriptions] = useState([]);

    const Auth = useAuth();
    const user = Auth.getUser();

    const fetchProfileData = async () => {
        try {
            const response = await candidatsApi.getMyProfile(user);
            const profileData = response.data;
    
            setEmail(profileData.email);
            setField(profileData.field);
            setName(profileData.name);
            setUsername(profileData.username);
            setLevel(profileData.level);
            setNumberPhone(profileData.numberPhone);
            setNewNumberPhone(profileData.numberPhone);
            setGender(profileData.gender === "FEMALE" ? "Femme" : "Homme");
    
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
    
    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleUpdatePhone = async () => {
        try {
            setErrorMessage('');
            setSuccessMessage('');

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
        <Box sx={{ 
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
        }}>
            {/* Profile Header Card */}
            <Card sx={{ 
                marginBottom: '24px',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                overflow: 'visible',
                position: 'relative',
            }}>
                {/* Gradient Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    height: '120px',
                    borderRadius: '20px 20px 0 0',
                    position: 'relative',
                }}>
                    {/* Decorative circles */}
                    <Box sx={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(40px)',
                    }} />
                </Box>

                <CardContent sx={{ padding: '0 32px 32px', marginTop: '-50px' }}>
                    {/* Avatar */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <Avatar
                            src={gender === 'Femme' ? femaleImage : maleImage}
                            sx={{
                                width: 120,
                                height: 120,
                                border: '6px solid white',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                            }}
                        />
                    </Box>

                    {/* Name and Username */}
                    <Box sx={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Typography variant="h4" sx={{ fontWeight: '700', color: '#1a1a1a' }}>
                                {name}
                            </Typography>
                            <VerifiedIcon sx={{ color: '#667eea', fontSize: 28 }} />
                        </Box>
                        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: '600' }}>
                            @{username}
                        </Typography>
                    </Box>

                    {/* Profile Information Grid */}
                    <Grid container spacing={3}>
                        {/* Email */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '2px solid #f3f4f6',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                                }
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <EmailIcon sx={{ color: 'white', fontSize: 24 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                        Email
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: '600' }}>
                                        {email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Gender */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '2px solid #f3f4f6',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                                }
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <WcIcon sx={{ color: 'white', fontSize: 24 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                        Genre
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: '600' }}>
                                        {gender}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Level */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '2px solid #f3f4f6',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                                }
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                        Niveau
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: '600' }}>
                                        {level}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Field */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '2px solid #f3f4f6',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                                }
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <WorkIcon sx={{ color: 'white', fontSize: 24 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                        Branche
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: '600' }}>
                                        {field}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Phone Number */}
                        <Grid item xs={12}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '2px solid #f3f4f6',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                                }
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <PhoneIcon sx={{ color: 'white', fontSize: 24 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                        Numéro de téléphone
                                    </Typography>
                                    {isEditingPhone ? (
                                        <TextField
                                            value={newNumberPhone}
                                            onChange={handlePhoneInputChange}
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    '& fieldset': {
                                                        borderColor: '#e5e7eb',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#667eea',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#667eea',
                                                    },
                                                },
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: '600' }}>
                                            {numberPhone}
                                        </Typography>
                                    )}
                                </Box>
                                {isEditingPhone ? (
                                    <Box sx={{ display: 'flex', gap: '8px' }}>
                                        <IconButton 
                                            onClick={handleUpdatePhone}
                                            sx={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                    transform: 'scale(1.05)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => {
                                                setIsEditingPhone(false);
                                                setNewNumberPhone(numberPhone);
                                                setErrorMessage('');
                                            }}
                                            sx={{
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                color: 'white',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                                    transform: 'scale(1.05)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <IconButton 
                                        onClick={() => setIsEditingPhone(true)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Messages */}
                    {errorMessage && (
                        <Box sx={{
                            marginTop: '20px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            animation: 'shake 0.5s ease',
                        }}>
                            <Typography sx={{ color: '#dc2626', fontWeight: '600', fontSize: '14px' }}>
                                {errorMessage}
                            </Typography>
                        </Box>
                    )}
                    {successMessage && (
                        <Box sx={{
                            marginTop: '20px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            animation: 'slideIn 0.5s ease',
                        }}>
                            <Typography sx={{ color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>
                                {successMessage}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Subscriptions Table */}
            <Card sx={{
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
            }}>
                <CardContent sx={{ padding: '32px' }}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: '700', 
                            color: '#1a1a1a',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        Mes Abonnements
                        <Chip 
                            label={subscriptions.length}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: '700',
                                height: '28px',
                            }}
                        />
                    </Typography>
                    <TableContainer sx={{ 
                        borderRadius: '16px',
                        border: '2px solid #f3f4f6',
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}>
                                    <TableCell sx={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Mois</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Date de début</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Date d'expiration</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Prix</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subscriptions.map((sub, index) => (
                                    <TableRow 
                                        key={index}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                            },
                                            transition: 'background-color 0.3s ease',
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: '600', color: '#374151' }}>{sub.duration}</TableCell>
                                        <TableCell sx={{ color: '#6b7280' }}>{sub.startDate}</TableCell>
                                        <TableCell sx={{ color: '#6b7280' }}>{sub.expireDate}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={`${sub.price} Dt`}
                                                sx={{
                                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                    color: '#667eea',
                                                    fontWeight: '700',
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </Box>
    );
}
