import React, { useState, useEffect } from "react";
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Collapse, IconButton
} from '@mui/material';
import { adminApi } from '../../apis/adminApi';
import { useAuth } from '../context/AuthContext';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

export function Users() {
  const Auth = useAuth();
  const admin = Auth.getUser();
  const [users, setUsers] = useState([]);
  const [deletedUser, setDeletedUser] = useState();
  const [filter, setFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [months, setMonths] = useState(0);
  const [openDialogSession, setOpenDialogSession] = useState(false);
  const [openRows, setOpenRows] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.getUsers(admin);
        console.log("users"+response);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [deletedUser, admin]);

  const handleDeleteUser = async (username) => {
    try {
      const response = await adminApi.deleteUser(admin, username);
      setDeletedUser(response.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleActivateUser = async (username, months, numberOfSub) => {
    try {
      await adminApi.activateAndExtendUser(admin, username, months, numberOfSub);
      const response = await adminApi.getUsers(admin);
      setUsers(response.data);
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const handleResetSessionUser = async (username) => {
    try {
      await adminApi.resetSession(admin, username);
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  };

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleOpenDialogSession = (user) => {
    setSelectedUser(user);
    setOpenDialogSession(true);
  };

  const handleCloseDialogSession = () => {
    setOpenDialogSession(false);
    setSelectedUser(null);
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

  const handleSubmitResetSession = () => {
    if (selectedUser) {
      handleResetSessionUser(selectedUser.username);
      handleCloseDialogSession();
    }
  };

  const toggleRow = (userId) => {
    setOpenRows(prevState => ({ ...prevState, [userId]: !prevState[userId] }));
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(filter.toLowerCase())
  );

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
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
               <TableCell>étendre</TableCell>
              <TableCell>Session</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
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
                  <TableCell>{user.numberPhone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      disabled={user.role === 'ADMIN'}
                      onClick={() => handleDeleteUser(user.username)}
                    >
                      Supprimer
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
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleOpenDialogSession(user)}
                    >
                      Réinitialiser
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    <Collapse in={openRows[user.id]} timeout="auto" unmountOnExit>
                      <Table size="small" aria-label="subscriptions">
                        <TableHead>
                          <TableRow>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {user.subscriptions.map((subscription) => (
                            <TableRow key={subscription.id}>
                              <TableCell>{subscription.startDate}</TableCell>
                              <TableCell>{subscription.duration}</TableCell>
                              <TableCell>{subscription.expireDate}</TableCell>
                              <TableCell>{subscription.price}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Session Reset Dialog */}
      <Dialog open={openDialogSession} onClose={handleCloseDialogSession}>
        <DialogTitle>Réinitialiser la session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir réinitialiser la session de l'utilisateur <strong>{selectedUser?.username}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogSession} color="primary">Annuler</Button>
          <Button onClick={handleSubmitResetSession} color="primary">Soumettre</Button>
        </DialogActions>
      </Dialog>

      {/* Activate User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Activer le candidat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir activer cet utilisateur ?
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
          <Button onClick={handleCloseDialog} color="primary">Annuler</Button>
          <Button onClick={handleSubmitActivate} color="primary">Soumettre</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
