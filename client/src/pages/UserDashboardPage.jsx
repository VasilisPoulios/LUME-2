import { useState, useEffect } from 'react';
import API from '../api';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles';
import { SavedEvents, TicketsList, ReviewForm } from '../components/dashboard';
import dayjs from 'dayjs';

const UserDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Debug user authentication status
  console.log('Dashboard - User auth status:', { 
    isAuthenticated, 
    hasUser: !!user, 
    userData: user 
  });
  
  // Redirect if no user (shouldn't happen due to ProtectedRoute, but extra safety)
  if (!user) {
    console.error('No user found in UserDashboardPage');
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Authentication error. Please try logging in again.
        </Alert>
      </Container>
    );
  }
  
  // State for dashboard data
  const [savedEvents, setSavedEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all user dashboard data
  useEffect(() => {
    // Skip API calls if user ID is not available
    if (!user || !user._id) {
      console.error('User ID not available, skipping dashboard data fetch');
      setLoading(false);
      setError('User information not available. Please try logging in again.');
      return;
    }
    
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching dashboard data with token:', localStorage.getItem('token'));
        
        // Define empty fallback data
        let savedEventsData = [];
        let ticketsData = [];
        let reviewsData = [];
        let pastEventsData = [];
        
        // Fetch data one by one with individual error handling
        try {
          console.log('Fetching saved events...');
          const savedEventsResponse = await API.get('/users/saved-events');
          console.log('Saved events response:', savedEventsResponse);
          if (savedEventsResponse?.data) {
            savedEventsData = Array.isArray(savedEventsResponse.data) 
              ? savedEventsResponse.data 
              : (savedEventsResponse.data.data || []);
          }
        } catch (err) {
          console.error('Error fetching saved events:', err.message);
        }
        
        try {
          const ticketsResponse = await API.get('/tickets');
          console.log('Tickets response:', ticketsResponse);
          if (ticketsResponse?.data) {
            ticketsData = Array.isArray(ticketsResponse.data) 
              ? ticketsResponse.data 
              : (ticketsResponse.data.data || []);
          }
        } catch (err) {
          console.error('Error fetching tickets:', err.message);
        }
        
        try {
          const reviewsResponse = await API.get(`/reviews?user=${user._id}`);
          console.log('Reviews response:', reviewsResponse);
          if (reviewsResponse?.data) {
            reviewsData = Array.isArray(reviewsResponse.data) 
              ? reviewsResponse.data 
              : (reviewsResponse.data.data || []);
          }
        } catch (err) {
          console.error('Error fetching reviews:', err.message);
        }
        
        try {
          const pastEventsResponse = await API.get('/events/past');
          console.log('Past events response:', pastEventsResponse);
          if (pastEventsResponse?.data) {
            pastEventsData = Array.isArray(pastEventsResponse.data) 
              ? pastEventsResponse.data 
              : (pastEventsResponse.data.data || []);
          }
        } catch (err) {
          console.error('Error fetching past events:', err.message);
        }
        
        // Update state with available data (even if some endpoints failed)
        setSavedEvents(savedEventsData);
        setTickets(ticketsData);
        setReviews(reviewsData);
        setPastEvents(pastEventsData);
        
        // Don't set an error, just handle empty data in the UI
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Some dashboard data could not be loaded. This could be because the server features are still in development.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user._id]);
  
  // Calculate events that need reviews
  const eventsNeedingReviews = Array.isArray(pastEvents) ? pastEvents.filter(event => {
    // Check if this event is in the user's past events but not in their reviews
    return !reviews.some(review => review.event?._id === event._id);
  }) : [];
  
  // Handle removing a saved event
  const handleRemoveSavedEvent = async (eventId) => {
    try {
      await API.delete(`/users/saved-events/${eventId}`);
      // Update the state to remove the event
      setSavedEvents(savedEvents.filter(event => event._id !== eventId));
    } catch (err) {
      console.error('Error removing saved event:', err);
      setError('Failed to remove saved event. Please try again.');
    }
  };
  
  // Handle submitting a review
  const handleSubmitReview = async (eventId, reviewData) => {
    try {
      await API.post('/reviews', {
        event: eventId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      // Add the new review to the reviews list
      const event = Array.isArray(pastEvents) ? pastEvents.find(e => e._id === eventId) : null;
      setReviews([
        ...reviews,
        {
          _id: Date.now().toString(), // Temporary ID
          event,
          rating: reviewData.rating,
          comment: reviewData.comment,
          user: user
        }
      ]);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      throw new Error('Failed to submit review. Please try again.');
    }
  };
  
  // Loading state
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
  
  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
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
          mb: 2
        }}
      >
        My Dashboard
      </Typography>
      
      <Alert severity="info" sx={{ mb: 4 }}>
        Some features may be unavailable as the server is still in development. You're successfully logged in as {user.name}.
      </Alert>
      
      <Grid container spacing={4}>
        {/* Saved Events Section */}
        <Grid item xs={12}>
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
              Saved Events
            </Typography>
            
            {savedEvents.length > 0 ? (
              <SavedEvents 
                events={savedEvents} 
                onRemove={handleRemoveSavedEvent} 
              />
            ) : (
              <Typography color="text.secondary">
                You haven't saved any events yet. Browse events and click the bookmark icon to save them here.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* My Tickets Section */}
        <Grid item xs={12}>
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
              My Tickets
            </Typography>
            
            {tickets.length > 0 ? (
              <TicketsList tickets={tickets} />
            ) : (
              <Typography color="text.secondary">
                You don't have any tickets yet. Purchase tickets for events to see them here.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Write a Review Section - Only show if there are events needing reviews */}
        {Array.isArray(eventsNeedingReviews) && eventsNeedingReviews.length > 0 && (
          <Grid item xs={12}>
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
                Pending Reviews
              </Typography>
              
              <ReviewForm 
                events={eventsNeedingReviews} 
                onSubmitReview={handleSubmitReview} 
              />
            </Paper>
          </Grid>
        )}
        
        {/* Submitted Reviews Section - Only show if there are reviews */}
        {Array.isArray(reviews) && reviews.length > 0 && (
          <Grid item xs={12}>
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
                Your Reviews
              </Typography>
              
              <Box>
                {reviews.map(review => (
                  <Box 
                    key={review._id}
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      backgroundColor: 'rgba(249, 249, 249, 0.6)',
                      border: `1px solid ${COLORS.GRAY_LIGHT}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {review.event?.title || 'Event'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <Box 
                          key={i}
                          component="span" 
                          sx={{ 
                            color: i < review.rating ? COLORS.ORANGE_MAIN : COLORS.GRAY_LIGHT,
                            mr: 0.5
                          }}
                        >
                          ★
                        </Box>
                      ))}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {dayjs(review.createdAt).format('MMM D, YYYY')}
                      </Typography>
                    </Box>
                    
                    {review.comment && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {review.comment}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default UserDashboardPage; 