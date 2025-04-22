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
  Alert,
  Snackbar,
  Skeleton,
  Stack
} from '@mui/material';
import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import { 
  Delete as DeleteIcon, 
  PersonOff as PersonOffIcon, 
  RefreshOutlined as RefreshIcon 
} from '@mui/icons-material';
import { getAllUsers, deleteUser } from '../../api/adminService';
import { formatDistanceToNow } from 'date-fns';

// Custom empty state for DataGrid
function CustomNoRowsOverlay() {
  return (
    <GridOverlay>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        padding: 5
      }}>
        <PersonOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>No Users Found</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300, mb: 3 }}>
          There are no users available to display.
        </Typography>
      </Box>
    </GridOverlay>
  );
}

// Custom loading overlay
function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    </GridOverlay>
  );
}

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  
  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize
      });
      
      if (response.success) {
        setUsers(response.data.data.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          joinedDate: new Date(user.createdAt)
        })));
        setRowCount(response.data.count);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteUser(userToDelete.id);
      
      if (response.success) {
        // Close dialog and refresh users
        setDeleteDialog(false);
        setUserToDelete(null);
        fetchUsers();
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
      } else {
        setError(response.message || 'Failed to delete user');
        
        // Show error message
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete user',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      
      // Show error message
      setSnackbar({
          open: true,
          message: 'Failed to delete user',
          severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open delete confirmation dialog
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog(false);
    setUserToDelete(null);
  };
  
  // Close error alert
  const handleCloseError = () => {
    setError(null);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
        <Typography 
          variant="body2" 
          sx={{ 
            textTransform: 'capitalize',
            fontWeight: params.value === 'admin' ? 700 : 400,
            color: params.value === 'admin' ? 'primary.main' : 
                  params.value === 'organizer' ? 'secondary.main' : 'text.primary'
          }}
        >
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
        try {
          // Format as MMM d, yyyy
          const date = new Date(params.value);
          if (isNaN(date.getTime())) {
            return 'Invalid date';
          }
          
          // Create a formatter that shows both the date and the relative time
          return `${date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })} (${formatDistanceToNow(date, { addSuffix: true })})`;
        } catch (err) {
          console.error('Error formatting date:', err);
          return 'Error';
        }
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
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
      ),
    },
  ];

  // Initialize and update data
  useEffect(() => {
    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize]);
  
  // Handle pagination model change
  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
  };
  
  // Render loading skeleton
  if (loading && users.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchUsers}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
            onClose={handleCloseError}
          >
            {error}
          </Alert>
        )}
        
        <Box sx={{ height: 52, mb: 2 }}>
          <Skeleton variant="rectangular" height={40} width="40%" />
        </Box>
        
        <Box sx={{ height: 400, width: '100%' }}>
          <Skeleton variant="rectangular" height={60} width="100%" sx={{ mb: 1 }} />
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={52} width="100%" sx={{ mb: 0.5 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchUsers}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
          onClose={handleCloseError}
        >
          {error}
        </Alert>
      )}

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={rowCount}
          paginationMode="server"
          loading={loading}
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
          slots={{
            loadingOverlay: CustomLoadingOverlay,
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            }
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            {userToDelete?.role === 'organizer' && (
              <Box component="span" sx={{ 
                display: 'block', 
                color: 'error.main',
                mt: 1, 
                fontWeight: 'bold' 
              }}>
                Warning: This user is an organizer. Deleting them will also remove all their events.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status update snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersTab; 