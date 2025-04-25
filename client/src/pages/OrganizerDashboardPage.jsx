import { useState, useEffect, useCallback, useRef } from 'react';
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
  Snackbar,
  TextField
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
  QrCodeScanner as QrCodeScannerIcon,
  Close as CloseIcon,
  InsertInvitation as RSVPIcon,
  CalendarToday as CalendarToday
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { COLORS } from '../styles';
import RSVPsTab from '../components/admin/RSVPsTab';
import { getRSVPsByEvent } from '../api/rsvpService';
import RSVPCheckIn from '../components/admin/RSVPCheckIn';
import dayjs from 'dayjs';

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
  // If attendee is undefined, return null to avoid errors
  if (!attendee) return null;
  
  // Safely extract first character of name or use fallback
  const nameInitial = attendee.name && typeof attendee.name === 'string' ? 
    attendee.name.charAt(0) : '?';
    
  // Check if attendee is already checked in - support both isUsed and status fields
  const isCheckedIn = attendee.isUsed === true || attendee.status === 'used';
    
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ mr: 2, bgcolor: isCheckedIn ? COLORS.GREEN_LIGHT : COLORS.GRAY_LIGHT }}>
          {nameInitial}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{attendee.name || ''}</Typography>
          <Typography variant="body2" color="text.secondary">{attendee.email || ''}</Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Ticket: {attendee.ticketCode || ''}
          </Typography>
        </Box>
      </Box>
      <Box>
        {isCheckedIn ? (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Checked In" 
            color="success" 
            variant="outlined" 
          />
        ) : (
          <Chip 
            label="Not Checked In" 
            color="default" 
            variant="outlined" 
          />
        )}
      </Box>
    </Box>
  );
}

