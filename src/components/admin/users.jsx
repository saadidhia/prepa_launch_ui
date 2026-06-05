import React, { useState, useEffect } from "react";
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Collapse, IconButton, Select, MenuItem, FormControl, InputLabel,
  Tab, FormControlLabel, Checkbox
} from '@mui/material';
import { adminApi } from '../../apis/adminApi';
import { useAuth } from '../context/AuthContext';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import '../../assets/css/activeSessionCount.css';

export function Users() {
  const Auth = useAuth();
  const admin = Auth.getUser();
  const [users, setUsers] = useState([]);
  const [deletedUser, setDeletedUser] = useState();
  const [filter, setFilter] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [months, setMonths] = useState(0);
  const [openDialogSession, setOpenDialogSession] = useState(false);
  const [openRows, setOpenRows] = useState({});
  const [activateStartDate, setActivateStartDate] = useState("");
  const [activateDuration, setActivateDuration] = useState("ONE");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeSessionsCount, setActiveSessionsCount] = useState(0);
  const [activeOnly, setActiveOnly] = useState(false);

  const pageSize = 10;

  const handleActivateUser = async (userId, subscription) => {
    try {
      await adminApi.activateAndExtendUser(admin, userId, subscription);
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  // add fetch function
const fetchActiveSessionsCount = async () => {
  try {
    const response = await adminApi.getActiveSessionsCount(admin);
    setActiveSessionsCount(response.data);
  } catch (error) {
    console.error('Error fetching active sessions count:', error);
  }
};

  const fetchUsers = async () => {
  try {
    const response = await adminApi.getUsers(admin, page, pageSize, filter, activeOnly);
    const data = response.data;
    setUsers(data.content ?? []);
    // handle both flat and nested structure
    setTotalPages(data.page?.totalPages ?? data.totalPages ?? 0);
    setTotalElements(data.page?.totalElements ?? data.totalElements ?? 0);
  } catch (error) {
    setUsers([]);
    console.error('Error fetching users:', error);
  }
};

  useEffect(() => {
    fetchUsers();
    fetchActiveSessionsCount();
  }, [deletedUser, page, filter, activeOnly]);

  const getLastSubscription = (subscriptions) => {
    return subscriptions
      .filter(subscription => subscription.expireDate)
      .sort((a, b) => new Date(b.expireDate) - new Date(a.expireDate))[0];
  };

  const handleDeleteUser = async (username) => {
    try {
      const response = await adminApi.deleteUser(admin, username);
      setDeletedUser(response.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

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
        duration: activateDuration
      };
      handleActivateUser(selectedUser.id, subscription);
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
    if (!lastSubscription) return false;
    const now = new Date();
    return new Date(lastSubscription.expireDate) < now;
  };

  const hasSubscriptionWithStartDate = (subscriptions, dateStr) => {
    if (!dateStr) return true;
    return subscriptions.some(sub => sub.startDate && sub.startDate.startsWith(dateStr));
  };

 const filteredUsers = users.filter(user =>
  user.email?.toLowerCase().includes(filter.toLowerCase()) &&
  hasSubscriptionWithStartDate(user.subscriptions ?? [], filterStartDate)
);

  return (
    <div>
      <div className="active-session-count-container">
        <div className="active-session-count">
          <span style={{ fontWeight: 'bold', marginRight: 8 }}>Active sessions:</span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'green', marginRight: 6 }}></span>
           {activeSessionsCount}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
        <TextField
          label="Filter by Email"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
        />
        <TextField
          label="Filter by Start Date"
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        {filterStartDate && (
          <Button size="small" onClick={() => setFilterStartDate('')}>Clear Date</Button>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
                setPage(0);
              }}
              color="success"
            />
          }
          label="Active only"
        />
      </div>

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
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
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
                  <TableCell>{user.level}</TableCell>
                  <TableCell>{user.field}</TableCell>
                  <TableCell>{user.option}</TableCell>
                  <TableCell>{user.numberPhone}</TableCell>
                  <TableCell>{user.city}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      disabled={user.role === 'ADMIN'}
                      onClick={() => handleOpenDeleteDialog(user)}
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
                    {user.hasSession ? (
                      <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'green', marginLeft: 4 }} title="Active"></span>
                    ) : (
                      <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#ccc', marginLeft: 4 }} title="Inactive"></span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    <Collapse in={openRows[user.id]} timeout="auto" unmountOnExit>
                      <Table size="small" aria-label="subscriptions">
                        <TableHead>
                          <TableRow>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {user.subscriptions.map((subscription) => (
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
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 16 }}>
        <Button
          variant="outlined"
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </Button>
        <span>Page {page + 1} of {totalPages} — {totalElements} users total</span>
        <Button
          variant="outlined"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>

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
          <input
            type="date"
            className="form-control mt-1"
            value={activateStartDate}
            onChange={(e) => setActivateStartDate(e.target.value)}
          />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Annuler</Button>
          <Button onClick={handleSubmitActivate} color="primary">Soumettre</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
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