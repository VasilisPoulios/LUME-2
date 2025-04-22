import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RSVPForm = ({ open, onClose, event, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    quantity: 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`/api/events/${event._id}/rsvp`, formData);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>RSVP for {event.title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              required
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              required
              select
              label="Number of Guests"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
            >
              {[...Array(10)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit RSVP'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RSVPForm; 