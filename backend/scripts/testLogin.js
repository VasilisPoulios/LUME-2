const axios = require('axios');
require('dotenv').config();

// Test admin login
const adminCredentials = {
  email: 'admin123@lume.com',
  password: 'password123'
};

const testLogin = async () => {
  try {
    console.log('Testing login with credentials:', {
      email: adminCredentials.email,
      password: adminCredentials.password
    });
    
    // Get API URL from environment or use default
    const baseURL = process.env.API_BASE_URL || 'http://localhost:5000/api';
    
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
    
    console.log('\nUse these credentials in the login form:');
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: ${adminCredentials.password}`);
    
  } catch (error) {
    console.error('Login failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    
    console.error('\nPossible issues:');
    console.error('1. Backend server not running');
    console.error('2. Incorrect API URL');
    console.error('3. Incorrect credentials');
    console.error('4. Authentication middleware issues');
  }
};

// Run the test
testLogin(); 