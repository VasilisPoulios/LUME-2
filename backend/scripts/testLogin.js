const axios = require('axios');
require('dotenv').config();

// Admin credentials with the reset password
const adminCredentials = {
  email: 'admin@test.com',
  password: 'password'
};

const testLogin = async () => {
  try {
    console.log('Testing login with credentials:', {
      email: adminCredentials.email,
      password: 'Password provided (not showing for security)'
    });
    
    // Get API URL from environment or use default
    const baseURL = process.env.API_BASE_URL || 'http://localhost:4010/api';
    
    console.log(`Making request to: ${baseURL}/auth/login`);
    
    // Make login request
    const response = await axios.post(`${baseURL}/auth/login`, adminCredentials);
    
    console.log('Login successful!');
    console.log('Response:', {
      status: response.status,
      success: response.data.success,
      token: response.data.token ? '(token received)' : '(no token)',
      user: response.data.user ? {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role
      } : '(no user data)'
    });
    
  } catch (error) {
    console.error('Login failed!');
    console.error('Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
  }
};

// Run the test
console.log('Starting login test...');
testLogin(); 