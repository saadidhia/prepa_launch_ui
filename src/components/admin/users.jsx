import React, { useState, useEffect } from "react";
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Collapse, IconButton, Select, MenuItem, FormControl, InputLabel
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
  const [activateStartDate, setActivateStartDate] = useState("");
  const [activateDuration, setActivateDuration] = useState("ONE");
  const [activatePrice, setActivatePrice] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete dialog
const [userToDelete, setUserToDelete] = useState(null); // State to hold the user to delete



  const handleActivateUser = async (userId, subscription) => {
    try {
      console.log("hehhehhehe "+ userId)
      await adminApi.activateAndExtendUser(admin, userId, subscription);
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers(admin);
      console.log("users  "+JSON.stringify(response.data, null, 2));
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  useEffect(() => {
   
    fetchUsers();
  }, [deletedUser]);

  const getLastSubscription = (subscriptions) => {
    return subscriptions
      .filter(subscription => subscription.expireDate) // Filter out subscriptions without an expiration date
      .sort((a, b) => new Date(b.expireDate) - new Date(a.expireDate))[0]; // Sort by expireDate in descending order
  };
  

  const handleDeleteUser = async (username) => {
    try {
      const response = await adminApi.deleteUser(admin, username);
      setDeletedUser(response.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

// Function to open the delete confirmation dialog
const handleOpenDeleteDialog = (user) => {
  setUserToDelete(user);
  setOpenDeleteDialog(true);
};

// Function to close the delete confirmation dialog
const handleCloseDeleteDialog = () => {
  setOpenDeleteDialog(false);
  setUserToDelete(null);
};

// Function to handle deletion
const handleSubmitDelete = async () => {
  if (userToDelete) {
    await handleDeleteUser(userToDelete.username);
    handleCloseDeleteDialog();
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
      const subscription = {
        startDate: activateStartDate,
        duration: activateDuration,
        price: activatePrice
      };
      handleActivateUser(selectedUser.id, subscription); // Pass userId and subscription entity
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

  const isLastSubscriptionExpired = (subscriptions) => {
    const lastSubscription = getLastSubscription(subscriptions);
    if (!lastSubscription) return false; // No valid subscriptions found
    const now = new Date();
    return new Date(lastSubscription.expireDate) < now;
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
    onClick={() => handleOpenDeleteDialog(user)} // Open delete confirmation dialog
  >
    Supprimer
  </Button>
</TableCell>
                  <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        disabled={user.role === 'ADMIN' || !isLastSubscriptionExpired(user.subscriptions)}
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
  <DialogTitle>Activer l'utilisateur</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Êtes-vous sûr de vouloir activer cet utilisateur ?
    </DialogContentText>
    
    {/* Start Date Picker */}
     <input
              type="date"
              className="form-control mt-1"
              value={activateStartDate}
              onChange={(e) => setActivateStartDate(e.target.value)}
      />

    {/* Duration Selector */}
    <FormControl fullWidth margin="dense">
      <InputLabel>Duration (Months)</InputLabel>
      <Select
        value={activateDuration}
        onChange={(e) => setActivateDuration(e.target.value)}
        label="Duration (Months)"
      >
        <MenuItem value="ONE">ONE</MenuItem>
        <MenuItem value="THREE">THREE</MenuItem>
        <MenuItem value="SIX">SIX</MenuItem>
        <MenuItem value="TEN">TEN</MenuItem>
      </Select>
    </FormControl>

    {/* Price Input */}
    <TextField
      margin="dense"
      label="Price"
      type="number"
      fullWidth
      value={activatePrice}
      onChange={(e) => setActivatePrice(Number(e.target.value))}
    />
  </DialogContent>
  
  <DialogActions>
    <Button onClick={handleCloseDialog} color="primary">Annuler</Button>
    <Button onClick={handleSubmitActivate} color="primary">Soumettre</Button>
  </DialogActions>
</Dialog>

<Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
  <DialogTitle>Supprimer l'utilisateur</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.username}</strong> ?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDeleteDialog} color="primary">Annuler</Button>
    <Button onClick={handleSubmitDelete} color="primary">Soumettre</Button>
  </DialogActions>
</Dialog>
    </div>
  );
}
