import api from './index';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user profile' };
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to request password reset' };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

/**
 * Update user profile
 * @param {Object} userData - User profile data to update
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Current and new password
 * @returns {Promise<Object>} Response object with success status and data or error message
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

/**
 * Get utility function to set auth token in storage and headers
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Logout utility function
 */
export const logout = () => {
  setAuthToken(null);
  return { success: true };
};

export default {
  loginUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
}; 