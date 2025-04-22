import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  updateUserProfile, 
  changePassword,
  requestPasswordReset as requestReset,
  resetPassword as resetPwd
} from '../api/authService';
import API from '../api';
import axios from 'axios';

// Create context with default values
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  initialized: false,
  isAuthenticated: false,
  isOrganizer: false,
  isAdmin: false,
  register: () => Promise.resolve({ success: false }),
  login: () => Promise.resolve({ success: false }),
  logout: () => {},
  updateProfile: () => Promise.resolve({ success: false }),
  updatePassword: () => Promise.resolve({ success: false }),
  requestPasswordReset: () => Promise.resolve({ success: false }),
  resetPassword: () => Promise.resolve({ success: false }),
  getDashboardRoute: () => '/login'
});

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for stored token and user data
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user in state
      setUser(user);
      
      // Determine redirect based on user role
      let redirectPath = '/discover'; // Default for regular users
      if (user.role === 'admin') {
        redirectPath = '/admin';
      } else if (user.role === 'organizer') {
        redirectPath = '/organizer';
      }
      
      return { success: true, redirectPath };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user in state
      setUser(user);
      
      // Determine redirect based on user role (most registrations will be regular users)
      let redirectPath = '/discover'; // Default for regular users
      if (user.role === 'admin') {
        redirectPath = '/admin';
      } else if (user.role === 'organizer') {
        redirectPath = '/organizer';
      }
      
      return { success: true, redirectPath };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await updateUserProfile(userData);
      
      if (response.success) {
        // Update user in state and localStorage
        setUser({...user, ...response.user});
        localStorage.setItem('user', JSON.stringify({...user, ...response.user}));
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user password
  const updatePassword = async (passwordData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to update password');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Reset password request (forgot password)
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await requestReset(email);
      
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to request password reset');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to request password reset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await resetPwd(token, newPassword);
      
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Computed properties
  const isAuthenticated = !!user;
  const isOrganizer = user?.role === 'organizer';
  const isAdmin = user?.role === 'admin';
  
  // Helper function to get dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) {
      console.log('getDashboardRoute: No user found, returning /login');
      return '/login';
    }
    
    console.log('getDashboardRoute: User role is', user.role);
    
    switch (user.role) {
      case 'organizer':
        return '/organizer';
      case 'admin':
        return '/admin';
      case 'user':
        return '/discover';
      default:
        return '/discover';
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    isOrganizer,
    isAdmin,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    requestPasswordReset,
    resetPassword,
    getDashboardRoute
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 