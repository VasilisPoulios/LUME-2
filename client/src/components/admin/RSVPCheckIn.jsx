import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EditOutlined as EditIcon,
  Save as SaveIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { COLORS } from '../../styles';
import dayjs from 'dayjs';
import { checkInRSVP } from '../../api/rsvpService';

const RSVPCheckIn = ({ rsvp, onCheckedInChange }) => {
  // If rsvp is undefined, return null to avoid errors
  if (!rsvp) return null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [checkedInGuests, setCheckedInGuests] = useState(rsvp.checkedInGuests || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Safely extract first character of name or use fallback
  const nameInitial = rsvp.name && typeof rsvp.name === 'string' ? 
    rsvp.name.charAt(0).toUpperCase() : '?';
    
  // Check if rsvp is fully checked in
  const isFullyCheckedIn = checkedInGuests >= rsvp.quantity;
  // Check if partially checked in
  const isPartiallyCheckedIn = checkedInGuests > 0 && checkedInGuests < rsvp.quantity;
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleSaveClick = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // API call to update checked-in count using the service
      const response = await checkInRSVP(rsvp._id, checkedInGuests);
      
      if (response.success) {
        // Update was successful
        setSuccess('Check-in status updated successfully');
        setIsEditing(false);
        
        // Call parent callback to update UI
        if (onCheckedInChange) {
          onCheckedInChange(rsvp._id, checkedInGuests);
        }
      } else {
        setError(response.message || 'Failed to update check-in status');
      }
    } catch (err) {
      console.error('Error updating RSVP check-in status:', err);
      setError('Error updating check-in status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Reset to original value
    setCheckedInGuests(rsvp.checkedInGuests || 0);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };
  
  const handleFullCheckIn = async () => {
    setCheckedInGuests(rsvp.quantity);
    
    // If already in edit mode, don't auto-save
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        handleSaveClick();
      }, 0);
    }
  };
  
  const handleGuestCountChange = (event) => {
    const value = parseInt(event.target.value);
    setCheckedInGuests(value);
  };
  
  // Get status text
  const getStatusText = () => {
    if (isFullyCheckedIn) return 'All Checked In';
    if (isPartiallyCheckedIn) return `${checkedInGuests}/${rsvp.quantity} Checked In`;
    return 'Not Checked In';
  };
  
  // Get status color
  const getStatusColor = () => {
    if (isFullyCheckedIn) return 'success';
    if (isPartiallyCheckedIn) return 'warning';
    return 'default';
  };
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        border: `1px solid ${COLORS.GRAY_LIGHT}`, 
        borderRadius: 2,
        bgcolor: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: isFullyCheckedIn 
                ? COLORS.GREEN_LIGHT 
                : isPartiallyCheckedIn 
                ? COLORS.ORANGE_LIGHT 
                : COLORS.GRAY_LIGHT 
            }}
          >
            {nameInitial}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={500}>{rsvp.name || 'Guest'}</Typography>
            <Typography variant="body2" color="text.secondary">{rsvp.email || ''}</Typography>
            {rsvp.phone && (
              <Typography variant="body2" color="text.secondary">
                {rsvp.phone}
              </Typography>
            )}
            <Typography variant="caption" display="block" color="text.secondary">
              Reserved on {dayjs(rsvp.createdAt).format('MMM D, YYYY')}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Chip 
            icon={isFullyCheckedIn ? <CheckCircleIcon /> : <PersonIcon />}
            label={getStatusText()}
            color={getStatusColor()}
            variant={isFullyCheckedIn ? "filled" : "outlined"}
            sx={{ fontWeight: 500 }}
          />
          
          <Typography 
            variant="caption" 
            display="block" 
            textAlign="right" 
            sx={{ mt: 0.5 }}
          >
            Total guests: {rsvp.quantity}
          </Typography>
        </Box>
      </Box>
      
      {(error || success) && (
        <Box sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </Box>
      )}
      
      <Box 
        sx={{ 
          mt: 2, 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        {isEditing ? (
          <>
            <FormControl size="small" sx={{ width: 150, mr: 2 }}>
              <InputLabel>Checked-in Guests</InputLabel>
              <Select
                value={checkedInGuests}
                label="Checked-in Guests"
                onChange={handleGuestCountChange}
                disabled={loading}
              >
                {[...Array(rsvp.quantity + 1).keys()].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} of {rsvp.quantity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined"
              color="error"
              size="small"
              onClick={handleCancelEdit}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSaveClick}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              sx={{ 
                bgcolor: COLORS.ORANGE_MAIN,
                '&:hover': { bgcolor: COLORS.ORANGE_DARK }
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={handleFullCheckIn}
              sx={{ mr: 1 }}
              startIcon={<CheckCircleIcon />}
              color="success"
            >
              Check In All
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleEditClick}
              startIcon={<EditIcon />}
            >
              Edit Count
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default RSVPCheckIn; 