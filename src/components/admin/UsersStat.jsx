import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../../apis/adminApi';
import { Box, Grid, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem } from "@mui/material";
import { UserActivity } from "./UserActivity";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

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
    const [cityStats, setCityStats] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [topChronometerUsers, setTopChronometerUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // A school season runs Jun (startYear) → Jul (startYear + 1). From June onwards we are in the new season.
    const today = new Date();
    const currentSeasonStart = today.getMonth() >= 5 ? today.getFullYear() : today.getFullYear() - 1;
    const seasonOptions = Array.from({ length: 4 }, (_, i) => currentSeasonStart - i);
    const [seasonStart, setSeasonStart] = useState(currentSeasonStart);
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    const fetchMonthlyStats = async (startYear) => {
        setMonthlyLoading(true);
        try {
            const endYear = startYear + 1;
            const [resStart, resEnd] = await Promise.all([
                adminApi.getCandidatesPerMonth(admin, startYear),
                adminApi.getCandidatesPerMonth(admin, endYear),
            ]);
            // Jun startYear → Jul endYear (14 months)
            const months = Array.from({ length: 14 }, (_, i) => {
                const monthIndex = (5 + i) % 12; // starts at June (index 5)
                const year = i < 7 ? startYear : endYear; // Jun–Dec startYear, Jan–Jul endYear
                return { month: `${MONTH_NAMES[monthIndex]} ${year}`, count: 0 };
            });
            const startMap = Object.fromEntries(resStart.data.map(d => [d.month, d.count]));
            const endMap = Object.fromEntries(resEnd.data.map(d => [d.month, d.count]));
            months.forEach((entry, i) => {
                const monthNum = ((5 + i) % 12) + 1;
                entry.count = i < 7 ? (startMap[monthNum] ?? 0) : (endMap[monthNum] ?? 0);
            });
            setMonthlyStats(months);
        } catch (error) {
            console.error('Error fetching monthly stats', error);
            setMonthlyStats([]);
        } finally {
            setMonthlyLoading(false);
        }
    };

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

            const extractedCityStats = Object.entries(data)
                .filter(([key]) => key.startsWith('VERIFIED_CITY_'))
                .map(([key, value]) => ({
                    city: key.replace('VERIFIED_CITY_', '').replace(/_/g, ' '),
                    users: Number(value) || 0,
                }))
                .sort((a, b) => b.users - a.users);

            setCityStats(extractedCityStats);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching Statics of Users', error);
            setLoading(false);
        }
    };

    const fetchTopChronometerUsers = async () => {
        try {
            const response = await adminApi.getTopChronometerUsers(admin);
            setTopChronometerUsers(response.data);
        } catch (error) {
            console.error('Error fetching top chronometer users', error);
        }
    };

    useEffect(() => {
        fetchStatics();
        fetchTopChronometerUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchMonthlyStats(seasonStart);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seasonStart]);

    const monthlyTotal = monthlyStats.reduce((sum, m) => sum + m.count, 0);

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

                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <Box p={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                                <Typography variant="h5">
                                    New Registrations — Jun {seasonStart} → Jul {seasonStart + 1}
                                    <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                                        ({monthlyTotal} total)
                                    </Typography>
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    label="Season"
                                    value={seasonStart}
                                    onChange={e => setSeasonStart(Number(e.target.value))}
                                    sx={{ minWidth: 200 }}
                                >
                                    {seasonOptions.map(y => (
                                        <MenuItem key={y} value={y}>
                                            Jun {y} → Jul {y + 1}{y === currentSeasonStart ? ' (current)' : ''}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                            {monthlyLoading ? (
                                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            ) : monthlyStats.every(m => m.count === 0) ? (
                                <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                                    <Typography variant="h6">No data available</Typography>
                                    <Typography variant="body2">No registrations recorded from Jun {seasonStart} to Jul {seasonStart + 1}.</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={monthlyStats}
                                            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" angle={-35} textAnchor="end" interval={0} height={70} tick={{ fontSize: 11 }} />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="count" name="Users" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {cityStats.length > 0 && (
                    <Grid item xs={12}>
                        <Paper elevation={3}>
                            <Box p={3}>
                                <Typography variant="h5" gutterBottom>
                                    Users per City
                                </Typography>
                                <Box sx={{ width: '100%', height: 380 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={cityStats}
                                            margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="city"
                                                angle={-30}
                                                textAnchor="end"
                                                interval={0}
                                                height={80}
                                            />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="users" fill="#1976d2" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                )}

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
