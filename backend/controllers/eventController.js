const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const Ticket = require('../models/Ticket');

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizers and Admins)
exports.createEvent = asyncHandler(async (req, res) => {
  // Add organizer (user ID) to req.body
  req.body.organizer = req.user.id;
  
  // Handle image upload
  if (req.file) {
    req.body.image = `/uploads/events/${req.file.filename}`;
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
  let query;
  
  // Copy req.query
  const reqQuery = { ...req.query };
  
  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  // Finding resource
  query = Event.find(JSON.parse(queryStr)).populate('organizer', 'name email avatar');
  
  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-startDateTime');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments(JSON.parse(queryStr));
  
  query = query.skip(startIndex).limit(limit);
  
  // Executing query
  const events = await query;
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: events.length,
    pagination,
    data: events
  });
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

  res.status(200).json({
    success: true,
    data: event
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
    if (event.image && event.image !== 'default-event.jpg') {
      const oldImagePath = path.join(__dirname, '..', event.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Set new image path
    req.body.image = `/uploads/events/${req.file.filename}`;
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