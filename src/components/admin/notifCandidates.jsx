import React, { useState, useEffect } from "react"
import { Button,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { adminApi } from '../../apis/adminApi'
import { useAuth } from '../context/AuthContext'


export function NotifCandidates() {

    const Auth = useAuth()
    const [notifUsers, setNotifUsers] = useState([]);

    useEffect(() => {
        // Fetch Notified candidates data when the component mounts
        const fetchNotifiedUsers = async () => {
          const currentAdmin = Auth.getUser();
          try {
              console.log(currentAdmin)
              const response = await adminApi.getNotifiedUsers(currentAdmin)
              const data = response.data;
              setNotifUsers(data);
          } catch (error) {
              console.error('Error fetching Notified users:', error);
          }
      };
        fetchNotifiedUsers();
    }, [Auth]);

    return ( 
        (
            <div >
            <h2>User Table</h2>
            <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
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
                <TableCell>{user.level}</TableCell>
                <TableCell>{user.field}</TableCell>
                <TableCell>{user.startDate}</TableCell>
                <TableCell>{user.months}</TableCell>
                <TableCell>{user.expireDate}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                 //   onClick={() => handleDeleteUser(user.username)}
                  >
                    Extend
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
          </div>
          
        )
    )
}