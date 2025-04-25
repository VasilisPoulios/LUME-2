import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Chip,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider,
  Stack
} from '@mui/material';
import { 
  Search, 
  Event, 
  Person, 
  Phone, 
  CalendarToday, 
  ExpandMore,
  Download,
  KeyboardArrowRight,
  Place
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../styles';
import dayjs from 'dayjs';
import NoDataIllustration from '../ui/NoDataIllustration';
import { getOrganizerRSVPs } from '../../api/rsvpService';

const RSVPsTab = () => {
  const { user } = useAuth();
  const [rsvps, setRSVPs] = useState([]);
  const [filteredRSVPs, setFilteredRSVPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalRSVPs: 0,
    totalGuests: 0
  });
  
  // State to store RSVPs grouped by event
  const [rsvpsByEvent, setRSVPsByEvent] = useState({});
  // Track expanded event accordions
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Fetch RSVPs
  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        setLoading(true);
        const response = await getOrganizerRSVPs();
        
        if (response.success) {
          const rsvpData = response.data || [];
          
          // Log a few RSVPs to see their structure
          if (rsvpData.length > 0) {
            console.log('Sample RSVP data:', rsvpData[0]);
          }
          
          setRSVPs(rsvpData);
          setFilteredRSVPs(rsvpData);
          
          // Group RSVPs by event
          const grouped = {};
          rsvpData.forEach(rsvp => {
            if (!rsvp.event || !rsvp.event._id) return;
            
            const eventId = rsvp.event._id.toString();
            
            // Log the first RSVP for each event to debug
            if (!grouped[eventId]) {
              console.log('First RSVP for event:', {
                eventId: eventId,
                eventTitle: rsvp.event.title,
                eventDates: {
                  startDateTime: rsvp.event.startDateTime,
                  startDate: rsvp.event.startDate,
                  date: rsvp.event.date,
                  eventDate: rsvp.event.eventDate,
                  createdAt: rsvp.event.createdAt
                },
                rsvpCreatedAt: rsvp.createdAt
              });
              
              grouped[eventId] = {
                event: rsvp.event,
                rsvps: [],
                totalGuests: 0
              };
            }
            
            grouped[eventId].rsvps.push(rsvp);
            grouped[eventId].totalGuests += rsvp.quantity || 0;
          });
          
          setRSVPsByEvent(grouped);
          
          setStats({
            totalRSVPs: response.count || 0,
            totalGuests: response.totalGuests || 0
          });
        } else {
          setError(response.message || 'Failed to fetch RSVPs');
        }
      } catch (err) {
        console.error('Error fetching RSVPs:', err);
        setError('Failed to fetch RSVPs');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchRSVPs();
    }
  }, [user?._id]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRSVPs(rsvps);
      
      // Reset grouped RSVPs to show all events
      const grouped = {};
      rsvps.forEach(rsvp => {
        if (!rsvp.event || !rsvp.event._id) return;
        
        const eventId = rsvp.event._id.toString();
        if (!grouped[eventId]) {
          grouped[eventId] = {
            event: rsvp.event,
            rsvps: [],
            totalGuests: 0
          };
        }
        
        grouped[eventId].rsvps.push(rsvp);
        grouped[eventId].totalGuests += rsvp.quantity || 0;
      });
      
      setRSVPsByEvent(grouped);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = rsvps.filter(
        rsvp => 
          rsvp.name?.toLowerCase().includes(lowercaseSearch) ||
          rsvp.email?.toLowerCase().includes(lowercaseSearch) ||
          rsvp.phone?.toLowerCase().includes(lowercaseSearch) ||
          rsvp.event?.title?.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredRSVPs(filtered);
      
      // Update grouped RSVPs to only show matching results
      const grouped = {};
      filtered.forEach(rsvp => {
        if (!rsvp.event || !rsvp.event._id) return;
        
        const eventId = rsvp.event._id.toString();
        if (!grouped[eventId]) {
          grouped[eventId] = {
            event: rsvp.event,
            rsvps: [],
            totalGuests: 0
          };
        }
        
        grouped[eventId].rsvps.push(rsvp);
        grouped[eventId].totalGuests += rsvp.quantity || 0;
      });
      
      setRSVPsByEvent(grouped);
    }
  }, [searchTerm, rsvps]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date - with extra fallback
  const formatDate = (dateString, fallbackString = null) => {
    if (!dateString && !fallbackString) return 'N/A';
    
    // Try primary date first
    if (dateString) {
      try {
        const parsedDate = dayjs(dateString);
        
        // Validate that the parsed date is valid
        if (parsedDate.isValid()) {
          return parsedDate.format('MMM D, YYYY - h:mm A');
        }
      } catch (err) {
        console.error('Error formatting primary date:', err);
        // Continue to fallback
      }
    }
    
    // Try fallback if provided
    if (fallbackString) {
      try {
        const parsedFallback = dayjs(fallbackString);
        
        if (parsedFallback.isValid()) {
          return parsedFallback.format('MMM D, YYYY - h:mm A');
        }
      } catch (err) {
        console.error('Error formatting fallback date:', err);
      }
    }
    
    // Final attempt with specific format on the primary date
    if (dateString) {
      try {
        const withFormat = dayjs(dateString, 'YYYY-MM-DD HH:mm:ss', true);
        if (withFormat.isValid()) {
          return withFormat.format('MMM D, YYYY - h:mm A');
        }
      } catch (err) {
        // Silent fail
      }
    }
    
    console.warn('Invalid date format for both primary and fallback:', { primary: dateString, fallback: fallbackString });
    return 'N/A';
  };

  // Export all RSVPs to CSV
  const exportAllToCSV = () => {
    if (!filteredRSVPs.length) return;

    const headers = ['Name', 'Email', 'Phone', 'Guests', 'Event', 'Date'];
    const csvRows = [
      headers.join(','),
      ...filteredRSVPs.map(rsvp => [
        `"${rsvp.name || ''}"`,
        `"${rsvp.email || ''}"`,
        `"${rsvp.phone || ''}"`,
        rsvp.quantity || 0,
        `"${rsvp.event?.title || ''}"`,
        `"${formatDate(rsvp.createdAt)}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `all_rsvps_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export RSVPs for a specific event
  const exportEventRSVPs = (eventId, eventTitle) => {
    const eventRSVPs = rsvpsByEvent[eventId]?.rsvps || [];
    if (!eventRSVPs.length) return;
    
    const safeEventTitle = eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const headers = ['Name', 'Email', 'Phone', 'Guests', 'Check-in Status', 'Date'];
    const csvRows = [
      headers.join(','),
      ...eventRSVPs.map(rsvp => [
        `"${rsvp.name || ''}"`,
        `"${rsvp.email || ''}"`,
        `"${rsvp.phone || ''}"`,
        rsvp.quantity || 0,
        rsvp.checkedInGuests > 0 ? `"${rsvp.checkedInGuests}/${rsvp.quantity} checked in"` : '"Not checked in"',
        `"${formatDate(rsvp.createdAt)}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${safeEventTitle}_rsvps_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle accordion expansion
  const handleAccordionChange = (eventId) => (event, isExpanded) => {
    setExpandedEvent(isExpanded ? eventId : null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress sx={{ color: COLORS.ORANGE_MAIN }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            borderRadius: 2,
            border: `1px solid ${COLORS.GRAY_LIGHT}`,
            flex: '1 1 200px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ mr: 1, color: COLORS.ORANGE_MAIN }} />
            <Typography variant="body2" color="text.secondary">
              Total RSVPs
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>
            {stats.totalRSVPs.toLocaleString()}
          </Typography>
        </Paper>

        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            borderRadius: 2,
            border: `1px solid ${COLORS.GRAY_LIGHT}`,
            flex: '1 1 200px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Event sx={{ mr: 1, color: COLORS.ORANGE_MAIN }} />
            <Typography variant="body2" color="text.secondary">
              Total Guests
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>
            {stats.totalGuests.toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* Search and Export */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search RSVPs by name, email, or event..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: '500px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button 
          variant="outlined"
          onClick={exportAllToCSV}
          disabled={filteredRSVPs.length === 0}
          startIcon={<Download />}
          sx={{ ml: 2 }}
        >
          Export All
        </Button>
      </Box>

      {/* RSVPs by Event */}
      {Object.keys(rsvpsByEvent).length > 0 ? (
        <Stack spacing={2}>
          {Object.entries(rsvpsByEvent).map(([eventId, eventData]) => (
            <Accordion 
              key={eventId}
              expanded={expandedEvent === eventId}
              onChange={handleAccordionChange(eventId)}
              sx={{ 
                border: `1px solid ${COLORS.GRAY_LIGHT}`,
                borderRadius: 2,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                mb: 1
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ 
                  backgroundColor: COLORS.GRAY_LIGHTEST,
                  borderRadius: expandedEvent === eventId ? '8px 8px 0 0' : 2
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {eventData.event.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={`${eventData.rsvps.length} RSVPs`} 
                        size="small"
                        sx={{ 
                          mr: 1,
                          fontWeight: 600,
                          bgcolor: COLORS.ORANGE_LIGHT,
                          color: COLORS.ORANGE_DARK
                        }}
                      />
                      <Chip 
                        label={`${eventData.totalGuests} guests`} 
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          bgcolor: COLORS.BLUE_LIGHT,
                          color: COLORS.BLUE_DARK
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {(() => {
                          // Debug log the event data to see what date fields are available
                          console.log('Event date fields:', {
                            eventId: eventId,
                            title: eventData.event.title,
                            startDateTime: eventData.event.startDateTime,
                            startDate: eventData.event.startDate,
                            date: eventData.event.date,
                            eventDate: eventData.event.eventDate,
                            createdAt: eventData.event.createdAt
                          });
                          
                          // Try to get date from a RSVP if event date is missing
                          const primaryDate = eventData.event.startDateTime || 
                                            eventData.event.startDate || 
                                            eventData.event.date || 
                                            eventData.event.eventDate;
                                          
                          // Get fallback date from first RSVP or event creation
                          let fallbackDate = eventData.event.createdAt;
                          if (eventData.rsvps.length > 0) {
                            fallbackDate = eventData.rsvps[0].createdAt || fallbackDate;
                          }
                          
                          return formatDate(primaryDate, fallbackDate);
                        })()}
                      </Typography>
                    </Box>
                    {eventData.event.venue && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Place sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {eventData.event.venue}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    onClick={() => exportEventRSVPs(eventId, eventData.event.title)}
                    sx={{ mb: 1 }}
                  >
                    Export RSVPs for this event
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.GRAY_LIGHTEST }}>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell align="center">Guests</TableCell>
                        <TableCell>Check-in Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventData.rsvps.map((rsvp) => (
                        <TableRow key={rsvp._id} hover>
                          <TableCell>{rsvp.name}</TableCell>
                          <TableCell>{rsvp.email}</TableCell>
                          <TableCell>{rsvp.phone || '-'}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={rsvp.quantity} 
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                bgcolor: COLORS.ORANGE_LIGHT,
                                color: COLORS.ORANGE_DARK
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            {rsvp.checkedInGuests > 0 ? (
                              <Chip 
                                label={`${rsvp.checkedInGuests}/${rsvp.quantity} checked in`} 
                                size="small"
                                color={rsvp.checkedInGuests >= rsvp.quantity ? "success" : "warning"}
                                variant="outlined"
                              />
                            ) : (
                              <Chip 
                                label="Not checked in" 
                                size="small"
                                color="default"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell>{formatDate(rsvp.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <NoDataIllustration width={200} height={200} />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            No RSVPs Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms' : 'You don\'t have any RSVPs for your events yet'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RSVPsTab; 