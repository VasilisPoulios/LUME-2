import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPaymentHistory } from '../api/paymentService';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  EventNote,
  CheckCircle,
  Pending,
  HourglassEmpty
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { COLORS } from '../styles';

const Tickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tickets' } });
      return;
    }

    // Check if user came from successful payment
    if (location.state?.paymentSuccess) {
      setShowSuccess(true);
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await getPaymentHistory();
        
        if (response.success) {
          console.log('Tickets fetched successfully:', response.data);
          // Handle the tickets format - the tickets endpoint returns tickets directly
          setTickets(formatTicketsData(response.data));
        } else {
          setError('Could not load your tickets');
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  // Format tickets data to match the expected format
  const formatTicketsData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(ticket => {
      return {
        id: ticket._id,
        ticket: {
          _id: ticket._id,
          ticketCode: ticket.ticketCode,
          status: ticket.status || 'active',
          quantity: ticket.quantity || 1
        },
        event: {
          title: ticket.event?.title || 'Event',
          startDateTime: ticket.event?.startDateTime || ticket.event?.date,
          venue: ticket.event?.venue || 'Venue',
          address: ticket.event?.location?.address || ticket.event?.address || 'Address'
        },
        payment: {
          id: ticket._id,
          amount: ticket.amount,
          status: ticket.status
        }
      };
    });
  };

  // Get the status icon based on ticket status
  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'active':
      case 'valid':
        return <CheckCircle fontSize="small" />;
      case 'used':
        return <HourglassEmpty fontSize="small" />;
      default:
        return <Pending fontSize="small" />;
    }
  };

  // Get the status color based on ticket status
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active':
      case 'valid':
        return 'success';
      case 'used':
        return 'default';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: COLORS.ORANGE_MAIN }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your tickets...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          color: COLORS.SLATE,
          mb: 3
        }}
      >
        My Tickets
      </Typography>
      
      {showSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 4 }}
        >
          Payment successful! Your ticket has been issued.
          {location.state?.ticketId && (
            <Button
              sx={{ ml: 2 }}
              variant="outlined"
              size="small"
              color="success"
              onClick={() => navigate(`/tickets/${location.state.ticketId}`)}
            >
              View Ticket
            </Button>
          )}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {!loading && tickets.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            border: `1px solid ${COLORS.GRAY_LIGHT}`
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            You don't have any tickets yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Browse events and purchase tickets to see them here.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              bgcolor: COLORS.ORANGE_MAIN,
              '&:hover': { bgcolor: COLORS.ORANGE_DARK }
            }}
          >
            Browse Events
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tickets.map((ticket) => (
            <Grid item xs={12} md={6} lg={4} key={ticket.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: `1px solid ${COLORS.GRAY_LIGHT}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {ticket.event.title}
                    </Typography>
                    <Chip 
                      label={ticket.ticket.status} 
                      size="small"
                      color={getStatusColor(ticket.ticket.status)}
                      icon={getStatusIcon(ticket.ticket.status)}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_LIGHT }} />
                    <Typography variant="body2">
                      {dayjs(ticket.event.startDateTime).format('dddd, MMMM D, YYYY')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_LIGHT }} />
                    <Typography variant="body2">
                      {dayjs(ticket.event.startDateTime).format('h:mm A')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1, mt: 0.3, color: COLORS.ORANGE_LIGHT }} />
                    <Typography variant="body2">
                      {ticket.event.venue}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventNote fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_LIGHT }} />
                    <Typography variant="body2">
                      Ticket ID: {ticket.ticket.ticketCode || 'N/A'}
                    </Typography>
                  </Box>
                  
                  {ticket.ticket.quantity > 1 && (
                    <Chip 
                      label={`${ticket.ticket.quantity} tickets`}
                      size="small"
                      sx={{ 
                        mt: 1,
                        bgcolor: 'rgba(255, 128, 0, 0.1)',
                        color: COLORS.ORANGE_DARK,
                        fontWeight: 600
                      }}
                    />
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/tickets/${ticket.ticket.ticketCode}`)}
                    sx={{
                      bgcolor: COLORS.ORANGE_MAIN,
                      '&:hover': { bgcolor: COLORS.ORANGE_DARK }
                    }}
                  >
                    View Ticket Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Tickets; 