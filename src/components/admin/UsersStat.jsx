import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../../apis/adminApi';
import { Box, Grid, Typography, Paper, CircularProgress } from "@mui/material";

export function UsersStat() {
    const Auth = useAuth();
    const admin = Auth.getUser();
    const [all, setAll] = useState(0);
    const [active, setActive] = useState(0);
    const [troisieme, setTroisieme] = useState(0);
    const [bac, setBac] = useState(0);
 //   const [users, setUsers] = useState(0);
    const [verified, setVerified] = useState(0);
    const [nonVerified, setNonVerified] = useState(0);
    const [math, setMath] = useState(0);
    const [science, setScience] = useState(0);
    const [tech, setTech] = useState(0);
    const [eco, setEco] = useState(0);
    const [letter, setLetter] = useState(0);
    const [sport, setSport] = useState(0);
    const [admins, setAdmins] = useState(0);
    const [male, setMale] = useState(0);
    const [female, setFemale] = useState(0);    
    const [allemand, setAllemand] = useState(0);
    const [espagnol, setEspagnol] = useState(0);
    const [italien, setItalien] = useState(0);
    const [turc, setTurc] = useState(0);
    const [dessin, setDessin] = useState(0);
    const [chinois, setChinois] = useState(0);

    const [loading, setLoading] = useState(true);

    const fetchStatics = async () => { 
        try {
            const response = await adminApi.getStatics(admin);
            const data = response.data;
            setVerified(data.VERIFIED);
            setNonVerified(data.NON_VERIFIED);
            setAdmins(data.ADMINS);
            setMath(data.MATH);
            setScience(data.SCIENCE);
            setTech(data.TECH);
            setEco(data.ECO);
            setLetter(data.LETTER);
            setSport(data.SPORT);
            setActive(data.ACTIVE);
            setTroisieme(data.TROISIEME);
            setBac(data.BAC);
            setAll(data.ALL);
            setMale(data.MALE);
            setFemale(data.FEMALE);
            setAllemand(data.ALLEMAND);
            setEspagnol(data.ESPAGNOL);
            setItalien(data.ITALIEN);
            setTurc(data.TURC);
            setDessin(data.DESSIN);
            setChinois(data.CHINOIS);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Statics of Users', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatics();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box p={4}>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h4" align="center">User Statistics</Typography>
                </Grid>
                {[
                    { label: 'Verified', value: verified },
                    { label: 'Non Verified', value: nonVerified },
                    { label: 'Admins', value: admins },
                    { label: 'All', value: all },
                    { label: 'MATH', value: math },
                    { label: 'SCIENCE', value: science },
                    { label: 'TECH', value: tech },
                    { label: 'ECO', value: eco },
                    { label: 'LETTER', value: letter },
                    { label: 'SPORT', value: sport },
                    { label: 'TROISIEME', value: troisieme },
                    { label: 'BAC', value: bac },
                    { label: 'ACTIVE', value: active },
                    { label: 'MALE', value: male },
                    { label: 'FEMALE', value: female },
                    { label: 'ALLEMAND', value: allemand },
                    { label: 'ESPAGNOL', value: espagnol },
                    { label: 'ITALIEN', value: italien },   
                    { label: 'TURC', value: turc },
                    { label: 'DESSIN', value: dessin },
                    { label: 'CHINOIS', value: chinois },
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Paper elevation={3}>
                            <Box p={2} textAlign="center">
                                <Typography variant="h6">{stat.label}</Typography>
                                <Typography variant="h4">{stat.value}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
