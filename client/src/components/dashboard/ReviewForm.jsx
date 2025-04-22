import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Rating, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  CardActions,
  Collapse,
  Alert,
  Grid
} from '@mui/material';
import { Star, EventNote, CalendarToday } from '@mui/icons-material';
import dayjs from 'dayjs';
import { COLORS } from '../../styles';

// Empty state component
const EmptyState = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: 4,
      color: COLORS.SLATE_LIGHT
    }}
  >
    <Typography variant="body1" gutterBottom>
      You don't have any events to review.
    </Typography>
    <Typography variant="body2">
      After attending events, you'll be able to share your experience here.
    </Typography>
  </Box>
);

const ReviewForm = ({ events, onSubmitReview }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});

  if (!events || events.length === 0) {
    return <EmptyState />;
  }

  const handleRatingChange = (eventId, value) => {
    setFormData(prev => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        rating: value
      }
    }));
    
    // Clear any rating error
    if (errors[eventId]?.rating) {
      setErrors(prev => ({
        ...prev,
        [eventId]: {
          ...(prev[eventId] || {}),
          rating: null
        }
      }));
    }
  };

  const handleCommentChange = (eventId, value) => {
    setFormData(prev => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        comment: value
      }
    }));
  };

  const validateForm = (eventId) => {
    const data = formData[eventId] || {};
    const newErrors = {};
    let isValid = true;

    if (!data.rating || data.rating < 1) {
      newErrors.rating = 'Please select a rating';
      isValid = false;
    }

    setErrors(prev => ({
      ...prev,
      [eventId]: newErrors
    }));

    return isValid;
  };

  const handleSubmit = async (eventId) => {
    if (!validateForm(eventId)) {
      return;
    }

    setSubmitting(prev => ({ ...prev, [eventId]: true }));
    setSuccess(prev => ({ ...prev, [eventId]: false }));

    try {
      await onSubmitReview(eventId, formData[eventId]);
      
      // Clear form data and set success
      setFormData(prev => ({ ...prev, [eventId]: {} }));
      setSuccess(prev => ({ ...prev, [eventId]: true }));
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, [eventId]: false }));
      }, 5000);
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [eventId]: {
          ...(prev[eventId] || {}),
          submit: error.message || 'Failed to submit review. Please try again.'
        }
      }));
    } finally {
      setSubmitting(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item xs={12} md={6} key={event._id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: 'none',
              border: `1px solid ${COLORS.GRAY_LIGHT}`
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  fontWeight: 600
                }}
              >
                <EventNote sx={{ mr: 1, color: COLORS.ORANGE_MAIN }} />
                {event.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_LIGHT }} />
                <Typography variant="body2" color="text.secondary">
                  {dayjs(event.date).format('MMMM D, YYYY')}
                  {event.time && ` • ${event.time}`}
                </Typography>
              </Box>
              
              <Collapse in={success[event._id]}>
                <Alert 
                  severity="success" 
                  sx={{ mb: 2 }}
                  onClose={() => setSuccess(prev => ({ ...prev, [event._id]: false }))}
                >
                  Thanks for your review!
                </Alert>
              </Collapse>
              
              <Collapse in={!!errors[event._id]?.submit}>
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                  onClose={() => setErrors(prev => ({ 
                    ...prev, 
                    [event._id]: { ...(prev[event._id] || {}), submit: null } 
                  }))}
                >
                  {errors[event._id]?.submit}
                </Alert>
              </Collapse>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  How would you rate this event?
                </Typography>
                <Rating
                  name={`rating-${event._id}`}
                  value={formData[event._id]?.rating || 0}
                  onChange={(_, value) => handleRatingChange(event._id, value)}
                  precision={1}
                  emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: COLORS.ORANGE_MAIN,
                    }
                  }}
                />
                {errors[event._id]?.rating && (
                  <Typography 
                    variant="caption" 
                    color="error"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {errors[event._id].rating}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Share your thoughts (optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Tell us about your experience..."
                  value={formData[event._id]?.comment || ''}
                  onChange={(e) => handleCommentChange(event._id, e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.ORANGE_MAIN,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                onClick={() => handleSubmit(event._id)}
                disabled={submitting[event._id] || success[event._id]}
                sx={{
                  backgroundColor: COLORS.ORANGE_MAIN,
                  '&:hover': {
                    backgroundColor: COLORS.ORANGE_DARK,
                  },
                  '&.Mui-disabled': {
                    backgroundColor: success[event._id] ? COLORS.GREEN : undefined,
                    color: success[event._id] ? 'white' : undefined,
                  }
                }}
              >
                {submitting[event._id] ? 'Submitting...' : 
                 success[event._id] ? 'Submitted' : 'Submit Review'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReviewForm; 