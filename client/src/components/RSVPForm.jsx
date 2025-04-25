import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Alert,
  IconButton,
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Person, Email, Phone } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { COLORS } from '../styles';
import { createRSVP } from '../api/rsvpService';

const RSVPForm = ({ open, onClose, event, onSuccess }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    quantity: 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug logging of event prop when it changes
  useEffect(() => {
    console.log('[RSVP Form Debug] Event prop received:', event);
    console.log('[RSVP Form Debug] Event ID:', event?._id);
    console.log('[RSVP Form Debug] Event ID type:', typeof event?._id);
  }, [event]);

  // Calculate spots remaining
  const spotsRemaining = event?.ticketsAvailable || 0;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!user?.name || !user?.email || !formData.quantity) {
      setError('Name, email, and number of guests are required');
      return;
    }
    
    setLoading(true);

    try {
      // Make sure we have a valid event ID
      if (!event?._id) {
        throw new Error('Event ID is missing. Please try again.');
      }

      console.log('Submitting RSVP for event:', event._id);
      
      // Use the createRSVP service function instead of direct API call
      const response = await createRSVP(event._id, {
        name: user.name,
        email: user.email,
        phone: formData.phone,
        quantity: formData.quantity
      });
      
      console.log('RSVP response:', response);
      
      // Call onSuccess to update parent component
      if (response.success) {
        onSuccess(response);
        onClose();
      } else {
        // Handle error with specific message if available
        const errorMessage = response.message || 'Failed to RSVP';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      
      // Try to extract the most helpful error message
      let errorMessage = err.message || 'Something went wrong. Please try again.';
      
      // If it's an axios error, try to get the error from the response data
      if (err.error?.response?.data?.message) {
        errorMessage = err.error.response.data.message;
      }
      
      // Common error handling
      if (errorMessage.includes('not found')) {
        setError('Event not found. Please refresh the page and try again.');
      } else if (errorMessage.includes('already RSVPed')) {
        setError('You have already RSVPed for this event.');
      } else if (errorMessage.includes('tickets available')) {
        setError('Not enough tickets available. Please try a smaller quantity.');
      } else if (errorMessage === 'Server Error') {
        setError('The server encountered an error. Your RSVP may still have been processed. Please check with the event organizer.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '450px'
        }
      }}
    >
      <DialogTitle sx={{ 
        pr: 6, 
        pt: 3,
        fontWeight: 600,
        color: COLORS.SLATE 
      }}>
        RSVP for {event?.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 12,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: COLORS.SLATE }}>
              You're RSVPing as {user?.name} ({user?.email})
            </Typography>
            {spotsRemaining > 0 && (
              <Typography variant="body2" color="text.secondary">
                {spotsRemaining} spots remaining
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Name field - disabled, prefilled */}
            <TextField
              label="Full Name"
              name="name"
              value={user?.name || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              disabled
              fullWidth
            />
            
            {/* Email field - disabled, prefilled */}
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={user?.email || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              disabled
              fullWidth
            />
            
            {/* Phone field - editable */}
            <TextField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +30 123 456 7890"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            
            {/* Number of guests - select 1-10 */}
            <TextField
              required
              select
              label="Number of Guests"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              helperText="How many people (including you) will attend?"
              fullWidth
            >
              {[...Array(Math.min(10, spotsRemaining || 10))].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'guest' : 'guests'}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: COLORS.ORANGE_MAIN,
              '&:hover': { bgcolor: COLORS.ORANGE_DARK },
              minWidth: '120px'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm RSVP'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RSVPForm; 