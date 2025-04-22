const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const Ticket = require('../models/Ticket');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizers and Admins)
exports.createEvent = asyncHandler(async (req, res) => {
  // Add organizer (user ID) to req.body
  req.body.organizer = req.user.id;
  
  // Handle image upload
  if (req.file) {
    // Format the image path for database storage
    const imagePath = `/uploads/events/${path.basename(req.file.path)}`;
    req.body.image = imagePath;
    console.log('Image uploaded:', imagePath);
  } else {
    // Set default image if none provided
    req.body.image = '/uploads/events/default-event.jpg';
  }

  // Create event
  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res) => {
  // Log the request to debug
  console.log('GET /api/events request received', req.query);
  
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sort = req.query.sort || '-startDateTime';
    
    // Build query object
    const queryObj = {};
    
    // Filter by category
    if (req.query.category) {
      queryObj.category = req.query.category;
    }
    
    // Filter by date range
    if (req.query.startDate) {
      queryObj.startDateTime = { ...queryObj.startDateTime, $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      queryObj.endDateTime = { ...queryObj.endDateTime, $lte: new Date(req.query.endDate) };
    }
    
    // Filter by search term across multiple fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
        { address: searchRegex }
      ];
    }
    
    // Featured events filter (typically curated by admins)
    if (req.query.featured !== undefined) {
      queryObj.isFeatured = req.query.featured === 'true';
    }
    
    // Hot events filter (recent popular events)
    if (req.query.hot !== undefined) {
      queryObj.isHot = req.query.hot === 'true';
    }
    
    // Unmissable events filter (special promotions)
    if (req.query.unmissable !== undefined) {
      queryObj.isUnmissable = req.query.unmissable === 'true';
    }
    
    console.log('Query object:', queryObj);
    
    // Execute query with filters
    const events = await Event.find(queryObj)
      .populate('organizer', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalEvents = await Event.countDocuments(queryObj);
    
    console.log(`Found ${events.length} events out of ${totalEvents} total`);
    
    res.status(200).json({
      success: true,
      count: events.length,
      totalPages: Math.ceil(totalEvents / limit),
      currentPage: page,
      data: events
    });
  } catch (error) {
    console.error('Error in getEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email avatar');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Get average rating and total reviews
  const ratingStats = await Review.getEventRating(req.params.id);
  
  // Get 3 most recent reviews
  const recentReviews = await Review.find({ event: req.params.id })
    .populate('user', 'name avatar')
    .populate('organizer', 'name')
    .sort({ createdAt: -1 })
    .limit(3);

  res.status(200).json({
    success: true,
    data: {
      ...event.toObject(),
      averageRating: ratingStats.averageRating,
      reviewCount: ratingStats.totalReviews,
      recentReviews
    }
  });
});

