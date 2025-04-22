const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    checkFeaturedEvents();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function checkFeaturedEvents() {
  try {
    const events = await Event.find({
      $or: [
        { isFeatured: true },
        { isHot: true },
        { isUnmissable: true }
      ]
    }).select('title isFeatured isHot isUnmissable');

    console.log('Featured, Hot, or Unmissable Events:');
    console.log(JSON.stringify(events, null, 2));
    
    // Just to check all events if no featured ones exist
    if (events.length === 0) {
      console.log('\nNo featured events found. Checking all events:');
      const allEvents = await Event.find().select('title isFeatured isHot isUnmissable').limit(5);
      console.log(JSON.stringify(allEvents, null, 2));
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 