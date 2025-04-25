import API from './index';

/**
 * Get all RSVPs for the organizer's events
 * @returns {Promise} - API response
 */
export const getOrganizerRSVPs = async () => {
  try {
    const response = await API.get('/rsvps');
    return {
      success: true,
      data: response.data.data,
      count: response.data.count,
      totalGuests: response.data.totalGuests
    };
  } catch (error) {
    console.error('Error getting organizer RSVPs:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch RSVPs',
      error
    };
  }
};

/**
 * Get RSVPs for a specific event
 * @param {string} eventId - The ID of the event
 * @returns {Promise} - API response
 */
export const getRSVPsByEvent = async (eventId) => {
  try {
    const response = await API.get(`/events/${eventId}/rsvps`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.count,
      totalGuests: response.data.totalGuests
    };
  } catch (error) {
    console.error(`Error getting RSVPs for event ${eventId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch RSVPs for this event',
      error
    };
  }
};

/**
 * Create an RSVP for an event
 * @param {string} eventId - The ID of the event
 * @param {Object} rsvpData - The RSVP data (name, email, phone, quantity)
 * @returns {Promise} - API response
 */
export const createRSVP = async (eventId, rsvpData) => {
  try {
    console.log(`Creating RSVP for event with ID: ${eventId}`);
    console.log(`Event ID type: ${typeof eventId}`);
    console.log(`RSVP data:`, rsvpData);
    
    const endpoint = `/events/${eventId}/rsvp`;
    console.log(`API endpoint: ${endpoint}`);
    
    const response = await API.post(endpoint, rsvpData);
    console.log(`RSVP creation successful:`, response.data);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`Error creating RSVP for event ${eventId}:`, error);
    console.error(`Error response:`, error.response?.data);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create RSVP',
      error
    };
  }
};

/**
 * Get RSVPs for the current user
 * @returns {Promise} - API response
 */
export const getUserRSVPs = async () => {
  try {
    const response = await API.get('/rsvps/user');
    return {
      success: true,
      data: response.data.data,
      count: response.data.count,
      totalGuests: response.data.totalGuests
    };
  } catch (error) {
    console.error('Error getting user RSVPs:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch your RSVPs',
      error
    };
  }
};

/**
 * Update check-in status for an RSVP
 * @param {string} rsvpId - The ID of the RSVP to update
 * @param {number} checkedInGuests - Number of guests checked in
 * @returns {Promise} - API response
 */
export const checkInRSVP = async (rsvpId, checkedInGuests) => {
  try {
    const response = await API.patch(`/rsvps/${rsvpId}/check-in`, { checkedInGuests });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error(`Error checking in RSVP ${rsvpId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check in RSVP',
      error
    };
  }
}; 