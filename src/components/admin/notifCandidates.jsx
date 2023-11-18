import React, { useState, useEffect } from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { adminApi } from '../../apis/adminApi';
import { useAuth } from '../context/AuthContext';

export function NotifCandidates() {
  const Auth = useAuth();
  const [notifUsers, setNotifUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMonths, setNewMonths] = useState('');
  const fetchNotifiedUsers = async () => {
    const currentAdmin = Auth.getUser();
    try {
      console.log("fetch "+currentAdmin);
      const response = await adminApi.getNotifiedUsers(currentAdmin);
      const data = response.data;
      setNotifUsers(data);
    } catch (error) {
      console.error('Error fetching Notified users:', error);
    }
  };

  useEffect(() => {
    fetchNotifiedUsers();
  }, []);


  const openDialog = (user) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const saveChanges = async (username) => {

    if (newMonths==null || newMonths==='' || username==null || username===''){
      return ;
    }
    try {
      const currentAdmin = Auth.getUser();
     const response= await adminApi.extendUser(currentAdmin,username,newMonths);
     if (response.status === 200) {
      // Extension successful, now fetch the updated list of notified users
      fetchNotifiedUsers();
    }else {
      console.error("Not able to get new Notified Users")
    }
    setIsDialogOpen(false);

    }catch(error) {
      console.error('Error fetching Notified users:', error);
    }
    
  };

  return (
    
    <div>
      <h2>User Table</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
          <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone number</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Months</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Action</TableCell> {/* Add a new column for the delete button */}
            </TableRow>
          </TableHead>
          <TableBody>
            {notifUsers.map((user) => (
              <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.numberPhone}</TableCell>
                <TableCell>{user.level}</TableCell>
                <TableCell>{user.field}</TableCell>
                <TableCell>{user.startDate}</TableCell>
                <TableCell>{user.months}</TableCell>
                <TableCell>{user.expireDate}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => openDialog(user)}
                  >
                    Extend
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    

    {selectedUser !==null &&
    <Dialog open={isDialogOpen} onClose={closeDialog}>
      
      <DialogTitle>Extend Months for Username {selectedUser.username} </DialogTitle>
      <DialogContent>
        <TextField
          label="New Months"
          value={newMonths}
          onChange={(e) => setNewMonths(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={()=>saveChanges(selectedUser.username)} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
}
    </div>
  );
}
