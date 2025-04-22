const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Admin credentials
const adminEmail = 'admin@lume.com';
const adminPassword = 'Admin123!';

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

// Reset admin password
const resetAdminPassword = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log(`No admin user found with email: ${adminEmail}`);
      
      // Create new admin if not found
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const newAdmin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log(`New admin user created with email: ${adminEmail}`);
      console.log(`Password set to: ${adminPassword}`);
      
      process.exit(0);
    }
    
    // Update admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    admin.password = hashedPassword;
    await admin.save();
    
    console.log(`Admin password reset successfully for: ${adminEmail}`);
    console.log(`New password: ${adminPassword}`);
    
    // Verify login
    const verifyLogin = await admin.matchPassword(adminPassword);
    console.log(`Password verification: ${verifyLogin ? 'Success' : 'Failed'}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error resetting admin password: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
resetAdminPassword(); 