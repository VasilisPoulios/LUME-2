const axios = require('axios');
require('dotenv').config();

// Test admin login
const adminCredentials = {
  email: 'admin@test.com',
  password: 'password'
};

const debugLogin = async () => {
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
    console.log('Status code:', response.status);
    console.log('Full response data:', JSON.stringify(response.data, null, 2));
    
    // Check response structure
    if (response.data && response.data.user) {
      console.log('User object structure:');
      for (const key in response.data.user) {
        console.log(`- ${key}: ${typeof response.data.user[key]} (${response.data.user[key]})`);
      }
    } else {
      console.log('Response does not contain user object with expected structure!');
    }
    
    // Check token
    if (response.data && response.data.token) {
      console.log('Token received:', response.data.token.substring(0, 20) + '...');
    } else {
      console.log('No token in response!');
    }
    
  } catch (error) {
    console.error('Login failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Check stack trace for more info
      if (error.response.data && error.response.data.stack) {
        console.error('Error stack trace:', error.response.data.stack);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received - server may not be running');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
  }
};

// Run the debug function
debugLogin(); 