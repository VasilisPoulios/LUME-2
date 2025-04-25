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
  FormControlLabel,
  Switch,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  Paper,
  Skeleton,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment
} from '@mui/material';
import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  NewReleases as NewReleasesIcon,
  EventBusy as EventBusyIcon,
  RefreshOutlined as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getAllEvents, deleteEvent, toggleEventFlag } from '../../api/adminService';
import { getEvent, updateEvent } from '../../api/eventService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatPriceForApi } from '../../utils/helpers';
import { BASE_CATEGORIES } from '../../utils/categoryConfig';

// Custom loading overlay for DataGrid
function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    </GridOverlay>
  );
}

// Custom no rows overlay for DataGrid
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
        <EventBusyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>No Events Found</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300, mb: 3 }}>
          There are no events available for this selection.
        </Typography>
      </Box>
    </GridOverlay>
  );
}

const EventsTab = ({ organizerId }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flagToggleLoading, setFlagToggleLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit event state
  const [editDialog, setEditDialog] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    venue: '',
    address: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
    ticketsAvailable: 0
  });
  const [editLoading, setEditLoading] = useState(false);

  // Helper function to format date for datetime-local input
  const formatDateForInput = (date) => {
    const d = new Date(date);
    // Format as YYYY-MM-DDThh:mm
    return d.toISOString().slice(0, 16);
  };

  // Fetch events data
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Add organizer filter if provided
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize
      };
      
      if (organizerId) {
        params.organizer = organizerId;
      }
      
      console.log('Fetching events with params:', params);
      const response = await getAllEvents(params);
      
      if (response.success) {
        console.log('Events fetched successfully:', response.data);
        setEvents(response.data.data.map(event => {
          // Ensure dates are properly parsed
          const startDateTime = new Date(event.startDateTime);
          const endDateTime = new Date(event.endDateTime);
          
          console.log('Processing event:', {
            id: event._id,
            title: event.title,
            startDateTime,
            price: event.price
          });
          
          return {
            id: event._id,
            title: event.title,
            organizer: event.organizer?.name || 'Unknown',
            organizerId: event.organizer?._id,
            category: event.category,
            startDate: startDateTime,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            ticketsAvailable: event.ticketsAvailable,
            ticketsSold: event.ticketsSold || 0,
            price: event.price,
            status: getEventStatus({...event, startDateTime, endDateTime}),
            isFeatured: event.isFeatured || false,
            isHot: event.isHot || false,
            isUnmissable: event.isUnmissable || false
          };
        }));
        setRowCount(response.data.count);
      } else {
        setError(response.message || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine event status
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime || event.startDateTime);
    
    if (event.isCancelled) return 'cancelled';
    if (endDate < now) return 'completed';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'upcoming';
  };

  // Toggle event flag (featured, hot, unmissable)
  const handleToggleFlag = async (eventId, flag, newValue) => {
    try {
      setFlagToggleLoading(true);
      const response = await toggleEventFlag(eventId, flag, newValue);
      
      if (response.success) {
        // Update the event in the local state
        setEvents(events.map(event => 
          event.id === eventId 
            ? { ...event, [flag]: newValue } 
            : event
        ));
        
        // Show success message
        setSnackbar({
          open: true,
          message: `Event ${flag} status updated successfully`,
          severity: 'success'
        });
      } else {
        // Show error message
        setSnackbar({
          open: true,
          message: response.message || `Failed to update ${flag} status`,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error(`Error toggling ${flag} flag:`, err);
      setSnackbar({
        open: true,
        message: `Failed to update ${flag} status`,
        severity: 'error'
      });
    } finally {
      setFlagToggleLoading(false);
    }
  };

  // Open edit dialog and fetch event details
  const handleEditEvent = async (eventId) => {
    try {
      setEditLoading(true);
      const response = await getEvent(eventId);
      
      if (response.success && response.data && response.data.data) {
        const eventData = response.data.data;
        setEventToEdit(eventData);
        setEditFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          category: eventData.category || '',
          price: formatPrice(eventData.price) || 0,
          venue: eventData.venue || '',
          address: eventData.address || '',
          startDateTime: new Date(eventData.startDateTime) || new Date(),
          endDateTime: new Date(eventData.endDateTime) || new Date(),
          ticketsAvailable: eventData.ticketsAvailable || 0
        });
        setEditDialog(true);
      } else {
        // Show error message
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch event details',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch event details',
        severity: 'error'
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (name, value) => {
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit updated event data
  const handleUpdateEvent = async () => {
    try {
      setEditLoading(true);
      
      // Prepare data for API
      const updatedEventData = {
        ...editFormData,
        // Convert dates to ISO strings for API
        startDateTime: editFormData.startDateTime.toISOString(),
        endDateTime: editFormData.endDateTime.toISOString(),
        // Ensure price is in cents
        price: formatPriceForApi(parseFloat(editFormData.price))
      };
      
      const response = await updateEvent(eventToEdit._id, updatedEventData);
      
      if (response.success) {
        // Close the dialog
        setEditDialog(false);
        
        // Refresh the events list
        fetchEvents();
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Event updated successfully',
          severity: 'success'
        });
      } else {
        // Show error message
        setSnackbar({
          open: true,
          message: response.message || 'Failed to update event',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update event',
        severity: 'error'
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Close edit dialog
  const closeEditDialog = () => {
    setEditDialog(false);
    setEventToEdit(null);
  };

  // Delete event
  const handleDeleteEvent = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteEvent(eventToDelete.id);
      
      if (response.success) {
        // Close dialog and refresh events
        setDeleteDialog(false);
        setEventToDelete(null);
        fetchEvents();
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Event deleted successfully',
          severity: 'success'
        });
      } else {
        setError(response.message || 'Failed to delete event');
        
        // Show error message
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete event',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to delete event',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Open delete confirmation dialog
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog(false);
    setEventToDelete(null);
  };

  // Get chip color based on status
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'upcoming':
        return { 
          icon: <AccessTimeIcon />, 
          label: 'Upcoming',
          color: 'primary'
        };
      case 'ongoing':
        return { 
          icon: <CheckCircleIcon />, 
          label: 'Ongoing',
          color: 'success'
        };
      case 'completed':
        return { 
          icon: <CheckCircleIcon />, 
          label: 'Completed',
          color: 'default'
        };
      case 'cancelled':
        return { 
          icon: <CancelIcon />, 
          label: 'Cancelled',
          color: 'error'
        };
      default:
        return { 
          label: status,
          color: 'default'
        };
    }
  };

  // Column definitions
  const columns = [
    { 
      field: 'title', 
      headerName: 'Event Title', 
      flex: 1.5,
      minWidth: 200
    },
    {
      field: 'organizer',
      headerName: 'Organizer',
      width: 150,
      hide: !!organizerId, // Hide if filtering by organizer
    },
    { 
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            textTransform: 'capitalize'
          }}
        >
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'startDate',
      headerName: 'Date',
      width: 180,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2">-</Typography>;
        
        try {
          // Ensure params.value is a valid date
          const date = new Date(params.value);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date value:', params.value);
            return <Typography variant="body2" color="error">Invalid date</Typography>;
          }
          
          // Format the date using both date-fns and native methods for redundancy
          const formattedDate = format(date, 'MMM d, yyyy h:mm a');
          console.log('Rendering date cell:', params.value, '→', formattedDate);
          
          return (
            <Stack direction="column" spacing={0}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {format(date, 'MMM d, yyyy')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(date, 'h:mm a')}
              </Typography>
            </Stack>
          );
        } catch (err) {
          console.error('Error formatting date:', err);
          return <Typography variant="body2" color="error">Error</Typography>;
        }
      }
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      renderCell: (params) => {
        // Use our helper function to format the price
        const formattedPrice = formatPrice(params.value);
        console.log('Rendering price cell:', params.value, '→', formattedPrice);
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: params.value > 0 ? 'text.primary' : 'text.secondary'
            }}
          >
            €{formattedPrice}
          </Typography>
        );
      }
    },
    {
      field: 'flags',
      headerName: 'Homepage Flags',
      width: 350,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Featured events appear in highlighted sections">
            <FormControlLabel
              control={
                <Switch 
                  size="small"
                  checked={params.row.isFeatured} 
                  onChange={(e) => handleToggleFlag(params.row.id, 'isFeatured', e.target.checked)}
                  disabled={flagToggleLoading}
                  color="primary"
                  icon={<StarIcon fontSize="small" />}
                  checkedIcon={<StarIcon fontSize="small" />}
                />
              }
              label={
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon fontSize="small" sx={{ mr: 0.5, color: params.row.isFeatured ? 'warning.main' : 'text.disabled' }} />
                  Featured
                </Typography>
              }
              sx={{ mr: 1 }}
            />
          </Tooltip>
          
          <Tooltip title="Hot events appear in the 'Hot Right Now' section">
            <FormControlLabel
              control={
                <Switch 
                  size="small"
                  checked={params.row.isHot} 
                  onChange={(e) => handleToggleFlag(params.row.id, 'isHot', e.target.checked)}
                  disabled={flagToggleLoading}
                  color="error"
                />
              }
              label={
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <FireIcon fontSize="small" sx={{ mr: 0.5, color: params.row.isHot ? 'error.main' : 'text.disabled' }} />
                  Hot
                </Typography>
              }
              sx={{ mr: 1 }}
            />
          </Tooltip>
          
          <Tooltip title="Unmissable events are highlighted on the homepage">
            <FormControlLabel
              control={
                <Switch 
                  size="small"
                  checked={params.row.isUnmissable} 
                  onChange={(e) => handleToggleFlag(params.row.id, 'isUnmissable', e.target.checked)}
                  disabled={flagToggleLoading}
                  color="secondary"
                />
              }
              label={
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <NewReleasesIcon fontSize="small" sx={{ mr: 0.5, color: params.row.isUnmissable ? 'secondary.main' : 'text.disabled' }} />
                  Unmissable
                </Typography>
              }
            />
          </Tooltip>
        </Stack>
      )
    },
    { 
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const { icon, label, color } = getStatusChipProps(params.value);
        return (
          <Chip 
            icon={icon}
            label={label}
            size="small"
            color={color}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
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

  // Clean up error state
  const handleCloseError = () => {
    setError(null);
  };

  // Initial data load
  useEffect(() => {
    fetchEvents();
  }, [organizerId, paginationModel.page, paginationModel.pageSize]);

  // Handle pagination changes
  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
  };

  // Render loading skeleton
  if (loading && events.length === 0) {
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
                onClick={fetchEvents}
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
              onClick={fetchEvents}
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
          rows={events}
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
      <Dialog open={deleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event: <strong>{eventToDelete?.title}</strong>?
            This action cannot be undone, and all associated tickets and data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteEvent} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Event Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={closeEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Edit Event
          <IconButton
            aria-label="close"
            onClick={closeEditDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Event Title"
                fullWidth
                value={editFormData.title}
                onChange={handleEditFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={editFormData.description}
                onChange={handleEditFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditFormChange}
                  label="Category"
                  required
                >
                  {BASE_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price (€)"
                type="number"
                fullWidth
                value={editFormData.price}
                onChange={handleEditFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                helperText="Enter price in euros (e.g., 10.99)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="venue"
                label="Venue"
                fullWidth
                value={editFormData.venue}
                onChange={handleEditFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={editFormData.address}
                onChange={handleEditFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="startDateTime"
                label="Start Date & Time"
                type="datetime-local"
                fullWidth
                value={formatDateForInput(editFormData.startDateTime)}
                onChange={(e) => handleDateChange('startDateTime', new Date(e.target.value))}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="endDateTime"
                label="End Date & Time"
                type="datetime-local"
                fullWidth
                value={formatDateForInput(editFormData.endDateTime)}
                onChange={(e) => handleDateChange('endDateTime', new Date(e.target.value))}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="ticketsAvailable"
                label="Tickets Available"
                type="number"
                fullWidth
                value={editFormData.ticketsAvailable}
                onChange={handleEditFormChange}
                margin="normal"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateEvent} 
            variant="contained" 
            color="primary"
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={24} /> : 'Save Changes'}
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

export default EventsTab; 