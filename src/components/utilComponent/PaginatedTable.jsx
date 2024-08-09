import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { timersApi } from '../../apis/timerApi';

const PaginatedTable = ({ rows, columns, onPauseTimer, onResumeTimer, actualResponse,fetchTimers  }) => {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [editRowId, setEditRowId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [description, setDescription] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (description) => {
    setSelectedDescription(description);
    setViewDialogOpen(true);
  };

  const handleCloseModal = () => {
    setViewDialogOpen(false);
    setSelectedDescription('');
  };
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setDescription('');
    setEditRowId(null);
  };

  const handleUpdate = async () => {
    try {
      const response = await timersApi.updateTimerDescription(user, editRowId, { description });
      handleCloseEditDialog();
      fetchTimers();
    } catch (error) {
      console.error('Failed to edit timer description:', error);
    }
  };
  const handleOpenEditDialog = (row) => {
    setEditRowId(row.id);
    setDescription(row.description);
    setEditDialogOpen(true);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const isWithin48Hours = (dateTimeString) => {
    const currentTime = new Date();
    const eventTime = new Date(dateTimeString);
    const timeDifference = currentTime - eventTime;
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    return hoursDifference <= 48;
  };

  const renderActionButtons = (row) => {
    const shouldShowEditButton = actualResponse.some(response =>
      response.id === row.id && isWithin48Hours(response.start)
    );

    return shouldShowEditButton ? (
      <Button variant="contained" color="primary" onClick={() => handleOpenEditDialog(row)}>
        Edit
      </Button>
    ) : null;
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>{column.label}</TableCell>
              ))}
              <TableCell >Action</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.id === 'description' ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleOpenModal(row[column.id])}
                      >
                        VIEW
                      </Button>
                    ) : (
                      row[column.id]
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  {renderActionButtons(row)}
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={columns.length} />
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={viewDialogOpen} onClose={handleCloseModal}>
        <DialogTitle>Description</DialogTitle>
        <DialogContent>
          <p>{selectedDescription}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Description</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PaginatedTable;
