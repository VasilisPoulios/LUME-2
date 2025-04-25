import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Grid, 
  Divider, 
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  SvgIcon
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LogoText } from '../../styles';

// Social Media Icons
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import SendIcon from '@mui/icons-material/Send';

// Custom X Logo (formerly Twitter)
const XIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (email && email.includes('@')) {
      // Here you would typically call an API to subscribe the user
      console.log('Subscribing:', email);
      setSubscribed(true);
      setEmail('');
      // Reset after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1A1A1A',
        color: 'white',
        width: '100%',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* LUME Logo and Description */}
          <Grid item xs={12} md={4}>
            <LogoText variant="h5" sx={{ mb: 2 }}>
              LUME
            </LogoText>
            <Typography variant="body2" sx={{ mb: 4, opacity: 0.7, maxWidth: 380 }}>
              Discover amazing events happening near you. From concerts to workshops, find your next experience with LUME.
            </Typography>
            
            {/* Social Media Icons */}
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Follow Us
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <IconButton 
                aria-label="Instagram" 
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                aria-label="X" 
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <XIcon />
              </IconButton>
              <IconButton 
                aria-label="LinkedIn" 
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton 
                aria-label="Facebook" 
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <FacebookIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '1.125rem' }}>
              LUME
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/about" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                About Us
              </Link>
              <Link component={RouterLink} to="/contact" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Contact
              </Link>
              <Link component={RouterLink} to="/faq" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                FAQ
              </Link>
              <Link component={RouterLink} to="/privacy-policy" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/promote-event" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Promote Your Event
              </Link>
            </Stack>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '1.125rem' }}>
              Discover
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/discover" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                All Events
              </Link>
              <Link component={RouterLink} to="/categories" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Categories
              </Link>
              <Link component={RouterLink} to="/discover?featured=true" color="inherit" underline="hover" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Featured Events
              </Link>
            </Stack>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1.125rem' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
              Subscribe to our newsletter for updates on the latest events
            </Typography>
            <Box component="form" onSubmit={handleSubscribe} noValidate sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Your email address"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                required
                sx={{
                  mb: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& input': {
                    color: 'white',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        type="submit" 
                        edge="end" 
                        color="primary"
                        aria-label="subscribe"
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {subscribed && (
                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                  Thanks for subscribing!
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              &copy; {new Date().getFullYear()} LUME. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: { sm: 'flex-end' }, alignItems: { sm: 'center' } }}>
              <Link color="inherit" href="#" underline="hover" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                Terms of Service
              </Link>
              <Link color="inherit" href="#" underline="hover" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                Cookies Policy
              </Link>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 