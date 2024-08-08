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
  DialogActions
} from '@mui/material';

const PaginatedTable = ({ rows, columns, onPauseTimer, onResumeTimer, actualResponse }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (description) => {
    setSelectedDescription(description);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedDescription('');
  };

  const handlePause = (id) => {
    onPauseTimer(id);
  };

  const handleResume = (id) => {
    onResumeTimer(id);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    const isWithin48Hours = (dateTimeString) => {
     const currentTime = new Date();
     const eventTime = new Date(dateTimeString);
     const timeDifference = currentTime - eventTime;
     const hoursDifference = timeDifference / (1000 * 60 * 60);
     console.log(hoursDifference)
     return hoursDifference <= 48;
   };

const renderActionButtons = (row) => {
  // Check if there's at least one response within the 48-hour window
  const shouldShowEditButton = actualResponse.some(response => isWithin48Hours(response.start));

  // Return a single button if the condition is met, otherwise return null
  return shouldShowEditButton ? (
    <Button variant="contained" color="primary">
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
                                  {renderActionButtons(actualResponse)}
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
      <Dialog open={open} onClose={handleCloseModal}>
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
    </Paper>
  );
};

export default PaginatedTable;
