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
    const [pc, setPc] = useState(0);
    const [mp, setMp] = useState(0);
    const [pt, setPt] = useState(0);
    const [bg, setBg] = useState(0);
    const [admins, setAdmins] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchStatics = async () => { 
        try {
            const response = await adminApi.getStatics(admin);
            const data = response.data;
            console.log("data", data);
            setUsers(data.USERS);
            setAdmins(data.ADMINS);
            setPc(data.PC);
            setMp(data.MP);
            setBg(data.BG);
            setPt(data.PT);
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
                    { label: 'PC', value: pc },
                    { label: 'MP', value: mp },
                    { label: 'BG', value: bg },
                    { label: 'PT', value: pt },
                    { label: 'Primary', value: primary },
                    { label: 'Secondary', value: secondary },
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
