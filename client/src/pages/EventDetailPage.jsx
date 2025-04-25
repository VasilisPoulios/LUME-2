import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Container,
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Paper,
  Avatar,
  Rating,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  IconButton,
  Stack
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  CalendarToday,
  Person,
  AttachMoney,
  Group,
  AddCircleOutline,
  RemoveCircleOutline,
  Remove,
  Add,
  VerifiedUser
} from '@mui/icons-material';
import { LumeButton } from '../components/ui';
import { COLORS } from '../styles';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl, formatPrice, formatCurrency } from '../utils/helpers';
import { getEvent, createRSVP } from '../api/eventService';
import { createPaymentIntent } from '../api/paymentService';
import RSVPForm from '../components/RSVPForm';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [hasTicketOrRsvp, setHasTicketOrRsvp] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [maxCapacity, setMaxCapacity] = useState(10); // Default max capacity
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [rsvpOpen, setRsvpOpen] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await getEvent(id);
        
        if (response.success && response.data) {
          const eventData = response.data.data || response.data;
          setEvent(eventData);
          
          // Set max capacity based on available tickets/spots
          if (eventData.ticketsAvailable) {
            const availableSpots = eventData.ticketsAvailable - (eventData.attendees?.length || 0);
            setMaxCapacity(Math.min(10, Math.max(1, availableSpots)));
          }
          
          // Only check attendance if user is logged in and auth is not still loading
          if (user && !authLoading && eventData.attendees) {
            const hasAttended = eventData.attendees.some(
              attendee => attendee.user === user._id || attendee.user?._id === user._id
            );
            setHasTicketOrRsvp(hasAttended);
          }
        } else {
          setError(response.message || 'Failed to load event details. Please try again later.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
        setLoading(false);
      }
    };

    // Only fetch if auth loading is complete
    if (!authLoading) {
      fetchEventDetails();
    }
  }, [id, user, authLoading]);

  // Fetch related events
  useEffect(() => {
    if (event) {
      const fetchRelatedEvents = async () => {
        try {
          // Use category to fetch related events
          const response = await axios.get(`/api/events?category=${encodeURIComponent(event.category)}&limit=3&excludeId=${id}`);
          
          if (response.data && response.data.data) {
            setRelatedEvents(response.data.data.slice(0, 3)); // Limit to 3 related events
          }
        } catch (err) {
          console.error('Error fetching related events:', err);
          // Don't set error state as this is not critical
        }
      };

      fetchRelatedEvents();
    }
  }, [event, id]);

  // Format date and time from event data
  const getFormattedDate = () => {
    if (!event) return 'TBD';
    
    // Try different date formats/fields
    const eventDate = event.date || event.startDateTime || event.startDate;
    if (!eventDate) return 'TBD';
    
    return dayjs(eventDate).format('MMMM D, YYYY');
  };
  
  const getFormattedTime = () => {
    if (!event) return 'TBD';
    
    // Try different time formats/fields
    const eventTime = event.time || event.startTime;
    if (eventTime && typeof eventTime === 'string' && !eventTime.includes('T')) {
      // If it's just a time string
      return eventTime;
    }
    
    // If startDateTime exists, format the time from it
    if (event.startDateTime) {
      return dayjs(event.startDateTime).format('h:mm A');
    }
    
    return 'TBD';
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value >= 1 && value <= maxCapacity) {
      setQuantity(value);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < maxCapacity) {
      setQuantity(quantity + 1);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRSVP = () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login with message
      navigate('/login', {
        state: {
          message: "Please log in to RSVP for this event.",
          from: `/events/${id}`
        }
      });
      return;
    }
    
    // If user is authenticated, open the RSVP form
    setRsvpOpen(true);
  };

  // Define the fetchEvent function used in handleRSVPSuccess
  const fetchEvent = async () => {
    try {
      const response = await getEvent(id);
      if (response.success && response.data) {
        setEvent(response.data.data || response.data);
        setHasTicketOrRsvp(true);
      }
    } catch (err) {
      console.error('Error refreshing event data:', err);
    }
  };

  const handleRSVPSuccess = () => {
    setRsvpSuccess(true);
    // Refresh event data
    fetchEvent();
  };

  const handleBuyTicket = async () => {
    if (!user) {
      // Store the current path in localStorage
      localStorage.setItem('authRedirectPath', `/events/${id}`);
      navigate('/login');
      return;
    }
    
    setCheckoutLoading(true);
    
    try {
      // Create payment intent using paymentService
      const response = await createPaymentIntent(id, quantity);
      
      if (response.success && response.data && response.data.clientSecret) {
        // Store data in localStorage for checkout page to use
        localStorage.setItem('checkoutData', JSON.stringify({
          eventId: id,
          eventName: event.title,
          quantity,
          amount: (event.price || 0) * quantity,
          clientSecret: response.data.clientSecret
        }));
        
        // Navigate to checkout
        navigate(`/checkout/event/${id}`);
      } else {
        throw new Error(response.message || 'Failed to create payment intent');
      }
    } catch (err) {
      console.error('Payment error:', err);
      
      // Show error message
      setSnackbarMessage(err.message || 'Failed to process payment request. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      // Store the current path in localStorage
      localStorage.setItem('authRedirectPath', `/events/${id}`);
      navigate('/login');
      return;
    }

    if (userReview.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      await axios.post('/api/reviews', {
        event: id,
        rating: userReview.rating,
        comment: userReview.comment
      });
      
      setReviewSuccess(true);
      setUserReview({ rating: 0, comment: '' });
      
      // Refresh event data to show the new review
      const response = await getEvent(id);
      if (response.success && response.data) {
        setEvent(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setReviewError('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Add handleShare function definition
  const handleShare = () => {
    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setSnackbarMessage('Event link copied to clipboard!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        })
        .catch(err => {
          console.error('Could not copy text:', err);
          setSnackbarMessage('Could not copy event link');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    }
  };

  if (loading || authLoading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: COLORS.ORANGE_MAIN }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading event details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/" 
          variant="contained"
          sx={{ 
            backgroundColor: COLORS.ORANGE_MAIN,
            '&:hover': { backgroundColor: COLORS.ORANGE_DARK }
          }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Event not found
        </Alert>
        <Button 
          component={RouterLink} 
          to="/" 
          variant="contained"
          sx={{ 
            backgroundColor: COLORS.ORANGE_MAIN,
            '&:hover': { backgroundColor: COLORS.ORANGE_DARK }
          }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  // Format date and time
  const formattedDate = getFormattedDate();
  const formattedTime = getFormattedTime();
  
  // Format image URL
  const formattedImageUrl = formatImageUrl(event.image);

  // Calculate average rating
  const averageRating = event.reviews && event.reviews.length > 0
    ? event.reviews.reduce((sum, review) => sum + review.rating, 0) / event.reviews.length
    : 0;

  // Availability message
  const availabilityMessage = event.ticketsAvailable && event.ticketsAvailable < 10 
    ? `Only ${event.ticketsAvailable} left!` 
    : event.ticketsAvailable && event.ticketsAvailable > 0 
      ? 'Available' 
      : 'Event is sold out';
  const isAvailable = event.ticketsAvailable > 0;

  // User authentication check
  const isUserAuthenticated = () => !!user;
  const hasRSVPd = hasTicketOrRsvp;

  // New logic for free events
  const isEventFree = event ? event.price === 0 : false;

  return (
    <div>
      {/* Event Cover Image with Gradient Overlay */}
      <Box 
        sx={{ 
          height: { xs: 280, sm: 350, md: 450 },
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), url(${formattedImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          position: 'relative',
          mb: { xs: 0, md: 0 }
        }}
      >
        {/* Floating Card for Event Details */}
        <Container maxWidth="lg" sx={{ position: 'relative', pb: { xs: 2, md: 4 } }}>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label={event.category}
                sx={{ 
                  backgroundColor: COLORS.ORANGE_MAIN, 
                  color: 'white',
                  fontWeight: 600,
                  px: 1.5
                }}
              />
              {event.isPaid || event.price > 0 ? (
                <Chip
                  label={`€${formatPrice(event.price || 0)}`}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: COLORS.ORANGE_DARK,
                    fontWeight: 700
                  }}
                />
              ) : (
                <Chip
                  label="Free Event"
                  sx={{ 
                    backgroundColor: 'rgba(52, 168, 83, 0.9)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}
              
              {event.ticketsAvailable && event.ticketsAvailable < 10 && (
                <Chip
                  label={`Only ${event.ticketsAvailable} left!`}
                  sx={{ 
                    backgroundColor: 'rgba(234, 67, 53, 0.9)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}
            </Stack>
            
            <Typography 
              variant="h2" 
              component="h1"
              sx={{ 
                color: 'white', 
                fontWeight: 800,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.5rem' },
                maxWidth: { md: '80%' },
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              {event.title}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              color: 'white', 
              mb: 2,
              gap: { xs: 1, sm: 3 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={500}>
                  {formattedDate}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={500}>
                  {formattedTime}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                <Typography 
                  variant="subtitle1" 
                  fontWeight={500} 
                  sx={{
                    maxWidth: { xs: '250px', sm: 'none' },
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {event.venue || (event.location?.address ? event.location.address.split(',')[0] : 'Location TBD')}
                </Typography>
              </Box>
            </Box>

            {/* Quick Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {event.price === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleRSVP}
                  disabled={event.ticketsAvailable === 0}
                >
                  RSVP Now
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleBuyTicket}
                  disabled={event.ticketsAvailable === 0}
                >
                  Buy Ticket
                </Button>
              )}
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={handleShare}
              >
                Share Event
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Action Bar for Mobile */}
      <Box 
        sx={{ 
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        <Typography fontWeight={600} color={COLORS.SLATE}>
          {event.isPaid || event.price > 0 
            ? `€${formatPrice(event.price || 0)}`
            : 'Free'}
        </Typography>
        
        <LumeButton
          size="small"
          disabled={rsvpLoading || checkoutLoading || hasTicketOrRsvp || !(event.ticketsAvailable > 0)}
          onClick={event.isPaid || event.price > 0 ? handleBuyTicket : handleRSVP}
        >
          {rsvpLoading || checkoutLoading 
            ? <CircularProgress size={16} color="inherit" />
            : hasTicketOrRsvp 
              ? 'You\'re Going!' 
              : !(event.ticketsAvailable > 0)
                ? 'Sold Out'
                : event.isPaid || event.price > 0
                  ? `Get Tickets`
                  : `RSVP Now`}
        </LumeButton>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8, px: { xs: 2, sm: 3, md: 3 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ 
              p: { xs: 3, md: 4 }, 
              borderRadius: 2, 
              mb: 4,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {/* Organizer Info */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 3,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: COLORS.ORANGE_MAIN,
                    width: 50,
                    height: 50,
                    mr: 2
                  }}
                >
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Organized by
                  </Typography>
                  <Typography 
                    component={RouterLink}
                    to={`/organizer/${event.organizer?._id || 'unknown'}`}
                    variant="h6"
                    sx={{ 
                      color: COLORS.ORANGE_DARK,
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {event.organizer?.name || 'Unknown Organizer'}
                  </Typography>
                </Box>
              </Box>

              {/* RSVP/Buy Success or Error Messages */}
              {rsvpSuccess && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 4 }}
                  onClose={() => setRsvpSuccess(false)}
                >
                  You've successfully RSVP'd for this event!
                </Alert>
              )}
              
              {rsvpError && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 4 }}
                  onClose={() => setRsvpError(null)}
                >
                  {rsvpError}
                </Alert>
              )}

              {/* Event Description */}
              <Typography 
                variant="h5" 
                component="h2" 
                fontWeight={700} 
                gutterBottom
                color={COLORS.SLATE}
                sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
              >
                About this event
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  whiteSpace: 'pre-wrap', // Changed from pre-line to pre-wrap for better wrapping
                  color: COLORS.SLATE,
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  wordBreak: 'break-word', // Add word breaking
                  overflowWrap: 'break-word' // Ensure long words wrap
                }}
              >
                {event.description}
              </Typography>

              {/* What to expect section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  fontWeight={700} 
                  gutterBottom
                  color={COLORS.SLATE}
                  sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                >
                  What to expect
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'rgba(255,129,0,0.03)'
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Date and Time
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                        <CalendarToday sx={{ color: COLORS.ORANGE_MAIN, mr: 1.5, mt: 0.3 }} />
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {formattedDate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formattedTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'rgba(255,129,0,0.03)'
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Location
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                        <LocationOn sx={{ color: COLORS.ORANGE_MAIN, mr: 1.5, mt: 0.3 }} />
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {event.venue || 'Venue TBD'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.address || event.location?.address || 'Address TBD'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Google Maps */}
              {event.location?.latitude && event.location?.longitude ? (
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    fontWeight={700} 
                    gutterBottom
                    color={COLORS.SLATE}
                    sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                  >
                    Event location
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <iframe
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${event.location.latitude},${event.location.longitude}&output=embed`}
                      title="Event Location Map"
                    />
                  </Paper>
                </Box>
              ) : null}
            </Paper>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                position: { md: 'sticky' },
                top: { md: '94px' }
              }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 2, sm: 3, md: 4 }, 
                  mb: 3, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden'
                }}
              >
                {/* Price Header */}
                <Box sx={{ 
                  py: 1.5,
                  px: 2,
                  mb: 3,
                  ml: { xs: -2, sm: -3, md: -4 },
                  mr: { xs: -2, sm: -3, md: -4 },
                  bgcolor: 'rgba(255,129,0,0.08)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      color={COLORS.SLATE}
                    >
                      {isEventFree ? 'Free Event' : (
                        <>
                          €{formatPrice(event.price || 0)}
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ ml: 0.5, fontWeight: 400 }}
                          >
                            / ticket
                          </Typography>
                        </>
                      )}
                    </Typography>

                    <Chip 
                      label={availabilityMessage} 
                      size="small"
                      color={isAvailable ? "success" : "error"}
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Box>
                </Box>

                {/* Ticket Form */}
                <form>
                  {!isEventFree && (
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom
                        fontWeight={600}
                        color={COLORS.SLATE}
                      >
                        Number of tickets
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          justifyContent: 'space-between'
                        }}
                      >
                        <IconButton 
                          size="small"
                          disabled={quantity <= 1 || !isAvailable}
                          onClick={() => handleDecreaseQuantity()}
                          sx={{ 
                            color: COLORS.ORANGE_MAIN,
                            bgcolor: 'rgba(255,129,0,0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(255,129,0,0.2)'
                            },
                            '&.Mui-disabled': {
                              color: 'rgba(0,0,0,0.26)'
                            }
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        
                        <Typography 
                          variant="body1" 
                          component="span"
                          sx={{ 
                            fontWeight: 600,
                            minWidth: '40px',
                            textAlign: 'center'
                          }}
                        >
                          {quantity}
                        </Typography>
                        
                        <IconButton 
                          size="small"
                          disabled={quantity >= maxCapacity || !isAvailable}
                          onClick={() => handleIncreaseQuantity()}
                          sx={{ 
                            color: COLORS.ORANGE_MAIN,
                            bgcolor: 'rgba(255,129,0,0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(255,129,0,0.2)'
                            },
                            '&.Mui-disabled': {
                              color: 'rgba(0,0,0,0.26)'
                            }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Price Summary for paid events */}
                  {!isEventFree && quantity > 0 && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        mb: 3, 
                        borderRadius: 2,
                        bgcolor: 'rgba(255,129,0,0.03)',
                        border: '1px solid',
                        borderColor: 'rgba(255,129,0,0.1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Price ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          €{formatPrice((event.price || 0) * quantity)}
                        </Typography>
                      </Box>
                      
                      {/* Service fees could be added here */}
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Total
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={600} color={COLORS.ORANGE_DARK}>
                          €{formatPrice((event.price || 0) * quantity)}
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                  
                  {/* RSVP/Buy Button */}
                  {isUserAuthenticated() ? (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={!isAvailable || rsvpLoading || checkoutLoading || hasRSVPd}
                      onClick={isEventFree ? handleRSVP : handleBuyTicket}
                      sx={{
                        bgcolor: COLORS.ORANGE_MAIN,
                        '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                        py: { xs: 1, sm: 1.5 },
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(255, 129, 0, 0.15)',
                        '&:disabled': {
                          bgcolor: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)'
                        }
                      }}
                    >
                      {rsvpLoading || checkoutLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : hasRSVPd ? (
                        "You're attending"
                      ) : isEventFree ? (
                        "RSVP Now"
                      ) : (
                        `Buy Tickets - €${formatPrice((event.price || 0) * quantity)}`
                      )}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      component={RouterLink}
                      to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                      sx={{
                        bgcolor: COLORS.ORANGE_MAIN,
                        '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                        py: { xs: 1, sm: 1.5 },
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(255, 129, 0, 0.15)',
                      }}
                    >
                      Login to {isEventFree ? 'RSVP' : 'Buy Tickets'}
                    </Button>
                  )}
                </form>
                
                {/* Trust Signal */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 3
                  }}
                >
                  <VerifiedUser 
                    fontSize="small" 
                    sx={{ 
                      color: COLORS.ORANGE_MAIN,
                      mr: 1,
                      fontSize: '0.875rem'
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Secure transaction powered by LUME
                  </Typography>
                </Box>
              </Paper>
              
              {/* Organizer Info Card */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: { xs: 3, md: 0 }
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  fontWeight={600}
                  color={COLORS.SLATE}
                >
                  About the organizer
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: COLORS.ORANGE_MAIN,
                      width: 40,
                      height: 40,
                      mr: 2
                    }}
                  >
                    <Person />
                  </Avatar>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography 
                      variant="body1" 
                      component={RouterLink}
                      to={`/organizer/${event.organizer?._id || 'unknown'}`}
                      sx={{ 
                        color: COLORS.ORANGE_DARK,
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'block',
                        '&:hover': {
                          textDecoration: 'underline'
                        },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {event.organizer?.name || 'Unknown Organizer'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {event.organizer?.eventsCount || 0} {event.organizer?.eventsCount === 1 ? 'event' : 'events'} 
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Reviews Section - Moved below the main content */}
        <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: { xs: 2, md: 4 } }}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography 
                variant="h5" 
                component="h2" 
                fontWeight={700} 
                gutterBottom
                color={COLORS.SLATE}
                sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
              >
                Reviews
              </Typography>
              
              {/* Average Rating */}
              {event.reviews && event.reviews.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating 
                    value={averageRating} 
                    precision={0.5} 
                    readOnly 
                    sx={{ 
                      color: COLORS.ORANGE_MAIN,
                      '& .MuiRating-iconEmpty': {
                        color: 'rgba(255, 129, 0, 0.3)'
                      }
                    }}
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ ml: 1, fontWeight: 600 }}
                    color={COLORS.SLATE}
                  >
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({event.reviews.length} {event.reviews.length === 1 ? 'review' : 'reviews'})
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No reviews yet
                </Typography>
              )}
              
              {/* Review Form */}
              {hasTicketOrRsvp && user && (
                <>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      mb: 3, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'rgba(255,129,0,0.03)'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      fontWeight={600}
                      color={COLORS.SLATE}
                    >
                      Share your experience
                    </Typography>
                    
                    {reviewSuccess && (
                      <Alert 
                        severity="success" 
                        sx={{ mb: 2 }}
                        onClose={() => setReviewSuccess(false)}
                      >
                        Your review has been submitted successfully!
                      </Alert>
                    )}
                    
                    {reviewError && (
                      <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        onClose={() => setReviewError(null)}
                      >
                        {reviewError}
                      </Alert>
                    )}
                    
                    <form onSubmit={handleReviewSubmit}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom fontWeight={500}>
                          Your rating
                        </Typography>
                        <Rating
                          name="rating"
                          value={userReview.rating}
                          onChange={(_, newValue) => {
                            setUserReview(prev => ({ ...prev, rating: newValue }));
                          }}
                          sx={{ 
                            color: COLORS.ORANGE_MAIN,
                            '& .MuiRating-iconEmpty': {
                              color: 'rgba(255, 129, 0, 0.3)'
                            }
                          }}
                        />
                      </Box>
                      
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Share your thoughts about this event..."
                        variant="outlined"
                        value={userReview.comment}
                        onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white'
                          }
                        }}
                      />
                      
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submittingReview}
                        sx={{
                          bgcolor: COLORS.ORANGE_MAIN,
                          '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                          px: 3,
                          py: 1
                        }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </form>
                  </Paper>
                  <Divider sx={{ my: 3 }} />
                </>
              )}
              
              {/* Reviews List */}
              {event.reviews && event.reviews.length > 0 ? (
                <Box>
                  {event.reviews.map((review, index) => (
                    <Paper 
                      key={index} 
                      elevation={0} 
                      sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        mb: 2, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: COLORS.ORANGE_LIGHT,
                            width: 40,
                            height: 40
                          }}
                        >
                          {review.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden', flex: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color={COLORS.SLATE}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {review.user?.name || 'Anonymous User'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Rating 
                              value={review.rating} 
                              size="small" 
                              readOnly 
                              sx={{ 
                                color: COLORS.ORANGE_MAIN,
                                '& .MuiRating-iconEmpty': {
                                  color: 'rgba(255, 129, 0, 0.3)'
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2"
                        sx={{
                          color: COLORS.SLATE,
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {review.comment || 'No comment provided.'}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    mb: 4,
                    fontStyle: 'italic'
                  }}
                >
                  Be the first to review this event!
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <Box sx={{ mt: { xs: 4, sm: 6, md: 8 } }}>
            <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
              You might also like
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {relatedEvents.map((relEvent) => (
                <Grid item xs={12} sm={6} md={4} key={relEvent._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea 
                      component={RouterLink} 
                      to={`/events/${relEvent._id}`}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={formatImageUrl(relEvent.image)}
                        alt={relEvent.title}
                      />
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.4em',
                            height: '2.8em'
                          }}
                        >
                          {relEvent.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {dayjs(relEvent.date).format('MMM D, YYYY')}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {relEvent.location?.address}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Chip 
                            label={relEvent.category} 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'rgba(255, 129, 0, 0.1)',
                              maxWidth: '60%',
                              overflow: 'hidden'
                            }}
                          />
                          <Typography fontWeight={600} color={COLORS.ORANGE_DARK}>
                            {relEvent.price > 0 ? `€${formatPrice(relEvent.price)}` : 'Free'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* RSVP Form */}
      <RSVPForm
        open={rsvpOpen}
        onClose={() => setRsvpOpen(false)}
        event={event}
        onSuccess={handleRSVPSuccess}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={rsvpSuccess}
        autoHideDuration={6000}
        onClose={() => setRsvpSuccess(false)}
      >
        <Alert
          onClose={() => setRsvpSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          You're on the list! We've sent your info to the organizer.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EventDetailPage; 