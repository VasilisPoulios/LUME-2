import axios from 'axios';

// In development, use just /api as the base URL to leverage Vite's proxy
// In production, use the full URL from environment variables
const API_URL = import.meta.env.MODE === 'development' 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

console.log('API URL configured as:', API_URL);

// Create an axios instance with default config
const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authorization token
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only handle actual 401 Unauthorized errors (token expired/invalid)
    if (error.response && error.response.status === 401) {
      console.warn('Received 401 Unauthorized, clearing credentials');
      // Clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You can add redirection to login here if using React Router
      // window.location.href = '/login';
    } else if (error.response && error.response.status === 404) {
      // Log 404 errors but don't clear auth - the endpoint might just not be implemented yet
      console.warn(`API endpoint not found: ${error.config.url}`);
    } else if (!error.response) {
      // Network error - don't clear auth, the server might be down
      console.error('Network error, unable to reach API server');
    }
    return Promise.reject(error);
  }
);

export default API; 