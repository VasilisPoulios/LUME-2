import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Snackbar, 
  Alert, 
  Container, 
  Button, 
  IconButton,
  ButtonGroup,
  useMediaQuery,
  useTheme,
  Chip
} from '@mui/material';
import TinderCard from 'react-tinder-card';
import { useNavigate } from 'react-router-dom';
import EventCardSwiper from './EventCardSwiper';
import { getFeaturedEvents } from '../../api/eventService';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { getCategoryColor } from '../../utils/helpers';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';

const FeaturedSwipeDeck = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allSwiped, setAllSwiped] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeThreshold, setSwipeThreshold] = useState(50);
  const [lastAction, setLastAction] = useState(null);
  const [actionsHistory, setActionsHistory] = useState([]);
  
  // Track the direction that card is being dragged
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  // References to store card position and rotation data
  const cardRefs = useRef([]);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  
  // Detect if the device is mobile or desktop
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching featured events...');
        const response = await getFeaturedEvents();
        console.log('Featured events response:', response);
        
        if (response.success && response.data && Array.isArray(response.data.data)) {
          // Ensure we only get events with isFeatured = true
          const events = response.data.data.filter(event => event.isFeatured === true);
          console.log(`Filtered ${events.length} featured events from ${response.data.data.length} total events`);
          
          if (events.length === 0) {
            setError('No featured events available at the moment.');
            setLoading(false);
            return;
          }
          
          setFeaturedEvents(events);
          setCurrentIndex(events.length - 1);
          // Initialize the refs array with the correct length
          cardRefs.current = events.map(() => React.createRef());
        } else {
          console.error('Failed to fetch featured events:', response);
          setError('Failed to load featured events');
        }
      } catch (err) {
        console.error('Error fetching featured events:', err);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);
  
  // Function to manually trigger a swipe in a specific direction
  const triggerSwipe = (direction) => {
    if (currentIndex >= 0 && cardRefs.current[currentIndex]?.current?.swipe) {
      cardRefs.current[currentIndex].current.swipe(direction);
    }
  };
  
  // Handle saving event (button click or swipe right)
  const handleSave = async () => {
    if (currentIndex < 0 || currentIndex >= featuredEvents.length) return;
    
    const event = featuredEvents[currentIndex];
    
    // Add to actions history for potential undo
    setActionsHistory(prev => [...prev, { 
      type: 'save', 
      event,
      index: currentIndex 
    }]);
    
    // Update last action for undo feature
    setLastAction({
      type: 'save',
      event,
      index: currentIndex
    });
    
    // Update the current index
    setCurrentIndex(prevIndex => {
      // If this was the last card, set the allSwiped state
      if (prevIndex === 0) {
        setAllSwiped(true);
      }
      return prevIndex - 1;
    });
    
    if (!isAuthenticated) {
      // User not logged in, redirect to login with engaging message
      setSnackbarMessage('Redirecting you to login...');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
      
      setTimeout(() => {
        navigate('/login', {
          state: { 
            message: "Create a free account to save events you love!", 
            redirectAfterLogin: '/dashboard',
            eventToSave: event._id,
            fromFeature: 'featured-events'
          }
        });
      }, 1500);
      return;
    }

    try {
      setSnackbarMessage('Saving event...');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
      
      // Use the correct API endpoint to save events
      const response = await api.post(`/users/saved-events/${event._id}`);
      if (response.data && response.data.success) {
        // Success! Event saved
        setSnackbarMessage('🎉 Event saved to your favorites!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Optionally show a button to view saved events
        setTimeout(() => {
          setSnackbarMessage(
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Event saved! View in your dashboard?</span>
              <Button 
                size="small" 
                color="inherit" 
                variant="outlined" 
                sx={{ ml: 2, color: 'white', borderColor: 'white' }}
                onClick={() => navigate('/dashboard')}
              >
                Go to Saved
              </Button>
            </Box>
          );
          setOpenSnackbar(true);
        }, 3000);
      } else {
        // Handle API success but with error in response
        setSnackbarMessage('Failed to save event. Please try again.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Error saving event:', err);
      // Check if it's already saved error
      if (err.response && err.response.data && err.response.data.message === 'Event already saved') {
        setSnackbarMessage('You already saved this event!');
        setSnackbarSeverity('info');
      } else {
        setSnackbarMessage('Error saving event. Please try again.');
        setSnackbarSeverity('error');
      }
      setOpenSnackbar(true);
    }
  };
  
  // Handle skipping event (button click or swipe left)
  const handleSkip = () => {
    if (currentIndex < 0 || currentIndex >= featuredEvents.length) return;
    
    const event = featuredEvents[currentIndex];
    
    // Add to actions history for potential undo
    setActionsHistory(prev => [...prev, { 
      type: 'skip', 
      event,
      index: currentIndex 
    }]);
    
    // Update last action for undo feature
    setLastAction({
      type: 'skip',
      event,
      index: currentIndex
    });
    
    // Update the current index
    setCurrentIndex(prevIndex => {
      // If this was the last card, set the allSwiped state
      if (prevIndex === 0) {
        setAllSwiped(true);
      }
      return prevIndex - 1;
    });
    
    setSnackbarMessage('✅ Skipped. On to the next!');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
  };
  
  // Undo last action function
  const handleUndo = () => {
    if (!lastAction || actionsHistory.length === 0) return;
    
    // Get the last action
    const action = actionsHistory[actionsHistory.length - 1];
    
    // Remove last action from history
    setActionsHistory(prev => prev.slice(0, -1));
    setLastAction(actionsHistory.length > 1 ? actionsHistory[actionsHistory.length - 2] : null);
    
    // Restore the card
    setCurrentIndex(action.index);
    
    // If the last action was a save and the user was authenticated, remove from saved
    if (action.type === 'save' && isAuthenticated) {
      // Optional: You could make an API call to remove from saved events
      // api.delete(`/users/saved-events/${action.event._id}`);
    }
    
    setSnackbarMessage('Action undone');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
  };

  // Handle card swiping out (mobile only)
  const handleSwipe = async (direction, index) => {
    console.log(`Card swiped ${direction} (index: ${index})`);
    
    // Reset dragging state
    setIsDragging(false);
    setSwipeDirection(null);
    
    if (direction === 'right') {
      handleSave();
    } else if (direction === 'left') {
      handleSkip();
    }
  };

  // Handle while card is being dragged
  const handleCardLeftScreen = (direction, index) => {
    // This function fires when the card completely leaves the screen
    console.log(`Card ${index} left the screen in direction: ${direction}`);
    setIsDragging(false);
  };
  
  // Track drag direction for visual feedback
  const handleDrag = (direction, index) => {
    console.log(`Dragging in direction: ${direction}`);
    setSwipeDirection(direction);
    setIsDragging(true);
  };
  
  // When swipe requirement is no longer fulfilled
  const handleSwipeCancel = () => {
    console.log('Swipe cancelled');
    setSwipeDirection(null);
    setIsDragging(false);
  };

  const handleCardClick = (eventId) => {
    // Only navigate if not in dragging mode
    if (!isDragging) {
      navigate(`/events/${eventId}`);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setAllSwiped(false);
      setActionsHistory([]);
      setLastAction(null);
      console.log('Refreshing featured events...');
      const response = await getFeaturedEvents();
      console.log('Refresh response:', response);
      
      if (response.success && response.data && Array.isArray(response.data.data)) {
        // Ensure we only get events with isFeatured = true
        const events = response.data.data.filter(event => event.isFeatured === true);
        console.log(`Filtered ${events.length} featured events from ${response.data.data.length} total events`);
        
        if (events.length === 0) {
          setError('No featured events available at the moment.');
          setLoading(false);
          return;
        }
        
        setFeaturedEvents(events);
        setCurrentIndex(events.length - 1);
        cardRefs.current = events.map(() => React.createRef());
      } else {
        console.error('Failed to refresh featured events:', response);
        setError('Failed to refresh featured events');
      }
    } catch (err) {
      console.error('Error refreshing featured events:', err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">Loading featured events...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  if (allSwiped) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" align="center" gutterBottom>
          🎉 You've swiped through all featured events. Come back soon!
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleRefresh}
          sx={{ mt: 2 }}
        >
          Refresh Events
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'background.paper', position: 'relative' }}>
      <Container maxWidth="md">
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ fontWeight: 'bold', mb: 3 }}
        >
          🌟 Discover Featured Events
        </Typography>
        
        {isMobile ? (
          <Typography 
            variant="subtitle1" 
            align="center" 
            gutterBottom 
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Swipe right to save, left to skip, or tap for details
          </Typography>
        ) : (
          <Typography 
            variant="subtitle2" 
            align="center" 
            gutterBottom 
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Use the buttons below to save or skip this event
          </Typography>
        )}
        
        {/* Event card counter */}
        {currentIndex >= 0 && (
          <Box 
            sx={{ 
              position: 'absolute', 
              left: '16px',
              top: isMobile ? '80px' : '130px',
              zIndex: 2,
            }}
          >
            <Chip 
              label={`${currentIndex + 1} of ${featuredEvents.length}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        )}
        
        {/* Quick action buttons for mobile view */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <IconButton 
              color="error" 
              sx={{ mx: 2, bgcolor: 'rgba(211,47,47,0.1)' }}
              onClick={() => triggerSwipe('left')}
              disabled={currentIndex < 0 || loading}
            >
              <ThumbDownIcon fontSize="large" />
            </IconButton>
            
            <IconButton 
              color="success" 
              sx={{ mx: 2, bgcolor: 'rgba(46,125,50,0.1)' }}
              onClick={() => triggerSwipe('right')}
              disabled={currentIndex < 0 || loading}
            >
              <ThumbUpIcon fontSize="large" />
            </IconButton>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          position: 'relative',
          height: '65vh',
          maxHeight: '600px',
          mb: 3,
          tabIndex: 0, // For accessibility
        }}>
          {featuredEvents.map((event, index) => (
            <Box
              key={event._id}
              sx={{
                position: 'absolute',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                visibility: index > currentIndex ? 'hidden' : 'visible',
              }}
            >
              {isMobile ? (
                // Mobile view - Swipeable cards
                <TinderCard
                  ref={cardRefs.current[index]}
                  onSwipe={(dir) => handleSwipe(dir, index)}
                  onCardLeftScreen={(dir) => handleCardLeftScreen(dir, index)}
                  preventSwipe={['up', 'down']}
                  swipeRequirementType="position"
                  swipeThreshold={swipeThreshold}
                  flickOnSwipe={true}
                  className="swipe"
                  swipeRequirementSpeed={0.25} 
                  onSwipeRequirementFulfilled={(dir) => handleDrag(dir, index)}
                  onSwipeRequirementUnfulfilled={handleSwipeCancel}
                >
                  <Box 
                    onClick={() => handleCardClick(event._id)}
                    sx={{
                      transform: swipeDirection === 'left' 
                        ? 'rotate(-8deg)' 
                        : swipeDirection === 'right' 
                          ? 'rotate(8deg)' 
                          : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <EventCardSwiper event={event} getCategoryColor={getCategoryColor} />
                    
                    {/* Visual feedback indicators */}
                    {swipeDirection === 'right' && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: '20px',
                          right: '20px',
                          color: 'success.main',
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          padding: '10px',
                          fontWeight: 'bold',
                          fontSize: '1.5rem',
                          transform: 'rotate(15deg)',
                          border: '3px solid',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        SAVE
                      </Box>
                    )}
                    
                    {swipeDirection === 'left' && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: '20px',
                          left: '20px',
                          color: 'error.main',
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          padding: '10px',
                          fontWeight: 'bold',
                          fontSize: '1.5rem',
                          transform: 'rotate(-15deg)',
                          border: '3px solid',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        SKIP
                      </Box>
                    )}
                  </Box>
                </TinderCard>
              ) : (
                // Desktop view - Static card
                <Box 
                  onClick={() => handleCardClick(event._id)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <EventCardSwiper event={event} getCategoryColor={getCategoryColor} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
        
        {/* Desktop action buttons */}
        {!isMobile && currentIndex >= 0 && (
          <>
            <ButtonGroup variant="outlined" fullWidth sx={{ mt: 4 }}>
              <Button 
                color="error" 
                onClick={handleSkip}
                startIcon={<CloseIcon />}
                sx={{ py: 1.5, fontWeight: 500 }}
              >
                Skip
              </Button>
              <Button 
                color="primary" 
                onClick={handleSave}
                endIcon={<FavoriteIcon />}
                sx={{ py: 1.5, fontWeight: 500 }}
              >
                Save Event
              </Button>
            </ButtonGroup>
            
            {/* Undo button */}
            {lastAction && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  startIcon={<UndoIcon />}
                  onClick={handleUndo}
                  sx={{ textTransform: 'none' }}
                >
                  Undo Last Action
                </Button>
              </Box>
            )}
          </>
        )}
        
        {/* Mobile swipe instructions */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-around',
                width: '100%',
                maxWidth: '400px',
                p: 2,
                bgcolor: 'rgba(0,0,0,0.03)',
                borderRadius: 2,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
                  ← Swipe Left
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Skip
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  Tap
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View Details
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                  Swipe Right →
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Save
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeaturedSwipeDeck; 