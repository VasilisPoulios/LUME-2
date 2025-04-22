const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// New admin credentials
const adminData = {
  name: 'Admin Account',
  email: 'admin123@lume.com',
  password: 'password123',
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
      console.log(`Admin user already exists: ${adminData.email}`);
      
      // Update password to known value
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);
      
      // Force update password
      adminExists.password = hashedPassword;
      await adminExists.save();
      
      console.log(`Password reset for: ${adminData.email}`);
      console.log(`New password: ${adminData.password}`);
      
      // Try to verify password manually
      console.log(`Testing password match: ${await adminExists.matchPassword(adminData.password)}`);
      
      process.exit(0);
    }
    
    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });
    
    console.log(`New admin created: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    
    // Try to verify password manually
    console.log(`Testing password match: ${await admin.matchPassword(adminData.password)}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
createAdmin(); 