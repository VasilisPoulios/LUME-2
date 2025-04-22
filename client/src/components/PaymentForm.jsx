import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../api/paymentService';
import { useAuth } from '../context/AuthContext';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const PaymentForm = ({ event, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!event?.id || !isAuthenticated) return;

    const getPaymentIntent = async () => {
      try {
        setLoading(true);
        const result = await createPaymentIntent(event.id);
        if (result.success && result.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          setError('Could not initialize payment. Please try again.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
        console.error('Payment intent error:', err);
      } finally {
        setLoading(false);
      }
    };

    getPaymentIntent();
  }, [event?.id, isAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    if (!clientSecret) {
      setError('Payment not initialized properly. Please refresh and try again.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name || '',
            email: user?.email || '',
          },
        },
      });

      if (payload.error) {
        setError(`Payment failed: ${payload.error.message}`);
        setProcessing(false);
        return;
      }

      // Payment succeeded
      if (payload.paymentIntent && payload.paymentIntent.status === 'succeeded') {
        const confirmationResult = await confirmPayment(
          payload.paymentIntent.id,
          event.id
        );

        if (confirmationResult.success) {
          setSucceeded(true);
          setProcessing(false);
          
          // Call onSuccess callback if provided
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(confirmationResult.data);
          } else {
            navigate('/tickets');
          }
        } else {
          throw new Error('Failed to confirm payment on server');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An error occurred while processing your payment. Please try again.');
      setProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="payment-form-container">
        <p>Please log in to purchase tickets for this event.</p>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <h3>Payment Details</h3>
      <p>Total: ${event?.price ? (event.price / 100).toFixed(2) : '0.00'}</p>
      
      {error && (
        <div className="payment-error">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label>Card Details</label>
          <div className="card-element-container">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={processing || loading || !clientSecret || !stripe || succeeded}
          className="payment-button"
        >
          {processing ? 'Processing...' : 
           succeeded ? 'Payment Successful' : 
           `Pay $${event?.price ? (event.price / 100).toFixed(2) : '0.00'}`}
        </button>
      </form>
      
      {succeeded && (
        <div className="payment-success">
          <p>Payment successful! Your ticket has been issued.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm; 