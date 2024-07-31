import React, { useState, useEffect } from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { adminApi } from '../../apis/adminApi';
import { useAuth } from '../context/AuthContext';

export function Users() {
    const Auth = useAuth();
    const admin = Auth.getUser();
    const [users, setUsers] = useState([]);
    const [deletedUser, setDeletedUser] = useState();
    const [filter, setFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [months, setMonths] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            const currentAdmin = Auth.getUser();
            try {
                const response = await adminApi.getUsers(currentAdmin);
                console.log("response", response);
                const data = response.data;
                console.log("data users", data);
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [deletedUser]);

    const handleDeleteUser = async (username) => {
        console.log("username!", username);
        await adminApi.deleteUser(admin, username).then(
            (response) => setDeletedUser(response.data)
        );
    }

    const handleActivateUser = async (username, months, numberOfSub) => {
        try {
            await adminApi.activateAndExtendUser(admin, username, months, numberOfSub);
            const response = await adminApi.getUsers(admin);
            setUsers(response.data);
            console.log("User activated and list updated", response.data);
        } catch (error) {
            console.error('Error activating user:', error);
        }
    }

    const handleOpenDialog = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setMonths(0);
    };

    const handleSubmitActivate = () => {
        if (selectedUser) {
            handleActivateUser(selectedUser.username, months, selectedUser.numberOfSubscription);
            handleCloseDialog();
        }
    };

    const filteredUsers = users.filter(user => {
        return user.email.toLowerCase().includes(filter.toLowerCase());
    });

    return (
        <div>
            <h2>User Table</h2>
            <TextField
                label="Filter by Email"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Months</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Number Subscription</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell colSpan={2} align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.gender}</TableCell>
                                <TableCell>{user.numberPhone}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.level}</TableCell>
                                <TableCell>{user.startDate}</TableCell>
                                <TableCell>{user.months}</TableCell>
                                <TableCell>{user.expireDate}</TableCell>
                                <TableCell>{user.numberOfSubscription}</TableCell>
                                <TableCell>{(!user.isAccountLocked || user.isAccountLocked == null) ? "Active" : "Inactive"}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        disabled={user.role === 'ADMIN'}
                                        onClick={() => handleDeleteUser(user.username)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        disabled={user.role === 'ADMIN' || (user.isAccountLocked == null || !user.isAccountLocked)}
                                        onClick={() => handleOpenDialog(user)}
                                    >
                                        Activate
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Activer le candidat</DialogTitle>
                <DialogContent>
                    <DialogContentText>

                        Entrez le nombre de mois pour prolonger l'abonnement de l'utilisateur.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Months"
                        type="number"
                        fullWidth
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitActivate} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
