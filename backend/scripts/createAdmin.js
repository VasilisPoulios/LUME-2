const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Admin credentials
const adminData = {
  name: 'Admin User',
  email: 'admin@lume.com',
  password: 'Lume@dmin2024',
  role: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error(`Error connecting to MongoDB: ${err.message}`);
  process.exit(1);
});

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminData.email });
    
    if (adminExists) {
      console.log('Admin user already exists');
      console.log(`Email: ${adminData.email}`);
      console.log(`Password: ${adminData.password}`);
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Create admin user
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });
    
    console.log('Admin user created successfully');
    console.log('----------------------------');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('----------------------------');
    
    console.log('You can now log in with these credentials');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
createAdmin(); 