import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' // Default role
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  
  const { register, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  // Check for redirect path on component mount
  useEffect(() => {
    const savedPath = localStorage.getItem('authRedirectPath');
    if (savedPath) {
      setRedirectPath(savedPath);
    }
  }, []);

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
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await register(formData);
      
      if (response.success) {
        setAlertSeverity('success');
        setAlertMessage('Registration successful! Redirecting...');
        
        // Get redirect path from the response
        const targetRoute = response.redirectPath || '/discover';
        console.log('Redirecting to:', targetRoute);
        
        // Short delay for better UX, showing the success message
        setTimeout(() => {
          // Clear the stored path after successful registration
          localStorage.removeItem('authRedirectPath');
          
          console.log('Navigating to:', targetRoute);
          navigate(targetRoute);
        }, 1000);
      } else {
        setAlertSeverity('error');
        setAlertMessage(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage(error.message || 'An error occurred during registration. Please try again.');
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
            Create Account
          </Typography>
          
          {alertMessage && (
            <Alert 
              severity={alertSeverity}
              sx={{ width: '100%', mb: 3 }}
              onClose={() => setAlertMessage(null)}
            >
              {alertMessage}
            </Alert>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
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
          
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ color: COLORS.SLATE }}>Sign up as</FormLabel>
            <RadioGroup
              row
              name="role"
              value={formData.role}
              onChange={handleChange}
              sx={{ justifyContent: 'space-around', mt: 1 }}
            >
              <FormControlLabel 
                value="user" 
                control={<Radio sx={{ 
                  color: COLORS.ORANGE_LIGHT,
                  '&.Mui-checked': { color: COLORS.ORANGE_MAIN } 
                }} />} 
                label="User" 
              />
              <FormControlLabel 
                value="organizer" 
                control={<Radio sx={{ 
                  color: COLORS.ORANGE_LIGHT,
                  '&.Mui-checked': { color: COLORS.ORANGE_MAIN } 
                }} />} 
                label="Organizer" 
              />
            </RadioGroup>
          </FormControl>
          
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
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: COLORS.SLATE, mr: 1 }}>
              Already have an account?
            </Typography>
            <Link 
              component={RouterLink} 
              to="/login"
              sx={{
                color: COLORS.ORANGE_MAIN,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 