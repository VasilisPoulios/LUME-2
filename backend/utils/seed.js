const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Event = require('../models/Event');
const Review = require('../models/Review');
const Ticket = require('../models/Ticket');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Categories and tags for events
const categories = [
  'Music', 'Visual Arts', 'Performing Arts', 'Film', 'Lectures', 
  'Fashion', 'Food', 'Sports', 'Technology', 'Health', 
  'Business', 'Lifestyle', 'Other'
];

const tags = [
  'outdoor', 'indoor', 'virtual', 'free', 'paid', 
  'family-friendly', '18+', 'educational', 'entertainment',
  'nightlife', 'daytime', 'weekend', 'weekday'
];

// Create sample user data
const createUsers = async () => {
  try {
    await User.deleteMany();
    console.log('Users deleted');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      interests: ['Technology', 'Business', 'Conference'],
      notifications: [
        {
          type: 'system',
          message: 'Welcome to LUME 2.0 Admin Panel',
          read: false,
          createdAt: new Date()
        },
        {
          type: 'system',
          message: 'New user registrations require approval',
          read: true,
          createdAt: new Date(Date.now() - 86400000)
        }
      ]
    });
    
    // Create organizer users
    const organizerPassword = await bcrypt.hash('organizer123', 10);
    const organizers = [];
    
    for (let i = 1; i <= 5; i++) {
      const organizer = await User.create({
        name: `Organizer ${i}`,
        email: `organizer${i}@example.com`,
        password: organizerPassword,
        role: 'organizer',
        interests: [
          categories[Math.floor(Math.random() * categories.length)],
          categories[Math.floor(Math.random() * categories.length)]
        ],
        location: {
          type: 'Point',
          coordinates: [
            -73.9857 + (Math.random() * 0.1 - 0.05), // NYC coordinates with some randomness
            40.7484 + (Math.random() * 0.1 - 0.05)
          ]
        },
        notifications: [
          {
            type: 'system',
            message: `Welcome to LUME 2.0, Organizer ${i}!`,
            read: i % 2 === 0, // Some read, some unread
            createdAt: new Date()
          },
          {
            type: 'event',
            message: 'Tips for creating successful events',
            read: false,
            createdAt: new Date(Date.now() - (i * 86400000 / 2))
          }
        ]
      });
      organizers.push(organizer);
    }
    
    // Create regular users
    const userPassword = await bcrypt.hash('user123', 10);
    const users = [];
    
    for (let i = 1; i <= 15; i++) {
      const notifications = [
        {
          type: 'system',
          message: `Welcome to LUME 2.0, User ${i}!`,
          read: i % 3 === 0, // Some read, some unread
          createdAt: new Date(Date.now() - (i * 86400000 / 15))
        }
      ];
      
      // Add some random notifications to some users
      if (i % 4 === 0) {
        notifications.push({
          type: 'event',
          message: 'New events matching your interests are available!',
          read: false,
          createdAt: new Date(Date.now() - (i * 3600000))
        });
      }
      
      if (i % 5 === 0) {
        notifications.push({
          type: 'review',
          message: 'Someone liked your review!',
          read: false,
          createdAt: new Date(Date.now() - (i * 7200000))
        });
      }
      
      const user = await User.create({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: userPassword,
        role: 'user',
        interests: [
          categories[Math.floor(Math.random() * categories.length)],
          categories[Math.floor(Math.random() * categories.length)],
          categories[Math.floor(Math.random() * categories.length)]
        ],
        location: {
          type: 'Point',
          coordinates: [
            -73.9857 + (Math.random() * 0.1 - 0.05), // NYC coordinates with some randomness
            40.7484 + (Math.random() * 0.1 - 0.05)
          ]
        },
        notifications
      });
      users.push(user);
    }

    console.log('Sample users created');
    return { admin, organizers, users };
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