// QR Scanner Component
function QRScannerDialog({ open, onClose, onCheckIn, eventId }) {
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [scanStatus, setScanStatus] = useState({ message: '', isError: false });
  const scannerRef = useRef(null);
  const scannerContainerRef = useRef(null);
  
  useEffect(() => {
    // Initialize or destroy scanner based on open state
    if (open && !manualMode) {
      if (!scanning) {
        // Give browser time to render before starting scanner
        setTimeout(() => {
          startScanner();
        }, 500);
      }
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open, manualMode]);

  const startScanner = async () => {
    try {
      if (!scannerContainerRef.current) return;
      
      // Clear the container in case there's any previous content
      while (scannerContainerRef.current.firstChild) {
        scannerContainerRef.current.removeChild(scannerContainerRef.current.firstChild);
      }
      
      // Import the html5-qrcode library
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      // Create a new scanner instance with simpler options
      const scanner = new Html5QrcodeScanner(
        "qr-reader", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false // verbose flag
      );
      
      // Define success callback
      const onScanSuccess = async (decodedText, decodedResult) => {
        // Stop scanner as soon as a code is detected
        scanner.clear();
        
        setScanStatus({ message: 'QR code detected! Checking ticket...', isError: false });
        
        try {
          // Log the raw scanned text for debugging
          console.log('Raw QR code scan result:', decodedText);
          
          // The scanned code may be the ticket code directly - don't try to parse it as JSON
          const ticketCode = decodedText.trim();
          
          console.log('Using ticket code for check-in:', ticketCode);
          
          // Call check-in API with the scanned code directly
          const response = await API.patch(`/tickets/check-in-by-code`, { 
            ticketCode: ticketCode,
            eventId: eventId
          });
          
          if (response.data && response.data.success) {
            // Successfully checked in
            setScanStatus({ 
              message: `Successfully checked in: ${response.data.attendee?.name || 'Attendee'}`, 
              isError: false 
            });
            
            // Call the check-in handler with the ticket ID
            onCheckIn(response.data.ticketId || '');
            
            // Wait 2 seconds before restarting the scanner
            setTimeout(() => {
              try {
                // Only restart if still in scanning mode
                if (open && !manualMode) {
                  scanner.render(onScanSuccess, onScanError);
                  setScanStatus({ message: 'Ready to scan next ticket', isError: false });
                }
              } catch (err) {
                console.error('Error restarting scanner:', err);
              }
            }, 2000);
          } else {
            setScanStatus({ 
              message: response.data?.message || 'Invalid ticket code', 
              isError: true 
            });
            // Restart scanner after a short delay
            setTimeout(() => {
              try {
                scanner.render(onScanSuccess, onScanError);
              } catch (err) {
                console.error('Error restarting scanner:', err);
              }
            }, 3000);
          }
        } catch (error) {
          console.error('Error checking in ticket:', error);
          setScanStatus({ 
            message: error.response?.data?.message || 'Failed to check in ticket', 
            isError: true 
          });
          // Restart scanner after error
          setTimeout(() => {
            try {
              scanner.render(onScanSuccess, onScanError);
            } catch (err) {
              console.error('Error restarting scanner:', err);
            }
          }, 3000);
        }
      };
      
      // Define error callback
      const onScanError = (errorMessage) => {
        console.error('QR scan error:', errorMessage);
        // We don't need to show transient errors to the user
      };
      
      // Render the scanner
      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
      setScanning(true);
      setScanStatus({ message: 'Scanner ready. Point camera at a ticket QR code.', isError: false });
      
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setScanStatus({ 
        message: 'Could not start the QR scanner. Try manual entry instead.', 
        isError: true 
      });
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error('Error clearing scanner:', error);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = async () => {
    if (!ticketCode.trim()) {
      setScanStatus({ message: 'Please enter a valid ticket code', isError: true });
      return;
    }
    
    setScanStatus({ message: 'Checking ticket...', isError: false });
    
    try {
      // Use the ticket code directly - no JSON parsing
      console.log('Using manual ticket code:', ticketCode.trim());
      
      // Call the check-in API with the ticket code
      const response = await API.patch(`/tickets/check-in-by-code`, { 
        ticketCode: ticketCode.trim(),
        eventId: eventId
      });
      
      if (response.data && response.data.success) {
        setScanStatus({ message: `Successfully checked in: ${response.data.attendee?.name || 'Attendee'}`, isError: false });
        onCheckIn(response.data.ticketId || '');
        setTicketCode('');
      } else {
        setScanStatus({ message: response.data?.message || 'Invalid ticket code', isError: true });
      }
    } catch (error) {
      console.error('Error checking in ticket:', error);
      setScanStatus({ 
        message: error.response?.data?.message || 'Failed to check in ticket', 
        isError: true 
      });
    }
  };

  const toggleMode = () => {
    setManualMode(!manualMode);
    setScanStatus({ message: '', isError: false });
    
    if (!manualMode) {
      stopScanner();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Check-In Attendee
        <IconButton
          aria-label="close"
          onClick={onClose}
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
      <DialogContent>
        {manualMode ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Enter Ticket Code Manually
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Ticket Code"
              fullWidth
              variant="outlined"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleManualSubmit}
              fullWidth
              sx={{ 
                bgcolor: COLORS.ORANGE_MAIN,
                '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                mb: 2
              }}
            >
              Check In
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Scan Ticket QR Code
            </Typography>
            {/* QR Reader container */}
            <Box 
              ref={scannerContainerRef}
              id="qr-reader"
              sx={{ 
                width: '100%',
                maxWidth: '350px',
                margin: '0 auto',
                '& section': { boxShadow: 'none !important' },
                '& img': { display: 'none' }, // Hide default library image
                '& button': { 
                  backgroundColor: `${COLORS.ORANGE_MAIN} !important`,
                  borderRadius: '4px !important',
                  color: 'white !important',
                  border: 'none !important'
                },
                '& video': {
                  maxWidth: '100%',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)'
                },
                '& select': {
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0,0,0,0.2)',
                  margin: '0 auto !important'
                }
              }}
            ></Box>
            
            {!scanning && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                my: 2
              }}>
                <CircularProgress size={40} sx={{ mb: 1, color: COLORS.ORANGE_MAIN }} />
                <Typography variant="body2" color="text.secondary">
                  Initializing camera...
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        {scanStatus.message && (
          <Alert 
            severity={scanStatus.isError ? "error" : "info"} 
            sx={{ mb: 2, mt: 2 }}
          >
            {scanStatus.message}
          </Alert>
        )}
        
        <Button 
          variant="outlined" 
          onClick={toggleMode}
          fullWidth
          sx={{ mt: 2 }}
        >
          {manualMode ? "Switch to Scanner" : "Enter Code Manually"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Event Card/Accordion Component
function EventAccordion({ event, onEdit, onDelete, attendees, onCheckIn, onRefreshAttendees }) {
  const [expanded, setExpanded] = useState(false);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [eventAttendees, setEventAttendees] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [rsvps, setRSVPs] = useState([]);
  const [loadingRSVPs, setLoadingRSVPs] = useState(false);
  const [rsvpStats, setRSVPStats] = useState({ count: 0, totalGuests: 0 });
  const [activeTab, setActiveTab] = useState(0); // 0 = Attendees, 1 = RSVPs
  const { user } = useAuth();
  
  // Check if event is free (uses RSVPs) or paid (uses tickets)
  const isEventFree = event.price === 0 || event.price === '0' || !event.price;
  
  // For debugging - display organizer info
  const organizerId = event.organizer?._id || event.organizer;
  const isCurrentUserOrganizer = organizerId === user?._id;
  
  // Format revenue for display (convert cents to euros)
  const formatRevenue = (amount) => {
    const euros = (amount || 0) / 100;
    return `€${euros.toFixed(2)}`;
  };
  
  const handleChange = (event, isExpanded) => {
    setExpanded(isExpanded);
    
    if (isExpanded) {
      // Load appropriate data based on event type
      if (isEventFree) {
        loadRSVPs();
      } else {
        loadAttendees();
      }
    }
  };
  
  const loadAttendees = async () => {
    if (loadingAttendees || (eventAttendees.length > 0 && !isEventFree)) return;
    
    setLoadingAttendees(true);
    try {
      const response = await API.get(`/tickets/event/${event._id}`);
      
      if (response.data && response.data.success) {
        setEventAttendees(response.data.data || []);
      } else {
        console.error('Failed to load attendees:', response.data);
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
    } finally {
      setLoadingAttendees(false);
    }
  };
  
  const loadRSVPs = async () => {
    if (loadingRSVPs || (rsvps.length > 0 && isEventFree)) return;
    
    setLoadingRSVPs(true);
    try {
      const response = await getRSVPsByEvent(event._id);
      
      if (response.success) {
        setRSVPs(response.data || []);
        setRSVPStats({
          count: response.count || 0,
          totalGuests: response.totalGuests || 0
        });
      } else {
        console.error('Failed to load RSVPs:', response.message);
      }
    } catch (err) {
      console.error('Error fetching RSVPs:', err);
    } finally {
      setLoadingRSVPs(false);
    }
  };
  
  const handleOpenScanner = () => {
    setScannerOpen(true);
  };
  
  const handleCloseScanner = () => {
    setScannerOpen(false);
  };
  
  const handleSwitchTab = (tab) => {
    setActiveTab(tab);
    
    // Load appropriate data when switching tabs
    if (tab === 0 && !isEventFree && eventAttendees.length === 0) {
      loadAttendees();
    } else if (tab === 1 && rsvps.length === 0) {
      loadRSVPs();
    }
  };
  
  const handleScannerCheckIn = (ticketId) => {
    // Call parent check-in function
    onCheckIn(ticketId);
    
    // Update local state with checked-in status after a short delay to allow API to update
    setTimeout(() => {
      loadAttendees();
    }, 1500);
  };
  
  const handleRSVPCheckedInChange = async (rsvpId, checkedInCount) => {
    // Update local state with new checked-in count
    const updatedRSVPs = rsvps.map(rsvp => {
      if (rsvp._id === rsvpId) {
        return { 
          ...rsvp, 
          checkedInGuests: checkedInCount,
          lastCheckedInAt: checkedInCount > 0 ? new Date() : null
        };
      }
      return rsvp;
    });
    
    setRSVPs(updatedRSVPs);
    
    // Show success notification
    const rsvp = rsvps.find(r => r._id === rsvpId);
    const eventTitle = event.title;
    const guestName = rsvp ? rsvp.name : 'Guest';
    
    // Determine notification message based on check-in count
    let message;
    if (rsvp) {
      if (checkedInCount === 0) {
        message = `Removed check-in for ${guestName}`;
      } else if (checkedInCount >= rsvp.quantity) {
        message = `All guests for ${guestName} checked in`;
      } else {
        message = `${checkedInCount} of ${rsvp.quantity} guests checked in for ${guestName}`;
      }
    } else {
      message = "RSVP check-in updated";
    }
    
    // Update parent component's snackbar notification without refreshing entire page
    if (typeof onRefreshAttendees === 'function') {
      // Pass a customized notification to the parent but don't trigger full refresh
      onRefreshAttendees(message, 'success', false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = dayjs(dateString);
    return date.isValid() ? date.format('MMM D, YYYY - h:mm A') : 'N/A';
  };
  
  // Get status color for event
  const getStatusColor = () => {
    const now = new Date();
    
    // Try multiple date fields from the event object
    const eventDateStr = event.startDateTime || event.startDate || event.date || event.createdAt;
    const eventDate = new Date(eventDateStr);
    
    // Debug information
    console.log('Event status calc:', {
      eventTitle: event.title,
      eventDateStr: eventDateStr,
      eventDate: eventDate,
      now: now,
      isPast: eventDate < now
    });
    
    // Event is in the past
    if (eventDate < now) {
      return { 
        color: 'default', 
        label: 'Completed', 
        textColor: COLORS.GRAY_DARK
      };
    }
    
    // Event is today
    if (eventDate.toDateString() === now.toDateString()) {
      return { 
        color: 'warning', 
        label: 'Today', 
        textColor: COLORS.ORANGE_DARK
      };
    }
    
    // Event is in the future
    return { 
      color: 'success', 
      label: 'Upcoming', 
      textColor: COLORS.GREEN_DARK
    };
  };
  
  const status = getStatusColor();
  
  // Filter valid attendees (to avoid errors with undefined entries)
  const validAttendees = Array.isArray(eventAttendees) ? eventAttendees.filter(a => a) : [];
  
  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleChange}
      sx={{ 
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 'none',
        border: `1px solid ${COLORS.GRAY_LIGHT}`,
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          backgroundColor: COLORS.GRAY_LIGHTEST,
          px: 3,
          minHeight: '64px'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {event.title}
            </Typography>
            <Chip 
              label={status.label} 
              color={status.color} 
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: 'text.secondary' }}>
            <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="body2">
              {formatDate(event.startDateTime || event.startDate || event.date || event.createdAt)}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Event Info
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <EventIcon fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_MAIN }} />
                <Typography variant="body2">
                  {isEventFree ? 'Free Event' : `€${((event.price || 0) / 100).toFixed(2)} per ticket`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PeopleIcon fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_MAIN }} />
                <Typography variant="body2">
                  {isEventFree 
                    ? `${event.rsvpCount || 0} RSVPs` 
                    : `${event.ticketsAvailable} tickets available`}
                </Typography>
              </Box>
              
              {/* Only show total guests for free events */}
              {isEventFree && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_MAIN }} />
                  <Typography variant="body2">
                    {`${rsvpStats.totalGuests || 0} total guests expected`}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Quick Actions
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                fullWidth
                onClick={() => onEdit(event._id)}
                sx={{ mb: 1 }}
              >
                Edit Event
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                fullWidth
                onClick={() => onDelete(event._id)}
              >
                Delete Event
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                {/* For paid events, only show Attendees tab */}
                {!isEventFree ? (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderColor: COLORS.ORANGE_MAIN,
                      color: COLORS.ORANGE_MAIN,
                      fontWeight: 600
                    }}
                  >
                    Attendees
                  </Button>
                ) : (
                  /* For free events, only show RSVPs tab */
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderColor: COLORS.ORANGE_MAIN,
                      color: COLORS.ORANGE_MAIN,
                      fontWeight: 600
                    }}
                  >
                    RSVPs
                  </Button>
                )}
              </Box>
              
              {/* Only show QR scanner button for paid events with tickets */}
              {!isEventFree && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<QrCodeScannerIcon />}
                  onClick={handleOpenScanner}
                  sx={{ 
                    bgcolor: COLORS.ORANGE_MAIN,
                    '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                  }}
                >
                  Check In With QR
                </Button>
              )}
            </Box>
            
            {/* Attendees Tab - Only for paid events */}
            {!isEventFree && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {validAttendees.length} attendees registered for this event
                </Typography>
                
                {loadingAttendees ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} sx={{ color: COLORS.ORANGE_MAIN }} />
                  </Box>
                ) : validAttendees.length > 0 ? (
                  <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Stack spacing={2} sx={{ pr: 1 }}>
                      {validAttendees.map(attendee => (
                        <AttendeeCheckIn 
                          key={attendee._id} 
                          attendee={attendee} 
                          onCheckIn={() => onCheckIn(attendee._id)} 
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Alert severity="info">
                    No attendees registered yet.
                  </Alert>
                )}
              </Box>
            )}
            
            {/* RSVPs Tab - Only for free events */}
            {isEventFree && (
              <Box>
                {loadingRSVPs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} sx={{ color: COLORS.ORANGE_MAIN }} />
                  </Box>
                ) : rsvps.length > 0 ? (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {rsvps.length} RSVPs with a total of {rsvpStats.totalGuests} guests
                    </Typography>
                    
                    <Stack spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                      {rsvps.map(rsvp => (
                        <RSVPCheckIn 
                          key={rsvp._id} 
                          rsvp={rsvp}
                          onCheckedInChange={handleRSVPCheckedInChange}
                        />
                      ))}
                    </Stack>
                  </>
                ) : (
                  <Alert severity="info">
                    No RSVPs for this event yet.
                  </Alert>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        
        {/* QR Scanner Dialog - Only for paid events */}
        {!isEventFree && (
          <QRScannerDialog 
            open={scannerOpen}
            onClose={handleCloseScanner}
            eventId={event._id}
            onCheckIn={handleScannerCheckIn}
          />
        )}
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

  // Format revenue for display (convert cents to euros)
  const formatRevenue = (amount) => {
    const euros = (amount || 0) / 100;
    return `€${euros.toFixed(2)}`;
  };
  
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
          return { data: { 
            success: true, 
            data: { 
              totalRevenue: 0, 
              thisMonthRevenue: 0, 
              ticketsSold: 0,
              totalRSVPs: 0,
              eventsWithMostSales: [],
              eventAnalytics: []
            }
          }};
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
        ticketsSold: 0,
        totalRSVPs: 0,
        eventsWithMostSales: [],
        eventAnalytics: []
      };
      
      if (analyticsResponse.data && analyticsResponse.data.data) {
        const analyticsData = analyticsResponse.data.data;
        analytics = {
          total: analyticsData.totalRevenue || 0,
          thisMonth: analyticsData.thisMonthRevenue || 0,
          ticketsSold: analyticsData.ticketsSold || 0,
          totalRSVPs: analyticsData.totalRSVPs || 0,
          eventsWithMostSales: analyticsData.eventsWithMostSales || [],
          eventAnalytics: analyticsData.eventAnalytics || []
        };
        
        // Enhance events with analytics data
        if (analyticsData.eventAnalytics && Array.isArray(analyticsData.eventAnalytics)) {
          eventsData = eventsData.map(event => {
            const eventAnalytic = analyticsData.eventAnalytics.find(a => 
              a.eventId.toString() === event._id.toString()
            );
            
            if (eventAnalytic) {
              return {
                ...event,
                ticketsSold: eventAnalytic.ticketsSold || 0,
                revenue: eventAnalytic.revenue || 0,
                rsvpCount: eventAnalytic.rsvpCount || 0
              };
            }
            
            return event;
          });
        }
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
      const response = await API.patch(`/tickets/${attendeeId}/check-in`);
      
      if (response.data && response.data.success) {
        // Get the attendee name if possible
        const attendee = attendees.find(a => a._id === attendeeId);
        const attendeeName = attendee?.name || 'Attendee';
        
        // Show success notification without refreshing entire page
        refreshAttendees(`${attendeeName} checked in successfully`, 'success', false);
        
        // Update the attendee in state to show checked-in UI immediately
        setAttendees(prev => 
          prev.map(a => a._id === attendeeId ? { ...a, isUsed: true, status: 'used' } : a)
        );
      } else {
        refreshAttendees(response.data?.message || 'Failed to check in attendee', 'error', false);
      }
    } catch (error) {
      console.error('Error checking in attendee:', error);
      refreshAttendees('Failed to check in attendee', 'error', false);
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

  // Update the refreshAttendees function
  const refreshAttendees = useCallback(async (message = null, severity = 'success', shouldRefresh = true) => {
    // Show notification message if provided
    if (message) {
      showSnackbar(message, severity);
    }
    
    // Only trigger full data refresh if explicitly requested
    if (shouldRefresh) {
      await fetchOrganizerData();
    }
  }, [fetchOrganizerData, showSnackbar]);

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
        <Grid item xs={12} sm={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatRevenue(analyticsData?.total)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This Month
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatRevenue(analyticsData?.thisMonth)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tickets Sold
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {(analyticsData?.ticketsSold || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total RSVPs
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {(analyticsData?.totalRSVPs || 0).toLocaleString()}
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

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              minWidth: 'auto',
              mx: 1,
              '&:first-of-type': { ml: 0 },
            },
            '& .Mui-selected': {
              color: COLORS.ORANGE_MAIN,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: COLORS.ORANGE_MAIN,
            },
          }}
        >
          <Tab 
            icon={<EventIcon />} 
            iconPosition="start" 
            label="Events" 
            id="dashboard-tab-0"
          />
          <Tab 
            icon={<RSVPIcon />} 
            iconPosition="start" 
            label="RSVPs" 
            id="dashboard-tab-1"
          />
          <Tab 
            icon={<BarChartIcon />} 
            iconPosition="start" 
            label="Analytics" 
            id="dashboard-tab-2"
          />
        </Tabs>
      </Box>

      {/* Events Tab */}
      <TabPanel value={activeTab} index={0}>
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
                  onRefreshAttendees={refreshAttendees}
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
      </TabPanel>

      {/* RSVPs Tab */}
      <TabPanel value={activeTab} index={1}>
        <RSVPsTab />
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={2}>
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
                      <TableCell align="right">Tickets Available</TableCell>
                      <TableCell align="right">RSVPs</TableCell>
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
                        <TableCell align="right">{event.ticketsAvailable || 0}</TableCell>
                        <TableCell align="right">{event.rsvpCount || 0}</TableCell>
                        <TableCell align="right">{formatRevenue(event.revenue)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '2px solid rgba(224, 224, 224, 1)' } }}>
                      <TableCell>Total</TableCell>
                      <TableCell align="right">{(analyticsData?.ticketsSold || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">{(analyticsData?.totalRSVPs || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{formatRevenue(analyticsData?.total)}</TableCell>
                    </TableRow>
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
      </TabPanel>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Event?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. All tickets, RSVPs and data associated with this event will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteEvent} color="error" autoFocus>
            Delete
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
        sx={{ mb: 4 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrganizerDashboardPage; 