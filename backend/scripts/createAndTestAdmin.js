const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Simple admin credentials
const adminData = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'password',
  role: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error(`Error connecting to MongoDB: ${err.message}`);
  process.exit(1);
});

// Create and test admin user
const createAndTestAdmin = async () => {
  try {
    console.log('Checking if admin user exists...');

    // Find or create admin user
    let admin = await User.findOne({ email: adminData.email });
    
    if (admin) {
      console.log(`Admin user exists: ${adminData.email}`);
      
      // Update password directly in the database
      admin.password = adminData.password;
      
      // Pre-save hook will hash the password
      await admin.save();
      
      console.log(`Password updated for existing admin`);
    } else {
      console.log('Creating new admin user...');
      
      // Create new admin user - password will be hashed by pre-save hook
      admin = new User({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: adminData.role
      });
      
      await admin.save();
      console.log(`New admin user created: ${adminData.email}`);
    }
    
    // Test login with raw credentials
    console.log('\nAdministrator account is ready!');
    console.log('-------------------------------');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('-------------------------------');
    console.log('Please try these credentials in the login form.');
    
    // Clean up and exit
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Error creating/testing admin: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the function
createAndTestAdmin(); 