// Create sample event data
const createEvents = async (organizers) => {
  try {
    await Event.deleteMany();
    console.log('Events deleted');
    
    const events = [];
    const cities = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { name: 'Boston', lat: 42.3601, lng: -71.0589 }
    ];
    
    const venues = [
      'Grand Hall', 'Tech Center', 'Community Space', 'Conference Center',
      'City Park', 'Riverside Arena', 'Downtown Theater', 'Innovation Hub',
      'Beach Resort', 'University Auditorium', 'Public Library', 'Art Gallery'
    ];
    
    // Create events for each organizer
    for (let i = 0; i < organizers.length; i++) {
      const organizer = organizers[i];
      const numEvents = Math.floor(Math.random() * 5) + 3; // 3-7 events per organizer
      
      for (let j = 0; j < numEvents; j++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const venue = venues[Math.floor(Math.random() * venues.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Generate 2-4 random tags
        const numTags = Math.floor(Math.random() * 3) + 2;
        const eventTags = [];
        for (let k = 0; k < numTags; k++) {
          const randomTag = tags[Math.floor(Math.random() * tags.length)];
          if (!eventTags.includes(randomTag)) {
            eventTags.push(randomTag);
          }
        }
        
        // Random date in next 3 months
        const now = new Date();
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + Math.floor(Math.random() * 90));
        
        // Event duration between 1-4 hours
        const startDateTime = new Date(futureDate);
        startDateTime.setHours(9 + Math.floor(Math.random() * 10)); // Events start between 9 AM and 7 PM
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1 + Math.floor(Math.random() * 4));
        
        // Create event with 30% chance of being free
        const isFree = Math.random() < 0.3;
        const price = isFree ? 0 : Math.floor(Math.random() * 100) * 100 + 500; // $5-$105 in cents
        
        const event = await Event.create({
          title: `${category} ${j + 1} by ${organizer.name}`,
          description: `This is a sample ${category} event organized by ${organizer.name}. Join us for an amazing experience and connect with like-minded people!`,
          category,
          tags: eventTags,
          price,
          venue: `${venue} in ${city.name}`,
          address: `123 Main St, ${city.name}`,
          startDateTime,
          endDateTime,
          organizer: organizer._id,
          image: '/uploads/events/default-event.jpg',
          ticketsAvailable: 20 + Math.floor(Math.random() * 80), // 20-100 tickets
          location: {
            type: 'Point',
            coordinates: [
              city.lng + (Math.random() * 0.02 - 0.01),
              city.lat + (Math.random() * 0.02 - 0.01)
            ]
          }
        });
        
        events.push(event);
      }
    }
    
    console.log(`${events.length} sample events created`);
    return events;
  } catch (error) {
    console.error('Error creating events:', error);
    process.exit(1);
  }
};

// Create sample review data
const createReviews = async (events, users) => {
  try {
    await Review.deleteMany();
    console.log('Reviews deleted');
    
    const reviews = [];
    
    // For each event, create 0-8 reviews
    for (let event of events) {
      const numReviews = Math.floor(Math.random() * 9); // 0-8 reviews per event
      const reviewers = [];
      
      for (let i = 0; i < numReviews; i++) {
        // Pick a random user who hasn't reviewed this event yet
        let user;
        do {
          user = users[Math.floor(Math.random() * users.length)];
        } while (reviewers.includes(user._id.toString()));
        
        reviewers.push(user._id.toString());
        
        // Random rating between 1-5
        const rating = Math.floor(Math.random() * 5) + 1;
        
        let comment;
        if (rating <= 2) {
          comment = "Didn't meet my expectations. There were some issues that could be improved.";
        } else if (rating === 3) {
          comment = "Decent event. Some aspects were great while others could use improvement.";
        } else {
          comment = "Fantastic event! Well organized and exceeded my expectations. Would attend again.";
        }
        
        const review = await Review.create({
          user: user._id,
          event: event._id,
          organizer: event.organizer,
          venue: event.venue,
          rating,
          comment,
          createdAt: new Date(event.startDateTime.getTime() + Math.random() * 86400000) // Random time within 24h after event
        });
        
        reviews.push(review);
      }
    }
    
    console.log(`${reviews.length} sample reviews created`);
    return reviews;
  } catch (error) {
    console.error('Error creating reviews:', error);
    process.exit(1);
  }
};

// Create sample ticket data
const createTickets = async (events, users) => {
  try {
    await Ticket.deleteMany();
    console.log('Tickets deleted');
    
    const tickets = [];
    
    // For each user, buy tickets for 0-5 random events
    for (let user of users) {
      const numEvents = Math.floor(Math.random() * 6); // 0-5 events per user
      const attendingEvents = [];
      
      for (let i = 0; i < numEvents; i++) {
        // Pick a random event the user hasn't bought tickets for yet
        let event;
        do {
          event = events[Math.floor(Math.random() * events.length)];
        } while (attendingEvents.includes(event._id.toString()));
        
        attendingEvents.push(event._id.toString());
        
        // Random number of tickets (1-3)
        const numTickets = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numTickets; j++) {
          // Create a unique ticket code
          const ticketCode = `TIX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          
          const ticket = await Ticket.create({
            event: event._id,
            user: user._id,
            ticketCode,
            status: 'active',
            purchaseDate: new Date(Date.now() - Math.random() * 604800000) // Random time within the last week
          });
          
          tickets.push(ticket);
          
          // Decrease available tickets for the event
          await Event.findByIdAndUpdate(event._id, {
            $inc: { ticketsAvailable: -1 }
          });
        }
      }
    }
    
    console.log(`${tickets.length} sample tickets created`);
    return tickets;
  } catch (error) {
    console.error('Error creating tickets:', error);
    process.exit(1);
  }
};

// Run the seeder
const seedDatabase = async () => {
  try {
    const { admin, organizers, users } = await createUsers();
    const events = await createEvents(organizers);
    const reviews = await createReviews(events, [...users, ...organizers]);
    const tickets = await createTickets(events, [...users, ...organizers]);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Check if we're running this file directly (not being imported)
if (require.main === module) {
  // If directly executed, run the seedDatabase function
  console.log('Seeding database...');
  seedDatabase();
}

module.exports = {
  seedDatabase,
  createUsers,
  createEvents,
  createReviews,
  createTickets
}; 