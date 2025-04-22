import api from './index';

/**
 * Fetch all users with pagination
 * @param {Object} params - Pagination parameters
 * @returns {Promise} - Promise with response data
 */
export const getAllUsers = async (params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch users'
    };
  }
};

/**
 * Delete a user
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise} - Promise with response data
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete user'
    };
  }
};

/**
 * Fetch all organizers with pagination
 * @param {Object} params - Pagination parameters
 * @returns {Promise} - Promise with response data
 */
export const getOrganizers = async (params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/admin/organizers?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching organizers:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch organizers'
    };
  }
};

/**
 * Fetch all events with pagination
 * @param {Object} params - Pagination parameters
 * @returns {Promise} - Promise with response data
 */
export const getAllEvents = async (params = {}) => {
  try {
    const { page = 1, limit = 10, organizer } = params;
    
    // Build URL search params
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    
    // Add organizer filter if provided
    if (organizer) {
      searchParams.append('organizer', organizer);
    }
    
    console.log(`Making request to /admin/events with params: ${searchParams.toString()}`);
    const response = await api.get(`/admin/events?${searchParams.toString()}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch events'
    };
  }
};

/**
 * Delete an event
 * @param {string} eventId - The ID of the event to delete
 * @returns {Promise} - Promise with response data
 */
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/admin/events/${eventId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete event'
    };
  }
};

/**
 * Update event flags (featured, hot, unmissable)
 * @param {string} eventId - The ID of the event to update
 * @param {Object} flags - The flags to update
 * @returns {Promise} - Promise with response data
 */
export const updateEventFlags = async (eventId, flags) => {
  try {
    const response = await api.patch(`/admin/events/${eventId}`, flags);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating event flags:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update event flags'
    };
  }
};

/**
 * Toggle a specific flag for an event (featured, hot, unmissable)
 * @param {string} eventId - The ID of the event to update
 * @param {string} flag - The flag to toggle ('isFeatured', 'isHot', or 'isUnmissable')
 * @param {boolean} value - The new value for the flag
 * @returns {Promise} - Promise with response data
 */
export const toggleEventFlag = async (eventId, flag, value) => {
  try {
    const flagData = { [flag]: value };
    const response = await api.patch(`/admin/events/${eventId}`, flagData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error toggling ${flag} flag:`, error);
    return { 
      success: false, 
      message: error.response?.data?.message || `Failed to update ${flag} status`
    };
  }
};

export default {
  getAllUsers,
  deleteUser,
  getOrganizers,
  getAllEvents,
  deleteEvent,
  updateEventFlags,
  toggleEventFlag
}; 