import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

/**
 * A specialized protected route component for admin-only routes
 * Checks if the user is authenticated and has the admin role
 * Redirects to login or shows unauthorized message if not
 */
const ProtectedRouteAdmin = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    // Store the current path for redirecting back after login
    localStorage.setItem('authRedirectPath', window.location.pathname);
    return <Navigate to="/login" />;
  }

  // If logged in but not admin, show unauthorized message
  if (user.role !== 'admin') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>Unauthorized Access</Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            This area is restricted to administrators only.
          </Alert>
          <Typography variant="body1" paragraph>
            You don't have the required permissions to access this page.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href="/"
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  // If admin, render the protected content
  return children;
};

export default ProtectedRouteAdmin; 