import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  SvgIcon
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SendIcon from '@mui/icons-material/Send';
import PageHeader from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import { sendContactMessage } from '../api/contactService';

// Custom X icon (formerly Twitter) - using the same path as in Footer.jsx
const XIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

const ContactPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Use the contact service to send the message
      await sendContactMessage(formData);
      
      setSnackbar({
        open: true,
        message: 'Your message has been sent successfully!',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again later.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We'd love to hear from you"
        backgroundImage="/images/contact-header.jpg"
      />
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {/* Contact Information Section */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  backgroundImage: 'linear-gradient(to bottom right, #f8f9fa, #ffffff)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" component="h2" gutterBottom color="primary">
                  Get In Touch
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  Have questions about an event or need help with your tickets? We're here to assist you with any inquiries.
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="body1">aurorasession@gmail.com</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="body1">+1 (123) 456-7890</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="body1">
                      Niriidon 25<br />
                      Rhodes, Greece
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Follow Us
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      color="primary" 
                      aria-label="Facebook" 
                      component="a" 
                      href="https://facebook.com" 
                      target="_blank"
                    >
                      <FacebookIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      aria-label="X (formerly Twitter)" 
                      component="a" 
                      href="https://x.com" 
                      target="_blank"
                    >
                      <XIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      aria-label="Instagram" 
                      component="a" 
                      href="https://instagram.com" 
                      target="_blank"
                    >
                      <InstagramIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      aria-label="LinkedIn" 
                      component="a" 
                      href="https://linkedin.com" 
                      target="_blank"
                    >
                      <LinkedInIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
          
          {/* Contact Form Section */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4,
                  background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" component="h2" gutterBottom color="primary">
                  Send Us a Message
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  Fill out the form below and we'll get back to you as soon as possible.
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="name"
                        label="Your Name"
                        variant="outlined"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="email"
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        name="subject"
                        label="Subject"
                        variant="outlined"
                        fullWidth
                        value={formData.subject}
                        onChange={handleChange}
                        error={!!errors.subject}
                        helperText={errors.subject}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        name="message"
                        label="Your Message"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={isSubmitting}
                        endIcon={<SendIcon />}
                        sx={{ 
                          px: 4, 
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactPage; 