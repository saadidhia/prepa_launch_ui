import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../../apis/adminApi';
import { Box, Grid, Typography, Paper, CircularProgress } from "@mui/material";

export function UsersStat() {
    const Auth = useAuth();
    const admin = Auth.getUser();
    const [all, setAll] = useState(0);
    const [active, setActive] = useState(0);
    const [primary, setPrimary] = useState(0);
    const [secondary, setSecondary] = useState(0);
    const [users, setUsers] = useState(0);
    const [math, setMath] = useState(0);
    const [science, setScience] = useState(0);
    const [tech, setTech] = useState(0);
    const [eco, setEco] = useState(0);
    const [letter, setLetter] = useState(0);
    const [sport, setSport] = useState(0);
    const [admins, setAdmins] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchStatics = async () => { 
        try {
            const response = await adminApi.getStatics(admin);
            const data = response.data;
            setUsers(data.USERS);
            setAdmins(data.ADMINS);
            setMath(data.MATH);
            setScience(data.SCIENCE);
            setTech(data.TECH);
            setEco(data.ECO);
            setLetter(data.LETTER);
            setSport(data.SPORT);
            setActive(data.ACTIVE);
            setSecondary(data.SECONDARY);
            setPrimary(data.PRIMARY);
            setAll(data.ALL);
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
                    { label: 'Users', value: users },
                    { label: 'Admins', value: admins },
                    { label: 'All', value: all },
                    { label: 'MATH', value: math },
                    { label: 'SCIENCE', value: science },
                    { label: 'TECH', value: tech },
                    { label: 'ECO', value: eco },
                    { label: 'LETTER', value: letter },
                    { label: 'SPORT', value: sport },
                    { label: 'Troisieme', value: primary },
                    { label: 'Bac', value: secondary },
                    { label: 'Active', value: active },
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
