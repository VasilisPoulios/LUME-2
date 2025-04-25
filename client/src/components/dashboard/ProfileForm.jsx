import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Avatar, 
  Grid,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  PhotoCamera, 
  Save, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../styles';
import API from '../../api';

const ProfileForm = () => {
  const { user, updateUserData } = useAuth();
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // Avatar states
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should not exceed 2MB');
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await API.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        updateUserData(response.data);
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await API.put('/users/password', {
        currentPassword,
        newPassword
      });
      
      if (response.data) {
        setSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {/* Profile Information Section */}
      <Box component="form" onSubmit={handleUpdateProfile} sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} sm={4} md={3} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={avatarPreview || (user?.avatar ? `${user.avatar}` : undefined)} 
              alt={user?.name || 'User'}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto',
                mb: 2,
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<PhotoCamera />}
              sx={{ 
                mt: 1,
                borderColor: COLORS.ORANGE_LIGHT,
                color: COLORS.ORANGE_MAIN,
                '&:hover': {
                  borderColor: COLORS.ORANGE_MAIN,
                  backgroundColor: 'rgba(255, 128, 0, 0.05)'
                }
              }}
            >
              Change Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={8} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={email}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  variant="outlined"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Tell others about yourself"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{ 
                    bgcolor: COLORS.ORANGE_MAIN,
                    '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                    mt: 1
                  }}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Change Password Section */}
      <Box component="form" onSubmit={handleUpdatePassword}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ fontWeight: 600, color: COLORS.SLATE }}
        >
          Change Password
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              variant="outlined"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              label="New Password"
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={newPassword !== confirmPassword && confirmPassword !== ''}
              helperText={
                newPassword !== confirmPassword && confirmPassword !== '' 
                  ? 'Passwords do not match' 
                  : ''
              }
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                bgcolor: COLORS.ORANGE_MAIN,
                '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                mt: 1
              }}
            >
              Update Password
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfileForm; 