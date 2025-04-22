import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  IconButton, 
  Chip,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Skeleton
} from '@mui/material';
import { 
  Delete, 
  CalendarToday, 
  LocationOn, 
  AccessTime, 
  Category,
  ArrowForward
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { COLORS } from '../../styles';
import { getEvent } from '../../api/eventService';

// Empty state component
const EmptyState = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: 4,
      px: 2,
      color: COLORS.SLATE_LIGHT,
      bgcolor: 'rgba(0,0,0,0.02)',
      borderRadius: 2,
      border: '1px dashed rgba(0,0,0,0.1)'
    }}
  >
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No Saved Events
    </Typography>
    <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
      You haven't saved any events yet.
    </Typography>
    <Typography variant="body2" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
      Browse events and swipe right on the Featured Events deck or click the bookmark icon to save events for later.
    </Typography>
    <Button
      component={Link}
      to="/discover"
      variant="contained"
      endIcon={<ArrowForward />}
      sx={{
        mt: 2,
        backgroundColor: COLORS.ORANGE_MAIN,
        '&:hover': { backgroundColor: COLORS.ORANGE_DARK },
        py: 1.5,
        px: 3
      }}
    >
      Discover Events
    </Button>
  </Box>
);

// Event card component
const EventCard = ({ event, onRemove }) => {
  const [fullEventData, setFullEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFullEventData = async () => {
      try {
        setLoading(true);
        // Fetch complete event data using the ID
        const response = await getEvent(event._id);
        if (response.success && response.data) {
          console.log('Fetched full event data:', response.data);
          // Use the data property that contains the actual event
          setFullEventData(response.data.data || response.data);
        } else {
          console.error('Error fetching event details:', response);
          setError('Could not fetch event details');
        }
      } catch (err) {
        console.error('Error in fetchFullEventData:', err);
        setError('Error loading event data');
      } finally {
        setLoading(false);
      }
    };

    if (event._id) {
      fetchFullEventData();
    }
  }, [event._id]);

  // Use the combined data - prefer full data but fall back to initial event data
  const displayData = fullEventData || event;

  // Format date properly
  const formatEventDate = () => {
    if (!displayData) return 'Date not available';
    
    // Check different possible date fields
    const startDate = displayData.startDateTime || displayData.date || displayData.eventDate;
    
    if (!startDate) return 'Date not available';
    
    try {
      return dayjs(startDate).format('MMM D, YYYY');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Date format error';
    }
  };

  // Format time properly
  const formatEventTime = () => {
    // Check different possible time fields
    if (!displayData) return null;
    
    // For time strings
    if (typeof displayData.time === 'string' && displayData.time.trim() !== '') {
      return displayData.time;
    }
    
    // For datetime objects
    try {
      if (displayData.startDateTime) {
        const start = dayjs(displayData.startDateTime).format('h:mm A');
        if (displayData.endDateTime) {
          const end = dayjs(displayData.endDateTime).format('h:mm A');
          return `${start} - ${end}`;
        }
        return start;
      }
    } catch (err) {
      console.error('Error formatting time:', err);
    }
    
    return null;
  };

  // Format price properly based on Event model structure
  const formatPrice = () => {
    if (!displayData) return 'Free';
    
    // In the Event model, price is a Number with default 0
    const price = displayData.price;
    
    console.log('Event price data:', {
      eventId: displayData._id,
      title: displayData.title,
      price: price,
      type: typeof price
    });
    
    // Free event
    if (price === 0 || price === '0' || price === null || price === undefined) {
      return 'Free';
    }
    
    // Handle string prices that might come from API
    if (typeof price === 'string') {
      if (price.toLowerCase().includes('free')) return 'Free';
      if (price.startsWith('$')) return price;
      
      // Try to parse numeric string
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return `$${numPrice.toFixed(2)}`;
      }
      return price;
    }
    
    // Handle number type as per model definition
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    
    return 'Free';
  };

  // Get image URL with proper fallback
  const getImageUrl = () => {
    if (!displayData) return 'https://via.placeholder.com/400x200?text=Event';
    
    // In the Event model, image is a String with default 'default-event.jpg'
    const imageUrl = displayData.image;
    
    console.log('Image data for event:', {
      eventId: displayData._id, 
      title: displayData.title,
      image: imageUrl
    });
    
    if (!imageUrl || imageUrl === 'default-event.jpg') {
      return 'https://via.placeholder.com/400x200?text=Event';
    }
    
    // Handle absolute URLs (already complete)
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Handle API server paths (assuming uploads directory structure)
    if (imageUrl.includes('uploads/')) {
      // Make sure we have the full URL to the backend server
      const baseApiUrl = 'http://localhost:4010';
      return `${baseApiUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
    // Handle any other relative server paths
    if (imageUrl.startsWith('/')) {
      const baseApiUrl = 'http://localhost:4010';
      return `${baseApiUrl}${imageUrl}`;
    }
    
    // Last resort fallback
    return 'https://via.placeholder.com/400x200?text=Event';
  };

  // Get location or venue information
  const getLocation = () => {
    if (!displayData) return 'Location unavailable';
    
    // Check different possible location fields
    if (typeof displayData.venue === 'string' && displayData.venue.trim() !== '') {
      return displayData.venue;
    }
    
    if (typeof displayData.address === 'string' && displayData.address.trim() !== '') {
      return displayData.address;
    }
    
    if (displayData.location) {
      // Handle string location
      if (typeof displayData.location === 'string') {
        return displayData.location;
      }
      
      // Handle object location
      if (typeof displayData.location === 'object') {
        if (displayData.location.name) return displayData.location.name;
        if (displayData.location.venue) return displayData.location.venue;
        if (displayData.location.address) return displayData.location.address;
        if (displayData.location.formattedAddress) return displayData.location.formattedAddress;
      }
    }
    
    return 'Location unavailable';
  };

  // Get category safely
  const getCategory = () => {
    if (!displayData) return null;
    
    if (displayData.category && typeof displayData.category === 'string' && displayData.category.trim() !== '') {
      return displayData.category;
    }
    
    if (displayData.tags && Array.isArray(displayData.tags) && displayData.tags.length > 0) {
      return displayData.tags[0];
    }
    
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <Skeleton variant="rectangular" height={160} animation="wave" />
        <CardContent>
          <Skeleton variant="text" height={60} animation="wave" />
          <Skeleton variant="text" width="60%" animation="wave" />
          <Divider sx={{ my: 1, opacity: 0.6 }} />
          <Skeleton variant="text" width="80%" animation="wave" />
          <Skeleton variant="text" width="70%" animation="wave" />
          <Skeleton variant="text" width="90%" animation="wave" />
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Skeleton variant="rectangular" width={120} height={36} animation="wave" />
        </CardActions>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.12)'
        },
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Featured badge */}
      {displayData.isFeatured && (
        <Chip
          label="Featured"
          color="primary"
          size="small"
          sx={{
            position: 'absolute', 
            top: -10, 
            left: 10, 
            zIndex: 1,
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
          }}
        />
      )}
      
      {/* Main image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={getImageUrl()}
          alt={displayData.title || 'Event'}
          sx={{ 
            objectFit: 'cover',
            bgcolor: 'rgba(0,0,0,0.04)'
          }}
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            e.target.src = 'https://via.placeholder.com/400x200?text=Event';
            e.target.onerror = null;
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            width: '100%', 
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            p: 1.5,
            pt: 3
          }}
        >
          <Typography 
            variant="body2" 
            fontWeight="600" 
            sx={{ 
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block',
              bgcolor: (displayData.price && displayData.price !== 0) ? 'rgba(255,128,0,0.7)' : 'rgba(46,125,50,0.7)'
            }}
          >
            {formatPrice()}
          </Typography>
        </Box>
        
        {/* Delete button */}
        <Tooltip title="Remove from saved">
          <IconButton
            aria-label="remove from saved"
            onClick={() => onRemove(displayData._id, displayData.title)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: COLORS.RED,
              '&:hover': {
                backgroundColor: 'white',
                transform: 'scale(1.1)'
              },
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Event title */}
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: '1.1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.7rem',
            mb: 1.5
          }}
        >
          {displayData.title || 'Untitled Event'}
        </Typography>
        
        {/* Category */}
        {getCategory() && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Category fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_MAIN, opacity: 0.8 }} />
            <Chip 
              label={getCategory()} 
              size="small" 
              sx={{ 
                height: 22, 
                fontSize: '0.75rem',
                bgcolor: 'rgba(255,128,0,0.1)',
                color: COLORS.ORANGE_DARK
              }} 
            />
          </Box>
        )}
        
        <Divider sx={{ my: 1, opacity: 0.6 }} />
        
        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: COLORS.SLATE }}>
          <CalendarToday fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_MAIN, opacity: 0.9 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatEventDate()}
          </Typography>
        </Box>
        
        {/* Time if available */}
        {formatEventTime() && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: COLORS.SLATE }}>
            <AccessTime fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_MAIN, opacity: 0.9 }} />
            <Typography variant="body2">
              {formatEventTime()}
            </Typography>
          </Box>
        )}
        
        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', color: COLORS.SLATE }}>
          <LocationOn fontSize="small" sx={{ mr: 1, mt: 0.3, color: COLORS.ORANGE_MAIN, opacity: 0.9 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {getLocation()}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button 
          component={Link} 
          to={`/events/${displayData._id}`}
          variant="outlined"
          size="small" 
          endIcon={<ArrowForward />}
          sx={{ 
            borderColor: COLORS.ORANGE_LIGHT,
            color: COLORS.ORANGE_MAIN,
            '&:hover': {
              backgroundColor: 'rgba(255, 128, 0, 0.05)',
              borderColor: COLORS.ORANGE_MAIN
            },
            fontWeight: 500,
            py: 0.7
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

const SavedEvents = ({ events, onRemove }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  if (!events || events.length === 0) {
    return <EmptyState />;
  }

  const handleRemove = (eventId, eventTitle) => {
    onRemove(eventId);
    setSnackbarMessage(`"${eventTitle || 'Event'}" removed from saved events`);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <EventCard event={event} onRemove={handleRemove} />
          </Grid>
        ))}
      </Grid>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="info" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SavedEvents; 