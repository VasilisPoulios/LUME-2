import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  CircularProgress,
  Divider,
  Alert,
  Stack,
  Stepper,
  Step,
  StepLabel,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  CreditCard as CreditCardIcon,
  Event as EventIcon,
  CheckCircleOutline as CheckCircleIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getEvent } from '../api/eventService';
import { createPaymentIntent, confirmPayment } from '../api/paymentService';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { COLORS } from '../styles';
import { formatImageUrl, formatPrice, formatCurrency } from '../utils/helpers';

// Load Stripe outside of component to avoid recreating Stripe on each render
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log('Stripe Publishable Key:', stripeKey?.substring(0, 8) + '...');
console.log('Stripe.js version:', '@stripe/react-stripe-js', '@stripe/stripe-js');

// Check if the key looks valid
if (!stripeKey || !stripeKey.startsWith('pk_')) {
  console.error('Invalid Stripe publishable key format. Should start with pk_');
}

const stripePromise = loadStripe(stripeKey);
console.log('Stripe instance initialized');

// Use this to log when the promise resolves
stripePromise.then(stripe => {
  console.log('Stripe initialized successfully:', !!stripe);
}).catch(err => {
  console.error('Stripe initialization error:', err);
});

// Card element options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true
};

// Steps for checkout process
const steps = ['Event Details', 'Payment Information', 'Confirmation'];

