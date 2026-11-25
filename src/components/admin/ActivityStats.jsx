import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../../apis/adminApi';
import { UserActivity } from "./UserActivity";

// Admin page grouping every statistic about how users actually use the platform
export function ActivityStats() {
    const Auth = useAuth();
    const admin = Auth.getUser();
    const [topChronometerUsers, setTopChronometerUsers] = useState([]);

    useEffect(() => {
        adminApi.getTopChronometerUsers(admin)
            .then(res => setTopChronometerUsers(res.data))
            .catch(err => console.error('Error fetching top chronometer users', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box p={4}>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h4" align="center">Activity</Typography>
                </Grid>

                <Grid item xs={12}>
                    <UserActivity admin={admin} />
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <Box p={3}>
                            <Typography variant="h5" gutterBottom>
                                Top 50 Users — Time Spent in Chronometer
                            </Typography>
                            {topChronometerUsers.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No data available.</Typography>
                            ) : (
                                <TableContainer sx={{ overflowX: 'auto' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Username</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell align="right">Total Hours</TableCell>
                                                <TableCell align="right">Total Seconds</TableCell>
                                                <TableCell align="right">📵 هاتف</TableCell>
                                                <TableCell align="right">👁 غياب وجه</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topChronometerUsers.map((user, index) => (
                                                <TableRow key={user.userId} hover>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{user.name}</TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell align="right">{user.totalHours.toFixed(2)}</TableCell>
                                                    <TableCell align="right">{user.totalSeconds.toLocaleString()}</TableCell>
                                                    <TableCell align="right">{user.totalPhoneDetectedCount?.toLocaleString() ?? '—'}</TableCell>
                                                    <TableCell align="right">{user.totalFaceAbsentCount?.toLocaleString() ?? '—'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
