import React, { useState, useEffect } from "react";
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Collapse, IconButton
} from '@mui/material';
import { adminApi } from '../../apis/adminApi';
import { useAuth } from '../context/AuthContext';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

export function NotVerifiedUsers() {
  const Auth = useAuth();
  const admin = Auth.getUser();
  const [users, setUsers] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getNotVerifiedUsers(admin);
      setUsers(response.data ?? []);
    } catch (error) {
      setUsers([]);
      console.error('Error fetching not verified users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRow = (userId) => {
    setOpenRows(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleOpenVerifyDialog = (user) => {
    setSelectedUser(user);
    setOpenVerifyDialog(true);
  };

  const handleCloseVerifyDialog = () => {
    setOpenVerifyDialog(false);
    setSelectedUser(null);
  };

  const handleVerifyUser = async () => {
    if (selectedUser) {
      try {
        await adminApi.verifyUser(admin, selectedUser.username);
        handleCloseVerifyDialog();
        fetchUsers();
      } catch (error) {
        console.error('Error verifying user:', error);
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Not Verified Users</h2>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Option</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow>
                  <TableCell>
                    <IconButton onClick={() => toggleRow(user.id)}>
                      {openRows[user.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>{user.level}</TableCell>
                  <TableCell>{user.field}</TableCell>
                  <TableCell>{user.option}</TableCell>
                  <TableCell>{user.city}</TableCell>
                  <TableCell>{user.numberPhone}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleOpenVerifyDialog(user)}
                    >
                      Vérifier
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Collapsible subscriptions row */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    <Collapse in={openRows[user.id]} timeout="auto" unmountOnExit>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(user.subscriptions ?? []).map((subscription) => (
                            <TableRow key={subscription.id}>
                              <TableCell>{subscription.startDate}</TableCell>
                              <TableCell>{subscription.expireDate}</TableCell>
                              <TableCell>{subscription.price} Dt</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align="center" style={{ color: '#888', padding: 32 }}>
                  No unverified users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Verify User Dialog */}
      <Dialog open={openVerifyDialog} onClose={handleCloseVerifyDialog}>
        <DialogTitle>Vérifier l'utilisateur</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir vérifier l'utilisateur <strong>{selectedUser?.username}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVerifyDialog} color="primary">Annuler</Button>
          <Button onClick={handleVerifyUser} color="success" variant="contained">Vérifier</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}