// Checkout form component
const CheckoutForm = ({ eventId, event, quantity = 1, onSuccess, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      setError('Please wait while we connect to our payment provider...');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      
      console.log('Processing payment...');
      
      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name || 'Unknown',
            email: user?.email || 'unknown@example.com',
          },
        },
      });
      
      // Handle payment errors
      if (result.error) {
        console.error('Payment confirmation error:', result.error);
        setError(result.error.message || 'Failed to process your payment');
        return;
      }
      
      // Handle successful payment
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('Payment successful! Payment intent ID:', result.paymentIntent.id);
        
        // Notify our backend to create tickets
        const confirmation = await confirmPayment(result.paymentIntent.id, eventId);
        
        if (confirmation.success && confirmation.data) {
          onSuccess(confirmation.data);
        } else {
          setError(confirmation.message || 'Payment was processed but ticket creation failed');
        }
      } else {
        console.warn('Payment not succeeded:', result.paymentIntent?.status);
        setError(`Payment failed with status: ${result.paymentIntent?.status || 'unknown'}`);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('An error occurred during payment processing. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!stripe) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <CardElement options={cardElementOptions} />
        </Paper>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Payment Summary
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2">Event:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" align="right">{event?.title}</Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2">Quantity:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" align="right">{quantity} ticket{quantity !== 1 ? 's' : ''}</Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2">Price per ticket:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" align="right">{formatCurrency(event?.price || 0)}</Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" fontWeight="bold">Total:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" fontWeight="bold" align="right">
              {formatCurrency((event?.price || 0) * quantity)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing || !elements}
        sx={{ 
          py: 1.5,
          bgcolor: COLORS.ORANGE_MAIN,
          '&:hover': {
            bgcolor: COLORS.ORANGE_DARK,
          }
        }}
      >
        {processing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Pay ${formatCurrency((event?.price || 0) * quantity)}`
        )}
      </Button>
    </form>
  );
};

// Main checkout page component
const CheckoutPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [successData, setSuccessData] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Get quantity from location state if available
  useEffect(() => {
    if (location.state?.quantity) {
      setQuantity(location.state.quantity);
    }
  }, [location.state]);
  
  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        console.log('Fetching event data for ID:', eventId);
        const response = await getEvent(eventId);
        console.log('Event data response:', response);
        
        if (response.success && response.data) {
          // Handle different response structures
          const eventData = response.data.data || response.data;
          console.log('Processed event data:', eventData);
          
          // Debug: Check the price structure
          console.log('Event price type:', typeof eventData.price);
          console.log('Event price value:', eventData.price);
          console.log('Event price formatted:', formatPrice(eventData.price));
          console.log('Price in cents for Stripe:', Math.round((eventData.price || 0) * 100));
          
          setEvent(eventData);
          
          // Check if event is free
          if (eventData.price === 0 || eventData.isFree) {
            setError('This event is free and does not require payment');
            // Could redirect to direct registration endpoint
          }
        } else {
          setError(response.message || 'Failed to load event');
        }
      } catch (err) {
        console.error('Load event error:', err);
        setError('An error occurred while loading event details');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/checkout/${eventId}`, quantity } });
    }
  }, [isAuthenticated, navigate, eventId, quantity]);
  
  // Create a payment intent before showing the payment form
  const createIntent = async () => {
    try {
      setPaymentLoading(true);
      console.log('Creating payment intent for event:', eventId, 'quantity:', quantity);
      
      const response = await createPaymentIntent(eventId, quantity);
      console.log('Payment intent creation response:', response);
      
      if (response.success && response.data?.clientSecret) {
        const secret = response.data.clientSecret;
        
        // Validate the client secret format
        if (!secret || secret.length < 20 || !secret.includes('_secret_')) {
          console.error('Invalid client secret format:', 
            secret ? (secret.length > 10 ? `${secret.substring(0, 10)}...` : 'too short') : 'missing');
          setError('Payment setup failed: Invalid client secret format');
          return false;
        }
        
        setClientSecret(secret);
        console.log('Payment intent created successfully, client secret obtained');
        console.log('Client secret length:', secret.length);
        return true;
      } else {
        console.error('Failed to get client secret from response:', response);
        setError(response.message || 'Failed to initialize payment. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
      return false;
    } finally {
      setPaymentLoading(false);
    }
  };
  
  // Handle continue to payment
  const handleContinue = async () => {
    const success = await createIntent();
    if (success) {
      setStep(1);
    }
  };
  
  // Handle successful payment
  const handlePaymentSuccess = (data) => {
    console.log('Payment successful, data received:', data);
    setSuccessData(data);
    setStep(2); // Go to confirmation step
  };
  
  // Handle back button
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate(`/events/${eventId}`);
    }
  };
  
  // Handle view ticket after successful payment
  const handleViewTicket = () => {
    if (successData?.tickets?.length > 0) {
      // If we have multiple tickets, go to tickets list
      if (successData.tickets.length > 1) {
        navigate('/tickets');
      } else {
        // If just one ticket, go directly to it
        navigate(`/tickets/${successData.tickets[0]._id}`);
      }
    } else if (successData?.ticketIds?.length > 0) {
      // Handle case where we just have IDs
      if (successData.ticketIds.length > 1) {
        navigate('/tickets');
      } else {
        navigate(`/tickets/${successData.ticketIds[0]}`);
      }
    } else if (successData?.ticket?._id) {
      // Legacy format support
      navigate(`/tickets/${successData.ticket._id}`);
    } else {
      // Fallback to tickets list
      navigate('/tickets');
    }
  };
  
  // Handle navigation to user dashboard
  const handleViewAllTickets = () => {
    // Navigate to user dashboard with the tickets tab focused
    navigate('/dashboard', { state: { activeTab: 'tickets' } });
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/events/${eventId}`)}
          >
            Go Back to Event
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Render if event not found
  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Event Not Found
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Go Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <IconButton onClick={handleBack} disabled={step === 2}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {step === 2 ? 'Payment Confirmed' : 'Checkout'}
          </Typography>
        </Stack>
        
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {step === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Event Details
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box
                  component="img"
                  src={event && event.image ? formatImageUrl(event.image) : '/placeholder-event.jpg'}
                  alt={event?.title || 'Event'}
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    height: 140,
                    objectFit: 'cover',
                    mb: { xs: 2, sm: 0 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <Typography variant="h6">{event?.title || 'Event'}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event?.date ? dayjs(event.date).format('MMM D, YYYY') : ''} 
                  {event?.time ? ` at ${event.time}` : ''}
                </Typography>
                <Typography variant="body2" paragraph>
                  {event?.venue || 'Venue TBD'}, {event?.address || event?.location?.address || 'Address TBD'}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: COLORS.ORANGE_DARK }}>
                  €{formatPrice(event?.price)} per ticket
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quantity
              </Typography>
              <TextField
                select
                fullWidth
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                SelectProps={{
                  native: true,
                }}
                variant="outlined"
                disabled={!event?.ticketsAvailable || event?.ticketsAvailable < 1}
              >
                {Array.from({ length: Math.min(10, event?.ticketsAvailable || 0) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </TextField>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {quantity} x Ticket{quantity > 1 ? 's' : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    €{formatPrice(event?.price * quantity)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" align="right" sx={{ color: COLORS.ORANGE_DARK, fontWeight: 'bold' }}>
                    €{formatPrice(event?.price * quantity)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleContinue}
              startIcon={paymentLoading ? null : <CreditCardIcon />}
              disabled={!event?.ticketsAvailable || (event?.ticketsAvailable < quantity) || paymentLoading}
              sx={{
                bgcolor: COLORS.ORANGE_MAIN,
                '&:hover': { bgcolor: COLORS.ORANGE_DARK },
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(255, 129, 0, 0.15)',
              }}
            >
              {paymentLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Continue to Payment'
              )}
            </Button>
            
            {(!event?.ticketsAvailable || (event?.ticketsAvailable < quantity)) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {!event?.ticketsAvailable 
                  ? 'Tickets are sold out for this event'
                  : `Only ${event?.ticketsAvailable} tickets available`}
              </Alert>
            )}
          </Box>
        )}
        
        {step === 1 && clientSecret && (
          <Box>
            <Typography variant="h6" gutterBottom mb={3}>
              Complete Your Payment
            </Typography>
            
            <Elements 
              stripe={stripePromise} 
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: COLORS.ORANGE_MAIN,
                  }
                },
              }}
            >
              <CheckoutForm 
                eventId={eventId} 
                event={event} 
                quantity={quantity} 
                onSuccess={handlePaymentSuccess}
                clientSecret={clientSecret}
              />
            </Elements>
          </Box>
        )}
        
        {step === 1 && !clientSecret && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        
        {step === 2 && successData && (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: 'success.main' }}>
                Payment Successful!
              </Typography>
              <Typography variant="body1">
                Your ticket{quantity > 1 ? 's have' : ' has'} been confirmed for {event?.title || 'the event'}.
              </Typography>
            </Box>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                py: 3, 
                px: 4, 
                mb: 4,
                borderRadius: 2,
                borderColor: 'success.light'
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order #{successData?.payment?.paymentIntentId?.substring(3, 11) || 'Confirmed'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('MMM D, YYYY h:mm A')}
                </Typography>
              </Box>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {quantity} x Ticket{quantity > 1 ? 's' : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    €{formatPrice(event?.price * quantity)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total Paid</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" align="right" sx={{ color: COLORS.ORANGE_DARK, fontWeight: 'bold' }}>
                    €{formatPrice(event?.price * quantity)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {successData?.tickets && successData.tickets.length > 0 && (
              <Box sx={{ mb: 4, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Your Tickets
                </Typography>
                <Paper variant="outlined" sx={{ p: 0, borderRadius: 2 }}>
                  {successData.tickets.map((ticket, index) => (
                    <Box 
                      key={ticket._id} 
                      sx={{ 
                        p: 2, 
                        borderBottom: index < successData.tickets.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          Ticket #{index + 1} - {ticket.ticketCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {ticket.status === 'active' ? 'Valid' : ticket.status}
                        </Typography>
                      </Box>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/tickets/${ticket._id}`)}
                      >
                        View Ticket
                      </Button>
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined"
                onClick={() => navigate(`/events/${eventId}`)}
                startIcon={<EventIcon />}
              >
                Back to Event
              </Button>
              <Button 
                variant="contained"
                color="primary"
                onClick={handleViewTicket}
                startIcon={<CheckCircleIcon />}
                sx={{
                  bgcolor: COLORS.ORANGE_MAIN,
                  '&:hover': { bgcolor: COLORS.ORANGE_DARK }
                }}
              >
                {successData.tickets?.length > 1 ? 'View All Tickets' : 'View Ticket'}
              </Button>
              <Button 
                variant="outlined"
                color="secondary"
                onClick={handleViewAllTickets}
                startIcon={<DashboardIcon />}
              >
                My Dashboard
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CheckoutPage; 