import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { user } = useAuth() || { user: null }; // Provide default value

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1A1A1A',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              LUME
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Discover amazing events happening near you. From concerts to workshops, find your next experience with LUME.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Discover
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link component={RouterLink} to="/discover" color="inherit" sx={{ mb: 1 }}>
                Events
              </Link>
              <Link component={RouterLink} to="/categories" color="inherit" sx={{ mb: 1 }}>
                Categories
              </Link>
              <Link component={RouterLink} to="/discover?featured=true" color="inherit" sx={{ mb: 1 }}>
                Featured
              </Link>
            </Box>
          </Grid>

          {/* Account */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Account
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {user ? (
                <>
                  <Link component={RouterLink} to="/dashboard" color="inherit" sx={{ mb: 1 }}>
                    Dashboard
                  </Link>
                  <Link component={RouterLink} to="/tickets" color="inherit" sx={{ mb: 1 }}>
                    My Tickets
                  </Link>
                </>
              ) : (
                <>
                  <Link component={RouterLink} to="/login" color="inherit" sx={{ mb: 1 }}>
                    Login
                  </Link>
                  <Link component={RouterLink} to="/register" color="inherit" sx={{ mb: 1 }}>
                    Register
                  </Link>
                </>
              )}
            </Box>
          </Grid>

          {/* About */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link component={RouterLink} to="/about" color="inherit" sx={{ mb: 1 }}>
                About Us
              </Link>
              <Link component={RouterLink} to="/contact" color="inherit" sx={{ mb: 1 }}>
                Contact
              </Link>
              <Link component={RouterLink} to="/help" color="inherit" sx={{ mb: 1 }}>
                Help Center
              </Link>
            </Box>
          </Grid>

          {/* Organizers */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Organizers
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link component={RouterLink} to="/create-event" color="inherit" sx={{ mb: 1 }}>
                Create Event
              </Link>
              <Link component={RouterLink} to="/organizer" color="inherit" sx={{ mb: 1 }}>
                Organizer Dashboard
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} LUME. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Link color="inherit" href="#" underline="hover">
              Privacy Policy
            </Link>
            <Link color="inherit" href="#" underline="hover">
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 