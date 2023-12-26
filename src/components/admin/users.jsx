import React, { useState, useEffect } from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import { adminApi } from '../../apis/adminApi';
import { useAuth } from '../context/AuthContext';

export function Users() {
    const Auth = useAuth();
    const admin = Auth.getUser();
    const [users, setUsers] = useState([]);
    const [deletedUser, setDeletedUser] = useState();
    const [filter, setFilter] = useState(''); // State to store the filter input

    useEffect(() => {
        // Fetch user data when the component mounts
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
    }, [deletedUser, Auth]);

    const handleDeleteUser = async (username) => {
        console.log("username!", username);
        await adminApi.deleteUser(admin, username).then(
            (response) => setDeletedUser(response.data)
        );
    }

    // Function to filter the users based on the filter text
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
                            <TableCell>Action</TableCell>
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
