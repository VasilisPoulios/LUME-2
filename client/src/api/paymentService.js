import api from './index';

/**
 * Create a payment intent for an event
 * @param {string} eventId - The ID of the event
 * @param {number} quantity - Number of tickets (default: 1)
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const createPaymentIntent = async (eventId, quantity = 1) => {
  try {
    console.log(`Creating payment intent for event: ${eventId}, quantity: ${quantity}`);
    const response = await api.post('/payments/create-intent', { eventId, quantity });
    
    console.log('Payment intent created successfully');
    console.log('Response data:', response.data);
    
    // Handle various response structures
    if (response.data) {
      if (response.data.clientSecret) {
        console.log('Found client secret directly in response data');
        console.log('Amount from server:', response.data.amount, 'Currency:', response.data.currency || 'eur');
        return { 
          success: true, 
          data: {
            clientSecret: response.data.clientSecret,
            amount: response.data.amount,
            currency: response.data.currency || 'eur',
            paymentIntentId: response.data.paymentIntentId
          }
        };
      } else if (response.data.data && response.data.data.clientSecret) {
        console.log('Found client secret in nested data property');
        console.log('Amount from server:', response.data.data.amount, 'Currency:', response.data.data.currency || 'eur');
        return {
          success: true,
          data: {
            clientSecret: response.data.data.clientSecret,
            amount: response.data.data.amount,
            currency: response.data.data.currency || 'eur',
            paymentIntentId: response.data.data.paymentIntentId
          }
        };
      } else {
        console.log('Payment intent created but missing client secret:', response.data);
        return { 
          success: response.data.success,
          data: response.data
        };
      }
    }
    
    return {
      success: false,
      message: 'Invalid response from server'
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to create payment intent'
    };
  }
};

/**
 * Confirm a payment with Stripe
 * @param {string} paymentIntentId - The Stripe payment intent ID
 * @param {string} eventId - The ID of the event
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const confirmPayment = async (paymentIntentId, eventId) => {
  try {
    console.log(`Confirming payment for intent: ${paymentIntentId}, event: ${eventId}`);
    const response = await api.post('/payments/confirm', { paymentIntentId, eventId });
    console.log('Payment confirmed successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to confirm payment'
    };
  }
};

/**
 * Get payment history for the current user
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getPaymentHistory = async () => {
  try {
    // This endpoint doesn't exist, use the tickets endpoint instead
    const response = await api.get('/tickets/user');
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch payment history'
    };
  }
};

/**
 * Get ticket details by code
 * @param {string} ticketCode - The ticket code
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getPaymentDetails = async (ticketCode) => {
  try {
    console.log(`Fetching ticket details for code: ${ticketCode}`);
    
    // Use the correct API endpoint
    const response = await api.get(`/tickets/details/${ticketCode}`);
    console.log('Ticket details response:', response.data);
    
    return { 
      success: true, 
      data: response.data.data || response.data 
    };
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Ticket not found' 
    };
  }
};

/**
 * Request a refund for a payment
 * @param {string} paymentId - The payment ID
 * @param {string} reason - Reason for the refund request
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const requestRefund = async (paymentId, reason) => {
  try {
    const response = await api.post(`/payments/${paymentId}/refund`, { reason });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error requesting refund:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to request refund'
    };
  }
};

/**
 * Get payment summary for an event (organizer only)
 * @param {string} eventId - The event ID
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getEventPaymentSummary = async (eventId) => {
  try {
    const response = await api.get(`/payments/event/${eventId}/summary`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching event payment summary:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch event payment summary'
    };
  }
}; 