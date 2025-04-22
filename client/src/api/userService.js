import api from './index';

/**
 * Get current user profile
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch user profile'
    };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - User profile data to update
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update user profile'
    };
  }
};

/**
 * Update user password
 * @param {Object} passwordData - Object containing currentPassword and newPassword
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const updateUserPassword = async (passwordData) => {
  try {
    const response = await api.put('/users/password', passwordData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating password:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update password'
    };
  }
};

/**
 * Upload user avatar
 * @param {FormData} formData - Form data containing avatar image
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const uploadAvatar = async (formData) => {
  try {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to upload avatar'
    };
  }
};

/**
 * Get user dashboard data
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getUserDashboard = async () => {
  try {
    const response = await api.get('/users/dashboard');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch user dashboard data'
    };
  }
};

/**
 * Get organizer dashboard data
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getOrganizerDashboard = async () => {
  try {
    const response = await api.get('/users/organizer/dashboard');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching organizer dashboard:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch organizer dashboard data'
    };
  }
};

/**
 * Get user notifications
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getUserNotifications = async () => {
  try {
    const response = await api.get('/users/notifications');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch user notifications'
    };
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/users/notifications/${notificationId}/read`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to mark notification as read'
    };
  }
};

/**
 * Delete user account
 * @param {Object} data - Object containing password for confirmation
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const deleteUserAccount = async (data) => {
  try {
    const response = await api.delete('/users/account', { data });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete account'
    };
  }
}; 