import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Paper,
  Stack,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  IconButton,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Euro as EuroIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { COLORS } from '../styles';
import { UI_CATEGORIES, getFrontendToBackendCategory } from '../utils/categoryConfig';

// Get frontend-friendly categories with proper mapping to backend
const categories = UI_CATEGORIES
  .filter(cat => cat.id !== 'All') // Filter out the "All" category
  .map(cat => ({
    id: cat.id,
    title: cat.title,
    backendCategory: cat.backendCategory
  }));

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format time to HH:MM
const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to combine date and time strings into a Date object
const combineDateAndTime = (dateString, timeString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

// Steps for the form
const steps = ['Event Details', 'Date & Location', 'Tickets & Image'];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const eventId = params.id; // Get event ID from URL params if editing
  const isEditMode = !!eventId; // Check if we're in edit mode
  const { isAuthenticated, isOrganizer, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    address: '',
    startDate: formatDate(new Date()),
    startTime: formatTime(new Date()),
    isPaid: false,
    price: 0,
    ticketsAvailable: 100,
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Validate form step by step
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.title.trim()) errors.title = 'Title is required';
      if (!formData.description.trim()) errors.description = 'Description is required';
      if (!formData.category) errors.category = 'Category is required';
    } else if (step === 1) {
      if (!formData.venue.trim()) errors.venue = 'Venue is required';
      if (!formData.address.trim()) errors.address = 'Address is required';
      if (!formData.startDate) errors.startDate = 'Start date is required';
      if (!formData.startTime) errors.startTime = 'Start time is required';
    } else if (step === 2) {
      if (formData.isPaid && (formData.price <= 0)) {
        errors.price = 'Price must be greater than 0 for paid events';
      }
      
      if (formData.ticketsAvailable <= 0) {
        errors.ticketsAvailable = 'Number of tickets must be greater than 0';
      }
      
      if (!imageFile) {
        errors.image = 'Event image is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.venue.trim()) errors.venue = 'Venue is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    
    if (formData.isPaid && (formData.price <= 0)) {
      errors.price = 'Price must be greater than 0 for paid events';
    }
    
    if (formData.ticketsAvailable <= 0) {
      errors.ticketsAvailable = 'Number of tickets must be greater than 0';
    }
    
    // Only require image for new events, not for edits
    if (!isEditMode && !imageFile && !imagePreview) {
      errors.image = 'Event image is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFormErrors(prev => ({ ...prev, image: 'Image size should not exceed 5MB' }));
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous image error
      if (formErrors.image) {
        setFormErrors(prev => ({ ...prev, image: null }));
      }
    }
  };

  // Handle step transitions
  const handleStepTransition = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else if (validateStep(activeStep)) {
      handleNext();
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      // Show error message
      showSnackbar('Please correct the errors before submitting', 'error');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for multipart/form-data submission (for image upload)
      const formDataObj = new FormData();
      
      // Calculate start and end dates by combining date and time
      const startDateTime = combineDateAndTime(formData.startDate, formData.startTime);
      
      // Set end date/time to 2 hours after start if not provided
      let endDateTime;
      if (formData.endDate && formData.endTime) {
        endDateTime = combineDateAndTime(formData.endDate, formData.endTime);
      } else {
        endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000)); // +2 hours
      }
      
      // Convert the frontend category to its backend equivalent
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const backendCategory = selectedCategory ? selectedCategory.backendCategory : formData.category;
      
      // Add form fields to formData
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', backendCategory);
      formDataObj.append('venue', formData.venue);
      formDataObj.append('address', formData.address);
      formDataObj.append('startDateTime', startDateTime.toISOString());
      formDataObj.append('endDateTime', endDateTime.toISOString());
      formDataObj.append('price', formData.isPaid ? Math.round(formData.price * 100) : 0); // Convert to cents
      formDataObj.append('ticketsAvailable', formData.ticketsAvailable);
      
      // Add image if available (only if a new image was selected)
      if (imageFile) {
        formDataObj.append('image', imageFile);
        console.log('Uploading image:', { 
          name: imageFile.name, 
          type: imageFile.type, 
          size: imageFile.size 
        });
      }
      
      let response;
      
      if (isEditMode) {
        // Update existing event
        response = await API.put(`/events/${eventId}`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Show success message
        showSnackbar('Event updated successfully!');
        console.log('Event updated successfully:', response.data);
        
        // Redirect to event page
        const updatedEventId = response.data.data?._id || eventId;
        navigate(`/events/${updatedEventId}`);
      } else {
        // Create new event
        response = await API.post('/events', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Show success message
        showSnackbar('Event created successfully!');
        console.log('Event created successfully:', response.data);
        
        // Redirect to event page
        navigate(`/events/${response.data.data._id}`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      showSnackbar(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch event data if in edit mode
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        setFetchLoading(true);
        const response = await API.get(`/events/${eventId}`);
        
        if (response.data && (response.data.data || response.data)) {
          const eventData = response.data.data || response.data;
          
          // Check if current user is the organizer of this event
          const eventOrganizerId = eventData.organizer?._id || eventData.organizer;
          if (eventOrganizerId !== user?._id) {
            const errorMsg = 'You do not have permission to edit this event';
            setError(errorMsg);
            showSnackbar(errorMsg, 'error');
            setTimeout(() => navigate('/organizer'), 2000);
            return;
          }
          
          // Format date and time from startDateTime
          let startDate = formatDate(new Date());
          let startTime = formatTime(new Date());
          
          if (eventData.startDateTime) {
            const startDateObj = new Date(eventData.startDateTime);
            startDate = formatDate(startDateObj);
            startTime = formatTime(startDateObj);
          }
          
          // Map backend category to frontend category ID
          let categoryId = eventData.category || '';
          // Try to find the matching frontend category
          const matchingCategory = categories.find(cat => 
            cat.backendCategory === eventData.category || cat.id === eventData.category
          );
          if (matchingCategory) {
            categoryId = matchingCategory.id;
          }
          
          // Populate form data
          setFormData({
            title: eventData.title || '',
            description: eventData.description || '',
            category: categoryId,
            venue: eventData.venue || '',
            address: eventData.address || '',
            startDate,
            startTime,
            isPaid: eventData.price > 0,
            price: eventData.price ? eventData.price / 100 : 0, // Convert cents to dollars/euros
            ticketsAvailable: eventData.ticketsAvailable || 100,
          });
          
          // Set image preview if available
          if (eventData.image) {
            setImagePreview(eventData.image.startsWith('http') 
              ? eventData.image 
              : `/uploads/${eventData.image}`);
          }
        } else {
          const errorMsg = 'Failed to load event data';
          setError(errorMsg);
          showSnackbar(errorMsg, 'error');
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        const errorMsg = 'Failed to load event data';
        setError(errorMsg);
        showSnackbar(errorMsg, 'error');
      } finally {
        setFetchLoading(false);
      }
    };
    
    if (isEditMode && isAuthenticated && isOrganizer) {
      fetchEventData();
    }
  }, [eventId, isEditMode, isAuthenticated, isOrganizer, user?._id, navigate]);

  // Check permissions
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: isEditMode ? `/edit-event/${eventId}` : '/create-event' } });
      return;
    }

    if (!isOrganizer) {
      navigate('/dashboard');
      return;
    }
    
    // Get organizer ID from location state if available (from dashboard)
    if (location.state?.organizerId) {
      console.log('Organizer ID from location state:', location.state.organizerId);
    }
  }, [isAuthenticated, isOrganizer, navigate, location.state, isEditMode, eventId]);

  if (!isAuthenticated || !isOrganizer) {
    return null; // Don't render anything while redirecting
  }

  // Use skeletons when loading event data
  if (fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}`, bgcolor: '#fafafa' }}>
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={250} height={60} />
            </Stack>
          </Box>
          
          <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 4 }} />
          
          <Stack spacing={3}>
            <Skeleton variant="rectangular" width="100%" height={60} />
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Skeleton variant="rectangular" width="100%" height={60} />
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Render different form sections based on active step
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.title}
                helperText={formErrors.title || `${formData.title.length}/30 characters`}
                autoFocus
                inputProps={{ maxLength: 30 }}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Event Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.description}
                helperText={formErrors.description || `${formData.description.length}/200 characters`}
                multiline
                rows={4}
                inputProps={{ maxLength: 200 }}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="500" color="text.primary">
                  Category <Box component="span" color="error.main">*</Box>
                </Typography>
              </Box>
              <TextField
                select
                required
                fullWidth
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.category}
                helperText={formErrors.category}
                placeholder="Select a category"
                variant="outlined"
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiSelect-select': {
                    py: 1.5,
                    fontSize: '1rem'
                  }
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return <Typography color="text.secondary">Select a category</Typography>;
                    }
                    const selectedCategory = categories.find(cat => cat.id === selected);
                    return selectedCategory ? selectedCategory.title : selected;
                  },
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  },
                }}
              >
                <MenuItem disabled value="">
                  <em>Select a category</em>
                </MenuItem>
                {categories.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="venue"
                label="Venue Name"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.venue}
                helperText={formErrors.venue}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="address"
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.address}
                helperText={formErrors.address}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="startDate"
                label="Event Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                InputLabelProps={{ shrink: true }}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="startTime"
                label="Event Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.startTime}
                helperText={formErrors.startTime}
                InputLabelProps={{ shrink: true }}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Ticket Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isPaid}
                          onChange={handleChange}
                          name="isPaid"
                          color="primary"
                          disabled={loading}
                        />
                      }
                      label={<Typography fontWeight="500">Paid Event</Typography>}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="price"
                      label="Ticket Price"
                      name="price"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      }}
                      value={formData.price}
                      onChange={handleChange}
                      disabled={loading || !formData.isPaid}
                      error={!!formErrors.price}
                      helperText={formErrors.price}
                      inputProps={{
                        min: 0,
                        step: 0.01
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="ticketsAvailable"
                      label="Number of Tickets Available"
                      name="ticketsAvailable"
                      type="number"
                      value={formData.ticketsAvailable}
                      onChange={handleChange}
                      disabled={loading}
                      error={!!formErrors.ticketsAvailable}
                      helperText={formErrors.ticketsAvailable}
                      inputProps={{
                        min: 1
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                Event Image <Typography variant="caption" color="error" sx={{ ml: 1 }}>(Required)</Typography>
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                border: '2px dashed', 
                borderColor: imageFile ? 'success.main' : (formErrors.image ? 'error.main' : 'divider'),
                bgcolor: 'background.default',
                textAlign: 'center'
              }}>
                {imagePreview ? (
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Event preview"
                      sx={{ 
                        maxHeight: 200,
                        width: 'auto',
                        margin: '0 auto',
                        borderRadius: 1
                      }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        color={imageFile ? 'success' : 'primary'}
                        sx={{ mt: 1 }}
                        disabled={loading}
                      >
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleImageUpload}
                        />
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ py: 4 }}>
                    <CloudUploadIcon color={formErrors.image ? 'error' : 'action'} sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      Drag and drop an image here, or
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      color={formErrors.image ? 'error' : 'primary'}
                      sx={{ 
                        mt: 1,
                        bgcolor: formErrors.image ? undefined : COLORS.ORANGE_MAIN,
                        '&:hover': {
                          bgcolor: formErrors.image ? undefined : COLORS.ORANGE_DARK,
                        }
                      }}
                      disabled={loading}
                    >
                      Select Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Maximum file size: 5MB
                    </Typography>
                  </Box>
                )}
                
                {formErrors.image && (
                  <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {formErrors.image}
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

  // Render form content (different for edit mode vs create mode)
  const renderFormContent = () => {
    // For edit mode, render all fields at once
    if (isEditMode) {
      return (
        <Grid container spacing={3}>
          {/* Event Details Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: COLORS.SLATE }}>
              Event Details
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="title"
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.title}
              helperText={formErrors.title || `${formData.title.length}/30 characters`}
              autoFocus
              inputProps={{ maxLength: 30 }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="description"
              label="Event Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.description}
              helperText={formErrors.description || `${formData.description.length}/200 characters`}
              multiline
              rows={4}
              inputProps={{ maxLength: 200 }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="500" color="text.primary">
                Category <Box component="span" color="error.main">*</Box>
              </Typography>
            </Box>
            <TextField
              select
              required
              fullWidth
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.category}
              helperText={formErrors.category}
              placeholder="Select a category"
              variant="outlined"
              sx={{ 
                backgroundColor: 'white',
                '& .MuiSelect-select': {
                  py: 1.5,
                  fontSize: '1rem'
                }
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select a category</Typography>;
                  }
                  const selectedCategory = categories.find(cat => cat.id === selected);
                  return selectedCategory ? selectedCategory.title : selected;
                },
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                },
              }}
            >
              <MenuItem disabled value="">
                <em>Select a category</em>
              </MenuItem>
              {categories.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {/* Date & Location Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: COLORS.SLATE }}>
              Date & Location
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="venue"
              label="Venue Name"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.venue}
              helperText={formErrors.venue}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="address"
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.address}
              helperText={formErrors.address}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="startDate"
              label="Event Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.startDate}
              helperText={formErrors.startDate}
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="startTime"
              label="Event Time"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.startTime}
              helperText={formErrors.startTime}
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          {/* Tickets & Image Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: COLORS.SLATE }}>
              Tickets & Image
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPaid}
                  onChange={handleChange}
                  name="isPaid"
                  color="primary"
                  disabled={loading}
                />
              }
              label={<Typography fontWeight="500">Paid Event</Typography>}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="price"
              label="Ticket Price"
              name="price"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
              value={formData.price}
              onChange={handleChange}
              disabled={loading || !formData.isPaid}
              error={!!formErrors.price}
              helperText={formErrors.price}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="ticketsAvailable"
              label="Number of Tickets Available"
              name="ticketsAvailable"
              type="number"
              value={formData.ticketsAvailable}
              onChange={handleChange}
              disabled={loading}
              error={!!formErrors.ticketsAvailable}
              helperText={formErrors.ticketsAvailable}
              inputProps={{ min: 1 }}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Card elevation={0} sx={{ 
              mt: 2, 
              p: 3, 
              border: '1px dashed',
              borderColor: formErrors.image ? 'error.main' : 'divider',
              borderRadius: 2
            }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Event Image {!isEditMode && <Box component="span" color="error.main">*</Box>}
              </Typography>
              
              {imagePreview ? (
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={imagePreview}
                    alt="Event image preview"
                    sx={{ 
                      objectFit: 'cover', 
                      borderRadius: 1,
                      mb: 2
                    }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.6)',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.8)',
                      }
                    }}
                  >
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 3,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  borderRadius: 1
                }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      bgcolor: COLORS.ORANGE_MAIN,
                      '&:hover': {
                        bgcolor: COLORS.ORANGE_DARK,
                      }
                    }}
                  >
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Maximum file size: 5MB
                  </Typography>
                </Box>
              )}
              
              {formErrors.image && (
                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {formErrors.image}
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      );
    }
    
    // For create mode, use stepper approach
    return renderStepContent(activeStep);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, border: `1px solid ${COLORS.GRAY_LIGHT}`, bgcolor: '#fafafa' }}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton 
              onClick={() => navigate(-1)} 
              aria-label="go back"
              sx={{ 
                bgcolor: 'rgba(0,0,0,0.05)', 
                '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } 
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ fontWeight: 700, color: COLORS.SLATE }}
            >
              {isEditMode ? 'Edit Event' : 'Create a New Event'}
            </Typography>
          </Stack>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setSuccess(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            Event {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
          </Alert>
        )}

        {!isEditMode && (
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 4,
              p: 2,
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <Box component="form" noValidate>
          {renderFormContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {isEditMode ? (
              // Edit mode - Cancel and Update buttons
              <>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  sx={{
                    px: 3,
                    py: 1
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                  sx={{ 
                    bgcolor: COLORS.ORANGE_MAIN,
                    '&:hover': {
                      bgcolor: COLORS.ORANGE_DARK,
                    },
                    px: 3,
                    py: 1
                  }}
                >
                  {loading ? 'Updating...' : 'Update Event'}
                </Button>
              </>
            ) : (
              // Create mode - Back and Next/Create buttons
              <>
                <Button
                  variant="outlined"
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                  sx={{
                    px: 3,
                    py: 1
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStepTransition}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (activeStep === steps.length - 1 ? <CheckIcon /> : null)}
                  sx={{ 
                    bgcolor: COLORS.ORANGE_MAIN,
                    '&:hover': {
                      bgcolor: COLORS.ORANGE_DARK,
                    },
                    px: 3,
                    py: 1
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Create Event' : 'Next'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleSnackbarClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateEventPage; 