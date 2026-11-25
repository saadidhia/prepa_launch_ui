import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Paper, Typography, Chip, TextField, MenuItem, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TableSortLabel, TablePagination, Tooltip, CircularProgress,
} from "@mui/material";
import { adminApi } from "../../apis/adminApi";

const DAY = 24 * 60 * 60 * 1000;

// Usage status, from the most recent sign of activity (login, request, study, quiz, PDF, message)
const STATUSES = {
    ONLINE: { label: 'Online now', color: 'success' },
    ACTIVE: { label: 'Active (7 days)', color: 'primary' },
    OCCASIONAL: { label: 'Occasional (30 days)', color: 'info' },
    INACTIVE: { label: 'Inactive (> 30 days)', color: 'warning' },
    // Not "never used": a user can have logged in and browsed before login tracking existed without leaving any trace
    NEVER: { label: 'No activity found', color: 'error' },
};

function getStatus(u, now) {
    if (u.online) return 'ONLINE';
    if (!u.lastActivityAt) return 'NEVER';
    const age = now - new Date(u.lastActivityAt).getTime();
    if (age <= 7 * DAY) return 'ACTIVE';
    if (age <= 30 * DAY) return 'OCCASIONAL';
    return 'INACTIVE';
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function timeAgo(value, now) {
    if (!value) return 'never';
    const diff = now - new Date(value).getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `${Math.max(minutes, 0)} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    if (days < 60) return `${days} days ago`;
    return `${Math.round(days / 30)} months ago`;
}

function formatHours(seconds) {
    if (!seconds) return '0 h';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

const COLUMNS = [
    { id: 'name', label: 'User', sortValue: u => (u.name || u.username || '').toLowerCase() },
    { id: 'status', label: 'Status', sortValue: u => ['ONLINE', 'ACTIVE', 'OCCASIONAL', 'INACTIVE', 'NEVER'].indexOf(u.status) },
    { id: 'loginCount', label: 'Logins', align: 'right', sortValue: u => u.loginCount },
    { id: 'lastLoginAt', label: 'Last login', sortValue: u => u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0 },
    { id: 'lastActivityAt', label: 'Last activity', sortValue: u => u.lastActivityAt ? new Date(u.lastActivityAt).getTime() : 0 },
    { id: 'studySeconds', label: 'Study time', align: 'right', sortValue: u => u.studySeconds },
    { id: 'studySessions', label: 'Study sessions', align: 'right', sortValue: u => u.studySessions },
    { id: 'quizAttempts', label: 'Quizzes', align: 'right', sortValue: u => u.quizAttempts },
    { id: 'pdfsOpened', label: 'PDFs', align: 'right', sortValue: u => u.pdfsOpened },
    { id: 'messagesSent', label: 'Messages', align: 'right', sortValue: u => u.messagesSent },
    { id: 'agendaItems', label: 'Agenda', align: 'right', sortValue: u => u.agendaItems },
    { id: 'cards', label: 'Cards', align: 'right', sortValue: u => u.cards },
    { id: 'registeredOn', label: 'Registered', sortValue: u => u.registeredOn || '' },
    { id: 'expiresOn', label: 'Expires', sortValue: u => u.expiresOn || '' },
];

export function UserActivity({ admin }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [orderBy, setOrderBy] = useState('lastActivityAt');
    const [order, setOrder] = useState('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [now] = useState(() => Date.now());

    useEffect(() => {
        adminApi.getUserActivity(admin)
            .then(res => setUsers(res.data))
            .catch(err => {
                console.error('Error fetching user activity', err);
                setError('Could not load user activity.');
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const withStatus = useMemo(
        () => users.map(u => ({ ...u, status: getStatus(u, now) })),
        [users, now]
    );

    const counts = useMemo(() => {
        const c = { ALL: withStatus.length };
        Object.keys(STATUSES).forEach(k => { c[k] = 0; });
        withStatus.forEach(u => { c[u.status] += 1; });
        return c;
    }, [withStatus]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        const col = COLUMNS.find(c => c.id === orderBy);
        return withStatus
            .filter(u => statusFilter === 'ALL' || u.status === statusFilter)
            .filter(u => !q || [u.name, u.username, u.email].some(v => v && v.toLowerCase().includes(q)))
            .sort((a, b) => {
                const va = col.sortValue(a);
                const vb = col.sortValue(b);
                const cmp = va < vb ? -1 : va > vb ? 1 : 0;
                return order === 'asc' ? cmp : -cmp;
            });
    }, [withStatus, search, statusFilter, orderBy, order]);

    const handleSort = (id) => {
        if (orderBy === id) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(id);
            setOrder('desc');
        }
    };

    return (
        <Paper elevation={3}>
            <Box p={3}>
                <Typography variant="h5" gutterBottom>User Activity — who really uses the platform</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    "Last activity" is the latest of: login, any request to the app, study session (chronometer),
                    camera monitoring, quiz attempt, PDF opened, message sent, agenda item or card. Login count and
                    last login are only recorded from the moment this tracking was deployed; the other history goes
                    back to the start. So "No activity found" means no trace was found, not that the user never logged
                    in: someone who only logged in, browsed and logged out before the deploy leaves no trace.
                </Typography>

                {loading ? (
                    <Box p={4} textAlign="center"><CircularProgress /></Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <>
                        <Grid container spacing={2} sx={{ my: 1 }}>
                            {Object.entries(STATUSES).map(([key, s]) => (
                                <Grid item xs={6} sm={4} md={2.4} key={key}>
                                    <Paper
                                        variant="outlined"
                                        onClick={() => { setStatusFilter(statusFilter === key ? 'ALL' : key); setPage(0); }}
                                        sx={{
                                            p: 2, textAlign: 'center', cursor: 'pointer',
                                            borderColor: statusFilter === key ? `${s.color}.main` : undefined,
                                            borderWidth: statusFilter === key ? 2 : 1,
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                                        <Typography variant="h4" color={`${s.color}.main`}>{counts[key]}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 }}>
                            <TextField
                                size="small"
                                label="Search name, username or email"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(0); }}
                                sx={{ minWidth: 280 }}
                            />
                            <TextField
                                select
                                size="small"
                                label="Status"
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                                sx={{ minWidth: 220 }}
                            >
                                <MenuItem value="ALL">All users ({counts.ALL})</MenuItem>
                                {Object.entries(STATUSES).map(([key, s]) => (
                                    <MenuItem key={key} value={key}>{s.label} ({counts[key]})</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {COLUMNS.map(col => (
                                            <TableCell key={col.id} align={col.align} sx={{ whiteSpace: 'nowrap' }}>
                                                <TableSortLabel
                                                    active={orderBy === col.id}
                                                    direction={orderBy === col.id ? order : 'desc'}
                                                    onClick={() => handleSort(col.id)}
                                                >
                                                    {col.label}
                                                </TableSortLabel>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(u => (
                                        <TableRow key={u.userId} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{u.name || u.username}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {u.username} · {u.email}{!u.verified && ' · not verified'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={STATUSES[u.status].label} color={STATUSES[u.status].color} />
                                            </TableCell>
                                            <TableCell align="right">{u.loginCount}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(u.lastLoginAt)}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                <Tooltip title={formatDate(u.lastActivityAt)}>
                                                    <span>{timeAgo(u.lastActivityAt, now)}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatHours(u.studySeconds)}</TableCell>
                                            <TableCell align="right">{u.studySessions}</TableCell>
                                            <TableCell align="right">{u.quizAttempts}</TableCell>
                                            <TableCell align="right">{u.pdfsOpened}</TableCell>
                                            <TableCell align="right">{u.messagesSent}</TableCell>
                                            <TableCell align="right">{u.agendaItems}</TableCell>
                                            <TableCell align="right">{u.cards}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{u.registeredOn || '—'}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{u.expiresOn || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {rows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={COLUMNS.length} align="center">No users match.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={rows.length}
                            page={page}
                            onPageChange={(_, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </>
                )}
            </Box>
        </Paper>
    );
}
