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
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import {
  HourglassEmpty as HourglassEmptyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
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
  const [originalDescription, setOriginalDescription] = useState('');
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
    setOriginalDescription('');
    setEditRowId(null);
  };

  const handleUpdate = async () => {
    try {
      const fallbackDescription = `${originalDescription || ''}`.trim();
      const typedDescription = `${description || ''}`.trim();
      const finalDescription = typedDescription.length > 0 ? typedDescription : fallbackDescription;

      if (!finalDescription) {
        console.error('Cannot update timer: description is missing.');
        return;
      }

      const payload = {
        description: finalDescription,
        subject,
      };

      await chronometersApi.updateChronometer(user, editRowId, payload);
      handleCloseEditDialog();
      fetchTimers();
    } catch (error) {
      console.error('Failed to edit timer description:', error);
    }
  };

  const handleOpenEditDialog = (row) => {
    setEditRowId(row.id);
    setDescription(row.description || '');
    setOriginalDescription(row.description || '');
    setSubject(row.subject);
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
      <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {editRemaining && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => handleOpenEditDialog(row)}
              sx={{
                borderRadius: '8px',
                padding: '6px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: '600',
                fontSize: '13px',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              تعديل
            </Button>
            <Chip
              icon={<HourglassEmptyIcon sx={{ fontSize: 14 }} />}
              label={editRemaining}
              size="small"
              sx={{
                backgroundColor: '#e0e7ff',
                color: '#667eea',
                fontWeight: '600',
                fontSize: '11px',
              }}
            />
          </Box>
        )}
        {deleteRemaining && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={() => handleOpenDeleteDialog(row.id)}
              disabled={CheckItemChrononometerIdInLocalStorage()}
              sx={{
                borderRadius: '8px',
                padding: '6px 16px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                fontWeight: '600',
                fontSize: '13px',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                },
                '&:disabled': {
                  background: '#e5e7eb',
                  color: '#9ca3af',
                },
                transition: 'all 0.2s ease',
              }}
            >
             حذف
            </Button>
            <Chip
              icon={<HourglassEmptyIcon sx={{ fontSize: 14 }} />}
              label={deleteRemaining}
              size="small"
              sx={{
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                fontWeight: '600',
                fontSize: '11px',
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper
      sx={{
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#f8f9fa',
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontWeight: '700',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    borderBottom: '2px solid #e5e7eb',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  fontWeight: '700',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  borderBottom: '2px solid #e5e7eb',
                }}
              >
                الإجراء
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                  transition: 'background-color 0.2s ease',
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    {column.id === 'description' ? (
                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleOpenModal(row[column.id])}
                        sx={{
                          borderRadius: '8px',
                          padding: '6px 16px',
                          backgroundColor: '#667eea',
                          fontWeight: '600',
                          fontSize: '12px',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#764ba2',
                          },
                        }}
                      >
                        عرض
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
        sx={{
          borderTop: '1px solid #e5e7eb',
          '& .MuiTablePagination-select': {
            borderRadius: '8px',
          },
        }}
      />

      {/* View dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <VisibilityIcon />
          <Typography variant="h6" sx={{ fontWeight: '700' }}>
            الوصف
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '28px' }}>
          <Typography sx={{ color: '#374151', lineHeight: '1.6' }}>
            {selectedDescription}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 28px' }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: '700',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <EditIcon />
          <Typography variant="h6" sx={{ fontWeight: '700' }}>
            تعديل المؤقت
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '28px', backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
            <TextField
              autoFocus
              label="الوصف"
              type="text"
              fullWidth
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                },
              }}
            />
            <Box>
              <InputLabel sx={{ marginBottom: '8px', fontWeight: '600', color: '#1a1a1a' }}>
                المادة
              </InputLabel>
              <Select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                }}
              >
                {userSubjects.map((subject, index) => (
                  <MenuItem key={index} value={subject.name}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 28px', backgroundColor: '#f8f9fa' }}>
          <Button
            onClick={handleCloseEditDialog}
            sx={{
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: '700',
              textTransform: 'none',
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: '700',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            تحديث
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(239, 68, 68, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <DeleteIcon />
          <Typography variant="h6" sx={{ fontWeight: '700' }}>
            تأكيد الحذف
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '28px' }}>
          <Typography sx={{ color: '#374151', lineHeight: '1.6' }}>
            هل أنت متأكد من رغبتك في حذف هذا المؤقت؟
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 28px' }}>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: '700',
              textTransform: 'none',
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: '700',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
            }}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PaginatedTable;