import api from './index';

// Get all events with optional filters
export const getEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters that are provided
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.featured !== undefined) params.append('featured', filters.featured);
    if (filters.hot !== undefined) params.append('hot', filters.hot);
    if (filters.unmissable !== undefined) params.append('unmissable', filters.unmissable);
    
    const response = await api.get(`/events?${params.toString()}`);
    
    // Return the entire data object without modifications
    // This preserves the structure from the backend: { success, count, data }
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch events'
    };
  }
};

// Get single event by ID or slug
export const getEvent = async (idOrSlug) => {
  try {
    console.log(`Fetching event with ID/slug: ${idOrSlug}`);
    const response = await api.get(`/events/${idOrSlug}`);
    console.log('Event fetch response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch event'
    };
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating event:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to create event'
    };
  }
};

// Update an event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating event:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update event'
    };
  }
};

// Delete an event
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete event'
    };
  }
};

// Get events by organizer
export const getOrganizerEvents = async (organizerId) => {
  try {
    const response = await api.get(`/events/organizer/${organizerId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch organizer events'
    };
  }
};

// Get events a user is attending
export const getUserEvents = async () => {
  try {
    const response = await api.get('/events/user/attending');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching user events:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch user events'
    };
  }
};

// Get attendees for an event
export const getEventAttendees = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/attendees`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch event attendees'
    };
  }
};

// RSVP for a free event
export const createRSVP = async (eventId, rsvpData) => {
  try {
    console.log(`Creating RSVP for event ID: ${eventId}`, rsvpData);
    
    if (!eventId) {
      throw new Error("Event ID is required to create an RSVP");
    }
    
    const response = await api.post(`/events/${eventId}/rsvp`, rsvpData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("RSVP creation error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to create RSVP" 
    };
  }
};

// Search events
export const searchEvents = async (query) => {
  try {
    const response = await api.get(`/events/search?q=${encodeURIComponent(query)}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error searching events:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to search events'
    };
  }
};

// Get events by date
export const getEventsByDate = async (date) => {
  try {
    const response = await api.get(`/events/date/${date}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching events by date:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch events by date'
    };
  }
};

// Get events near a location
export const getNearbyEvents = async (lng, lat, radius = 10) => {
  try {
    const response = await api.get('/events/nearby', {
      params: { lng, lat, radius }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching nearby events:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch nearby events'
    };
  }
};

// Get personalized events (requires auth)
export const getPersonalizedEvents = async () => {
  try {
    const response = await api.get('/events/personalized');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching personalized events:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch personalized events'
    };
  }
};

// Get featured events for homepage featured section
export const getFeaturedEvents = async (limit = 8) => {
  try {
    const result = await getEvents({ featured: true, limit });
    console.log('Featured events result:', result);
    return result;
  } catch (error) {
    console.error('Error in getFeaturedEvents:', error);
    return { success: false, message: 'Failed to fetch featured events', data: { data: [] } };
  }
};

// Get hot events for "Hot Right Now" section
export const getHotEvents = async (limit = 4) => {
  try {
    const result = await getEvents({ hot: true, limit });
    console.log('Hot events result:', result);
    return result;
  } catch (error) {
    console.error('Error in getHotEvents:', error);
    return { success: false, message: 'Failed to fetch hot events', data: { data: [] } };
  }
};

// Get unmissable events for special promotions
export const getUnmissableEvents = async (limit = 20) => {
  try {
    const result = await getEvents({ unmissable: true, limit });
    console.log('Unmissable events result:', result);
    return result;
  } catch (error) {
    console.error('Error in getUnmissableEvents:', error);
    return { success: false, message: 'Failed to fetch unmissable events', data: { data: [] } };
  }
}; 