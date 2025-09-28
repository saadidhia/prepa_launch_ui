import React, { useState, useEffect } from 'react';
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
  TextField,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useAuth } from '../context/AuthContext';
import { chronometersApi } from '../../apis/chronometersApi';
import subjects from '../../subjects';

const PaginatedTable = ({ rows, columns, onPauseTimer, onResumeTimer, actualResponse, fetchTimers }) => {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [editRowId, setEditRowId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const userSubjects = subjects.filter(subject => subject.section.includes(user.data.field));

  // force re-render each minute to update timers
  useEffect(() => {
    const interval = setInterval(() => {
      setPage(p => p); // trigger refresh
    }, 60000); // every 60s
    return () => clearInterval(interval);
  }, []);

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
      await chronometersApi.updateChronometer(user, editRowId, { description, subject });
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

  const handleOpenDeleteDialog = (rowId) => {
    setDeleteRowId(rowId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteRowId(null);
  };

  const handleDelete = async () => {
    try {
      await chronometersApi.deleteChronometer(user, deleteRowId);
      handleCloseDeleteDialog();
      fetchTimers();
    } catch (error) {
      console.error('Failed to delete timer:', error);
    }
  };

  const CheckItemChrononometerIdInLocalStorage = () => {
    return localStorage.getItem("chronometerId") !== null;
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  // helper: calculate remaining time
  const getRemainingTime = (dateTimeString, limitHours) => {
    const currentTime = new Date();
    const eventTime = new Date(dateTimeString);
    const endTime = new Date(eventTime.getTime() + limitHours * 60 * 60 * 1000);
    const diff = endTime - currentTime;

    if (diff <= 0) return null; // expired

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const renderActionButtons = (row) => {
    const response = actualResponse.find(r => r.id === row.id);

    if (!response) return null;

    const editRemaining = getRemainingTime(response.created_at, 48);
    const deleteRemaining = getRemainingTime(response.created_at, 24);

    return (
      <>
        {editRemaining && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenEditDialog(row)}
            >
              Modifier
            </Button>
            <span style={{ fontSize: "12px", color: "gray", display: "flex", alignItems: "center" }}>
              <HourglassEmptyIcon fontSize="small" style={{ marginRight: "2px" }} />
              {editRemaining}
            </span>
          </div>
        )}
        {deleteRemaining && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: "8px" }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleOpenDeleteDialog(row.id)}
              disabled={CheckItemChrononometerIdInLocalStorage()}
            >
              Supprimer
            </Button>
            <span style={{ fontSize: "12px", color: "gray", display: "flex", alignItems: "center" }}>
              <HourglassEmptyIcon fontSize="small" style={{ marginRight: "2px" }} />
              {deleteRemaining}
            </span>
          </div>
        )}
      </>
    );
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
              <TableCell>Action</TableCell>
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
                        Voir
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

      {/* View dialog */}
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

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Chronometer</DialogTitle>
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
          <InputLabel id="subject-label">Matière</InputLabel>
          <Select
            labelId="subject-label"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            label="Matière"
          >
            {userSubjects.map((subject, index) => (
              <MenuItem key={index} value={subject.name}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
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

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce minuteur ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PaginatedTable;
