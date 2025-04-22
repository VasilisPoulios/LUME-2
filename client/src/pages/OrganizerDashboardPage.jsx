import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Tab,
  Tabs,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { COLORS } from '../styles';

// TabPanel component for handling tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Attendee Check-in Component
function AttendeeCheckIn({ attendee, onCheckIn }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ mr: 2, bgcolor: attendee.checkedIn ? COLORS.GREEN_LIGHT : COLORS.GRAY_LIGHT }}>
          {attendee.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{attendee.name}</Typography>
          <Typography variant="body2" color="text.secondary">{attendee.email}</Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Ticket: {attendee.ticketCode}
          </Typography>
        </Box>
      </Box>
      <Box>
        {attendee.checkedIn ? (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Checked In" 
            color="success" 
            variant="outlined" 
          />
        ) : (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => onCheckIn(attendee.id)}
            endIcon={<QrCodeScannerIcon />}
          >
            Check In
          </Button>
        )}
      </Box>
    </Box>
  );
}

// Event Card/Accordion Component
function EventAccordion({ event, onEdit, onDelete, attendees, onCheckIn }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventAttendees, setEventAttendees] = useState([]);
  const { user } = useAuth();
  
  // For debugging - display organizer info
  const organizerId = event.organizer?._id || event.organizer;
  const isCurrentUserOrganizer = organizerId === user?._id;
  
  const handleChange = (event, isExpanded) => {
    setExpanded(isExpanded);
    if (isExpanded && !eventAttendees.length) {
      loadAttendees();
    }
  };
  
  const loadAttendees = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/tickets?eventId=${event._id}`);
      if (response.data && Array.isArray(response.data)) {
        setEventAttendees(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setEventAttendees(response.data.data);
      } else {
        // Fallback to pre-filtered attendees from parent component
        setEventAttendees(attendees.filter(a => a.eventId === event._id));
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      default: return 'primary';
    }
  };
  
  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleChange}
      sx={{ 
        mb: 2, 
        borderRadius: 1,
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`event-${event._id}-content`}
        id={`event-${event._id}-header`}
        sx={{ 
          borderBottom: expanded ? `1px solid ${COLORS.GRAY_LIGHT}` : 'none',
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={5}>
            <Typography variant="subtitle1" fontWeight={500}>
              {event.title}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              {new Date(event.startDateTime || event.date).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Chip 
              label={event.status || 'Active'} 
              color={getStatusColor(event.status || 'active')} 
              size="small" 
              sx={{ minWidth: 80 }}
            />
          </Grid>
          <Grid item xs={12} sm={2} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="body2">
              {event.ticketsSold || 0}/{event.ticketsAvailable || event.capacity || 100}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={3}>
          {/* Event Stats */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Stats</Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Tickets Sold:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{event.ticketsSold || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">RSVPs:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{event.rsvpCount || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Capacity Remaining:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {Math.max(0, (event.ticketsAvailable || event.capacity || 100) - (event.ticketsSold || 0))}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Revenue:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">${(event.revenue || 0).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: isCurrentUserOrganizer ? 'green' : 'red' }}>
                    Event ID: {event._id} • Organizer: {organizerId}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          {/* Buttons */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" gutterBottom>Actions</Typography>
            <Stack spacing={1}>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                size="small"
                fullWidth
                onClick={() => onEdit(event._id)}
              >
                Edit Event
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<DeleteIcon />}
                size="small"
                fullWidth
                onClick={() => onDelete(event._id)}
              >
                Delete Event
              </Button>
            </Stack>
          </Grid>
          
          {/* Attendees Section */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>
              Attendees {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {loading ? (
                // Loading placeholders
                [...Array(3)].map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                ))
              ) : eventAttendees.length > 0 ? (
                <Stack spacing={2}>
                  {eventAttendees.map(attendee => (
                    <AttendeeCheckIn
                      key={attendee.id}
                      attendee={attendee}
                      onCheckIn={onCheckIn}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No attendees for this event yet.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

const OrganizerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [activeTab, setActiveTab] = useState(0);

  // Fetch organizer data
  const fetchOrganizerData = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    console.log('Fetching events for organizer:', user._id);
    
    try {
      // Fetch events created by the organizer
      const eventsPromise = API.get(`/events?organizer=${user._id}`);
      
      // Fetch tickets/analytics data
      const analyticsPromise = API.get(`/tickets/analytics?organizer=${user._id}`);
      
      // Wait for both requests to complete
      const [eventsResponse, analyticsResponse] = await Promise.all([
        eventsPromise.catch(err => {
          console.error('Error fetching events:', err);
          return { data: [] };
        }),
        analyticsPromise.catch(err => {
          console.error('Error fetching analytics:', err);
          return { data: { totalRevenue: 0, ticketsSold: 0, thisMonthRevenue: 0 } };
        })
      ]);
      
      console.log('Events API response:', eventsResponse);
      
      // Process events data
      let eventsData = [];
      if (eventsResponse.data && Array.isArray(eventsResponse.data)) {
        eventsData = eventsResponse.data.filter(event => event.organizer === user._id || 
                                                       (event.organizer && event.organizer._id === user._id));
      } else if (eventsResponse.data && Array.isArray(eventsResponse.data.data)) {
        eventsData = eventsResponse.data.data.filter(event => event.organizer === user._id || 
                                                           (event.organizer && event.organizer._id === user._id));
      }
      
      console.log('Filtered events for organizer:', eventsData.length);
      
      // Process analytics data
      let analytics = {
        total: 0,
        thisMonth: 0,
        ticketsSold: 0
      };
      
      if (analyticsResponse.data) {
        analytics = {
          total: analyticsResponse.data.totalRevenue || 0,
          thisMonth: analyticsResponse.data.thisMonthRevenue || 0,
          ticketsSold: analyticsResponse.data.ticketsSold || 0
        };
      }
      
      setEvents(eventsData);
      setAnalyticsData(analytics);
      
      // Return if no events to avoid unnecessary attendee fetch
      if (!eventsData.length) {
        setLoading(false);
        return;
      }
      
      // Optional: fetch attendees for all events
      try {
        // Get first event ID to fetch some initial attendee data
        const firstEventId = eventsData[0]._id;
        const attendeesResponse = await API.get(`/tickets?eventId=${firstEventId}`);
        
        if (attendeesResponse.data && Array.isArray(attendeesResponse.data)) {
          setAttendees(attendeesResponse.data);
        } else if (attendeesResponse.data && Array.isArray(attendeesResponse.data.data)) {
          setAttendees(attendeesResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching attendees:', err);
      }
      
    } catch (error) {
      console.error('Error fetching organizer data:', error);
      showSnackbar('Failed to load some data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);
  
  useEffect(() => {
    // Check if user is authenticated and is an organizer
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/organizer' } });
      return;
    }

    if (!isOrganizer) {
      navigate('/dashboard');
      return;
    }
    
    fetchOrganizerData();
  }, [isAuthenticated, isOrganizer, navigate, fetchOrganizerData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateEvent = () => {
    // Clear any stale event data from localStorage to ensure clean state
    localStorage.removeItem('eventFormData');
    // Make sure the organizer ID is passed to the create event page
    navigate('/create-event', { state: { organizerId: user._id } });
  };

  const handleEditEvent = (eventId) => {
    // Verify this event belongs to the current organizer before editing
    const event = events.find(e => e._id === eventId);
    if (!event) {
      showSnackbar('Event not found', 'error');
      return;
    }
    
    // Double check ownership
    const isOwner = event.organizer === user._id || 
                    (event.organizer && event.organizer._id === user._id);
    
    if (!isOwner) {
      showSnackbar('You do not have permission to edit this event', 'error');
      return;
    }
    
    navigate(`/edit-event/${eventId}`);
  };

  const handleDeleteConfirm = (eventId) => {
    // Verify this event belongs to the current organizer before deleting
    const event = events.find(e => e._id === eventId);
    if (!event) {
      showSnackbar('Event not found', 'error');
      return;
    }
    
    // Double check ownership
    const isOwner = event.organizer === user._id || 
                    (event.organizer && event.organizer._id === user._id);
    
    if (!isOwner) {
      showSnackbar('You do not have permission to delete this event', 'error');
      return;
    }
    
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      // Add organizer ID to query params for extra server-side validation
      await API.delete(`/events/${eventToDelete}?organizer=${user._id}`);
      setEvents(events.filter(event => event._id !== eventToDelete));
      showSnackbar('Event deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showSnackbar('Failed to delete event. Please try again.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  
  const handleCheckIn = async (attendeeId) => {
    try {
      await API.patch(`/tickets/${attendeeId}/check-in`);
      // Update the attendee in the state
      setAttendees(prev => 
        prev.map(a => a.id === attendeeId ? { ...a, checkedIn: true } : a)
      );
      showSnackbar('Attendee checked in successfully', 'success');
    } catch (error) {
      console.error('Error checking in attendee:', error);
      showSnackbar('Failed to check in attendee', 'error');
    }
  };
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: COLORS.ORANGE_MAIN }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          color: COLORS.SLATE,
          mb: 2
        }}
      >
        Welcome back, {user?.name}
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        sx={{ mb: 4 }}
      >
        Viewing your organizer dashboard. Only events you created will appear here.
      </Typography>
      
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ${(analyticsData?.total || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This Month
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ${(analyticsData?.thisMonth || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tickets Sold
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {(analyticsData?.ticketsSold || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Create Event Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
          sx={{ 
            py: 1.2, 
            px: 3,
            bgcolor: COLORS.ORANGE_MAIN,
            '&:hover': {
              bgcolor: COLORS.ORANGE_DARK,
            }
          }}
        >
          Create New Event
        </Button>
      </Box>
      
      {/* Events Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          border: `1px solid ${COLORS.GRAY_LIGHT}`,
          mb: 4
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: COLORS.SLATE,
            mb: 3
          }}
        >
          Your Events
        </Typography>
        
        {events.length > 0 ? (
          <Box>
            {events.map(event => (
              <EventAccordion
                key={event._id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteConfirm}
                attendees={attendees}
                onCheckIn={handleCheckIn}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              You haven't created any events yet. Events created by other organizers will not appear here.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              User ID: {user?._id} • Role: {user?.role}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateEvent}
              sx={{ 
                bgcolor: COLORS.ORANGE_MAIN,
                '&:hover': {
                  bgcolor: COLORS.ORANGE_DARK,
                }
              }}
            >
              Create Your First Event
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Analytics Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          border: `1px solid ${COLORS.GRAY_LIGHT}`,
          mb: 4
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: COLORS.SLATE,
            mb: 3
          }}
        >
          Analytics
        </Typography>
        
        {events.length > 0 ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Showing analytics for events created by you (Organizer ID: {user?._id}).
            </Alert>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Name</TableCell>
                    <TableCell align="right">Tickets Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell component="th" scope="row">
                        {event.title}
                      </TableCell>
                      <TableCell align="right">{event.ticketsSold || 0}</TableCell>
                      <TableCell align="right">${(event.revenue || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Typography color="text.secondary">
            Create your first event to start seeing analytics data for events you organize.
          </Typography>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone and will remove all associated tickets and registrations.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteEvent} color="error" autoFocus>
            Delete Event
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: snackbar.severity === 'error' ? COLORS.RED_MAIN : 
                   snackbar.severity === 'success' ? COLORS.GREEN_MAIN : 
                   COLORS.SLATE
          }
        }}
      />
    </Container>
  );
};

export default OrganizerDashboardPage; 