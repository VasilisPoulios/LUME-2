const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    markFeaturedEvents();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function markFeaturedEvents() {
  try {
    // Get all events
    const events = await Event.find().select('_id title');
    
    if (events.length === 0) {
      console.log('No events found in the database.');
      mongoose.disconnect();
      return;
    }
    
    console.log(`Found ${events.length} events.`);
    
    // Mark events by index to spread them out
    const totalEvents = events.length;
    
    // Mark 25% of events as featured
    const featuredCount = Math.ceil(totalEvents * 0.25);
    for (let i = 0; i < featuredCount; i++) {
      const index = i % totalEvents;
      await Event.findByIdAndUpdate(events[index]._id, { isFeatured: true });
      console.log(`Marked "${events[index].title}" as Featured`);
    }
    
    // Mark 15% of events as hot (different from featured)
    const hotCount = Math.ceil(totalEvents * 0.15);
    for (let i = 0; i < hotCount; i++) {
      const index = (i + featuredCount) % totalEvents;
      await Event.findByIdAndUpdate(events[index]._id, { isHot: true });
      console.log(`Marked "${events[index].title}" as Hot`);
    }
    
    // Mark 10% of events as unmissable (different from both)
    const unmissableCount = Math.ceil(totalEvents * 0.1);
    for (let i = 0; i < unmissableCount; i++) {
      const index = (i + featuredCount + hotCount) % totalEvents;
      await Event.findByIdAndUpdate(events[index]._id, { isUnmissable: true });
      console.log(`Marked "${events[index].title}" as Unmissable`);
    }
    
    console.log(`
    Successfully marked:
    - ${featuredCount} events as Featured
    - ${hotCount} events as Hot
    - ${unmissableCount} events as Unmissable
    `);
    
    mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 