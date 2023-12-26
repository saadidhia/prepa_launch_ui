import React, { useEffect, useState } from 'react';
import { candidatsApi } from '../../apis/candidatsApi';
import { useAuth } from '../context/AuthContext'
import { Typography, Paper, Grid } from '@mui/material';
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
    const [isNotified, setIsNotified] = useState('');
    const [numberPhone, setNumberPhone] = useState('');
    const [field, setField] = useState('')
    const [gender, setGender] = useState('')



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
        const fetchCards = async () => {

            try {
                const response = await candidatsApi.getMyProfile(user)
                console.log("Profile", response)
                setEmail(response.data.email)
                setField(response.data.field)
                setName(response.data.name)
                setUsername(response.data.username)
                setStartDate(response.data.startDate)
                setMonths(response.data.months)
                setExpireDate(response.data.expireDate)
                setIsNotified(setNotified(response.data.isNotified))
                setLevel(response.data.level)
                setNumberPhone(response.data.numberPhone)
                setField(response.data.field)
                setGender(response.data.gender);
            } catch (error) {
                console.error('Error fetching Profile:', error);

            }
        }
        fetchCards()
    }, [])

    function setNotified(notif) {
        if (notif === true) {
            return 'YES'
        } else {
            return 'NO'
        }
    }

    return (
        <Paper sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                User Informations
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
                    <Typography variant="subtitle1">
                        Username: {username}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Name: {name}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Email: {email}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Level: {level}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Field: {field}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Start Date: {startDate}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Months: {months}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Expire Date: {expireDate}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Is Notified: {isNotified}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Number Phone: {numberPhone}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    )
}