// @desc    Search events by text
// @route   GET /api/events/search
// @access  Public
exports.searchEvents = asyncHandler(async (req, res) => {
  if (!req.query.q) {
    res.status(400);
    throw new Error('Please provide a search query');
  }

  const searchTerm = req.query.q;
  let events = [];

  try {
    // First attempt: Try the text index search for exact matches
    events = await Event.find(
      { $text: { $search: searchTerm } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('organizer', 'name email avatar');
    
    // If text search didn't yield results, try regex for partial matches
    if (events.length === 0) {
      const regexSearch = new RegExp(searchTerm, 'i'); // case-insensitive
      events = await Event.find({
        $or: [
          { title: regexSearch },
          { description: regexSearch },
          { venue: regexSearch },
          { address: regexSearch },
          { tags: regexSearch }
        ]
      }).populate('organizer', 'name email avatar');
    }
  } catch (error) {
    // In case of any issues with text search, fall back to regex search
    const regexSearch = new RegExp(searchTerm, 'i'); // case-insensitive
    events = await Event.find({
      $or: [
        { title: regexSearch },
        { description: regexSearch },
        { venue: regexSearch },
        { address: regexSearch },
        { tags: regexSearch }
      ]
    }).populate('organizer', 'name email avatar');
  }

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get events by date
// @route   GET /api/events/date/:date
// @access  Public
exports.getEventsByDate = asyncHandler(async (req, res) => {
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(req.params.date)) {
    res.status(400);
    throw new Error('Please provide a valid date in YYYY-MM-DD format');
  }

  // Create start and end date for the given day
  const selectedDate = new Date(req.params.date);
  const nextDay = new Date(req.params.date);
  nextDay.setDate(nextDay.getDate() + 1);

  const events = await Event.find({
    $or: [
      // Events that start on the selected date
      {
        startDateTime: {
          $gte: selectedDate,
          $lt: nextDay
        }
      },
      // Events that are ongoing on the selected date
      {
        $and: [
          { startDateTime: { $lt: nextDay } },
          { endDateTime: { $gt: selectedDate } }
        ]
      }
    ]
  }).populate('organizer', 'name email avatar');

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get events near a location
// @route   GET /api/events/nearby
// @access  Public
exports.getNearbyEvents = asyncHandler(async (req, res) => {
  const { lng, lat, radius = 10 } = req.query;

  // Check if coordinates are provided
  if (!lng || !lat) {
    res.status(400);
    throw new Error('Please provide longitude and latitude coordinates');
  }

  // Convert radius to kilometers and then to radians (divide by Earth's radius)
  const radiusInRadians = parseFloat(radius) / 6378.1;

  const events = await Event.find({
    location: {
      $geoWithin: {
        $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
      }
    }
  }).populate('organizer', 'name email avatar');

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizers and Admins)
exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Make sure user is the event organizer or an admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this event');
  }

  // Handle image upload
  if (req.file) {
    // Delete old image if it exists and is not the default
    if (event.image && !event.image.includes('default-event')) {
      try {
        const oldImagePath = path.join(__dirname, '..', event.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Deleted old image:', oldImagePath);
        }
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }
    
    // Format the image path for database storage
    const imagePath = `/uploads/events/${path.basename(req.file.path)}`;
    req.body.image = imagePath;
    console.log('New image uploaded:', imagePath);
  }

  // Update event
  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizers and Admins)
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Make sure user is the event organizer or an admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this event');
  }

  // Delete image if it's not the default
  if (event.image && event.image !== 'default-event.jpg') {
    const imagePath = path.join(__dirname, '..', event.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create RSVP for a free event
// @route   POST /api/events/:eventId/rsvp
// @access  Private
exports.createRSVP = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if event is free
  if (event.price > 0) {
    res.status(400);
    throw new Error('This event requires payment. Please use the purchase ticket endpoint.');
  }

  // Check if user has already RSVP'd
  const existingTicket = await Ticket.findOne({
    user: req.user.id,
    event: req.params.eventId
  });

  if (existingTicket) {
    res.status(400);
    throw new Error('You have already RSVP\'d for this event');
  }

  // Check if tickets are available
  if (event.ticketsAvailable <= 0) {
    res.status(400);
    throw new Error('No tickets available for this event');
  }

  // Create ticket with unique code
  const ticket = await Ticket.create({
    user: req.user.id,
    event: req.params.eventId,
    status: 'active'
  });

  // Decrement available tickets
  event.ticketsAvailable -= 1;
  await event.save();

  res.status(201).json({
    success: true,
    data: ticket
  });
});

// @desc    Get personalized events for user
// @route   GET /api/events/personalized
// @access  Private
exports.getPersonalizedEvents = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if user has interests
  if (!user.interests || user.interests.length === 0) {
    res.status(200).json({
      success: true,
      message: 'No interests specified. Add interests to get personalized recommendations.',
      data: []
    });
    return;
  }
  
  let query = {
    $or: [
      // Match events with tags that match user interests
      { tags: { $in: user.interests } },
      // Match events with category that match user interests
      { category: { $in: user.interests } }
    ]
  };
  
  // Add location-based filtering if user has location
  let sortOptions = { startDateTime: 1 }; // Default sort by date
  
  if (user.location && user.location.coordinates && user.location.coordinates.length === 2) {
    // If user has location, add the distance field for sorting
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .lean(); // Use lean for better performance
    
    // Calculate distance for each event
    events.forEach(event => {
      if (event.location && event.location.coordinates) {
        // Calculate distance using the Haversine formula
        const userLat = user.location.coordinates[1];
        const userLng = user.location.coordinates[0];
        const eventLat = event.location.coordinates[1];
        const eventLng = event.location.coordinates[0];
        
        // Haversine formula
        const R = 6371; // Radius of the Earth in km
        const dLat = (eventLat - userLat) * Math.PI / 180;
        const dLon = (eventLng - userLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userLat * Math.PI / 180) * Math.cos(eventLat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        
        event.distance = distance;
      } else {
        event.distance = Infinity; // Events without location are placed last
      }
    });
    
    // Sort by distance and then by date
    events.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return new Date(a.startDateTime) - new Date(b.startDateTime);
    });
    
    // Limit to 20 events for performance
    const paginatedEvents = events.slice(0, 20);
    
    res.status(200).json({
      success: true,
      count: paginatedEvents.length,
      data: paginatedEvents
    });
  } else {
    // If user doesn't have location, just return matches sorted by date
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .sort({ startDateTime: 1 })
      .limit(20);
      
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  }
});

// @desc    Get past events
// @route   GET /api/events/past
// @access  Public
exports.getPastEvents = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  
  const events = await Event.find({
    endDateTime: { $lt: currentDate }
  })
  .populate('organizer', 'name email avatar')
  .sort({ endDateTime: -1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
}); 