import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Typography,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { getOrganizers, deleteUser } from '../../api/adminService';
import { formatDistanceToNow } from 'date-fns';

const OrganizersTab = ({ onViewEvents }) => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  
  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch organizers data
  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const response = await getOrganizers({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize
      });
      
      if (response.success) {
        setOrganizers(response.data.data.map(organizer => ({
          id: organizer._id,
          name: organizer.name,
          email: organizer.email,
          role: organizer.role,
          eventCount: organizer.eventCount || 0,
          joinedDate: new Date(organizer.createdAt),
          isVerified: organizer.isVerified || false
        })));
        setRowCount(response.data.count);
      } else {
        setError(response.message || 'Failed to fetch organizers');
      }
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError('Failed to fetch organizers');
    } finally {
      setLoading(false);
    }
  };

  // Delete organizer
  const handleDeleteOrganizer = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteUser(organizerToDelete.id);
      
      if (response.success) {
        // Close dialog and refresh organizers
        setDeleteDialog(false);
        setOrganizerToDelete(null);
        fetchOrganizers();
      } else {
        setError(response.message || 'Failed to delete organizer');
      }
    } catch (err) {
      console.error('Error deleting organizer:', err);
      setError('Failed to delete organizer');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open delete confirmation dialog
  const confirmDelete = (organizer) => {
    setOrganizerToDelete(organizer);
    setDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog(false);
    setOrganizerToDelete(null);
  };

  // Column definitions
  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 200
    },
    { 
      field: 'role', 
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip 
          icon={<VerifiedUserIcon />}
          label="Organizer"
          color="secondary"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    { 
      field: 'eventCount',
      headerName: 'Events',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'joinedDate',
      headerName: 'Joined Date',
      width: 180,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return formatDistanceToNow(new Date(params.value), { addSuffix: true });
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => onViewEvents && onViewEvents(params.row.id)}
            sx={{ fontSize: '0.75rem' }}
          >
            View Events
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => confirmDelete(params.row)}
            sx={{ minWidth: 'auto' }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  useEffect(() => {
    fetchOrganizers();
  }, [paginationModel.page, paginationModel.pageSize]);

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <DataGrid
        rows={organizers}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25]}
        rowCount={rowCount}
        paginationMode="server"
        loading={loading}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          borderRadius: 2,
          boxShadow: 1,
          backgroundColor: 'background.paper'
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Organizer Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the organizer <strong>{organizerToDelete?.name}</strong>? This action cannot be undone.
            <Typography color="error" sx={{ mt: 1 }}>
              Warning: All events created by this organizer will also be deleted.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteOrganizer} 
            variant="contained" 
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizersTab; 