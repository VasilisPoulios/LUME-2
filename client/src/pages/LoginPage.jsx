import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper, 
  Link,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles';
import api from '../api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [pendingEventToSave, setPendingEventToSave] = useState(null);
  
  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect path and message on component mount
  useEffect(() => {
    // Check for message from redirects (e.g., from Featured Swipe Deck)
    if (location.state?.message) {
      setAlertMessage(location.state.message);
      setAlertSeverity('info');
    }
    
    // Store any pending event to save after login
    if (location.state?.eventToSave) {
      setPendingEventToSave(location.state.eventToSave);
      
      // Set redirect path if provided
      if (location.state?.redirectAfterLogin) {
        setRedirectPath(location.state.redirectAfterLogin);
      }
    }
    
    const savedPath = localStorage.getItem('authRedirectPath');
    if (savedPath) {
      setRedirectPath(savedPath);
    }
  }, [location]);

  // Function to save an event after successful login
  const saveEventAfterLogin = async (eventId) => {
    try {
      console.log('Saving event after login:', eventId);
      const response = await api.post(`/users/saved-events/${eventId}`);
      
      if (response.data && response.data.success) {
        console.log('Event saved successfully after login');
        return true;
      } else {
        console.error('Failed to save event after login');
        return false;
      }
    } catch (err) {
      console.error('Error saving event after login:', err);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing alert
    setAlertMessage(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success) {
        setAlertSeverity('success');
        setAlertMessage('Login successful! Redirecting...');
        
        // If we have a pending event to save, save it now
        if (pendingEventToSave) {
          const saved = await saveEventAfterLogin(pendingEventToSave);
          if (saved) {
            setAlertMessage('Login successful! Your event has been saved.');
          }
        }
        
        // Get redirect path from the response or use stored path
        let targetRoute = response.redirectPath || redirectPath || '/discover';
        console.log('Redirecting to:', targetRoute);
        
        // Short delay for better UX, showing the success message
        setTimeout(() => {
          // Clear the stored path after successful login
          localStorage.removeItem('authRedirectPath');
          
          console.log('Navigating to:', targetRoute);
          navigate(targetRoute);
        }, 1500);
      } else {
        setAlertSeverity('error');
        setAlertMessage(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 2,
          border: `1px solid ${COLORS.ORANGE_LIGHT}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 4, 
              color: COLORS.ORANGE_MAIN,
              fontWeight: 700,
            }}
          >
            Log In
          </Typography>
          
          {alertMessage && !pendingEventToSave && (
            <Alert 
              severity={alertSeverity}
              sx={{ width: '100%', mb: 3 }}
              onClose={() => setAlertMessage(null)}
            >
              {alertMessage}
            </Alert>
          )}
          
          {pendingEventToSave && (
            <Alert 
              severity="info" 
              sx={{ width: '100%', mb: 3 }}
            >
              Sign in to add this event to your favorites! You're just one step away from saving events you love.
            </Alert>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{
              py: 1.5,
              mb: 3,
              backgroundColor: COLORS.ORANGE_MAIN,
              '&:hover': {
                backgroundColor: COLORS.ORANGE_DARK,
              },
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Link 
              component={RouterLink} 
              to="/forgot-password"
              sx={{
                color: COLORS.SLATE,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: COLORS.ORANGE_MAIN,
                },
                mb: { xs: 1, sm: 0 }
              }}
            >
              Forgot password?
            </Link>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: COLORS.SLATE, mr: 1 }}>
                Don't have an account?
              </Typography>
              <Link 
                component={RouterLink} 
                to="/register"
                sx={{
                  color: COLORS.ORANGE_MAIN,
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Sign Up
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 