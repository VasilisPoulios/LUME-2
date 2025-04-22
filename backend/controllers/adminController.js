const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Event = require('../models/Event');
const Review = require('../models/Review');
const fs = require('fs');
const path = require('path');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments();
  
  // Build query
  const query = User.find().select('-password').sort({ createdAt: -1 }).skip(startIndex).limit(limit);
  
  // Execute query
  const users = await query;
  
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
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Get all organizers
// @route   GET /api/admin/organizers
// @access  Private/Admin
exports.getOrganizers = asyncHandler(async (req, res, next) => {
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments({ role: 'organizer' });
  
  // Build query for organizers
  const query = User.find({ role: 'organizer' }).select('-password').sort({ createdAt: -1 }).skip(startIndex).limit(limit);
  
  // Execute query
  const organizers = await query;
  
  // Enhance organizers with event counts
  const organizersWithCounts = await Promise.all(
    organizers.map(async (organizer) => {
      const eventCount = await Event.countDocuments({ organizer: organizer._id });
      return {
        ...organizer.toObject(),
        eventCount
      };
    })
  );
  
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
    count: organizers.length,
    pagination,
    data: organizersWithCounts
  });
});

// @desc    Get all events
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAllEvents = asyncHandler(async (req, res, next) => {
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Filter by organizer if provided
  const filter = {};
  if (req.query.organizer) {
    filter.organizer = req.query.organizer;
  }
  
  const total = await Event.countDocuments(filter);
  
  // Build query for events
  const query = Event.find(filter)
    .populate('organizer', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Execute query
  const events = await query;
  
  // Calculate tickets sold for each event and ensure all required fields exist
  const eventsWithStats = events.map(event => {
    // Convert to object and ensure all fields exist
    const eventObj = event.toObject();
    
    // Ensure the flag fields exist (for older events that might not have them)
    eventObj.isFeatured = eventObj.isFeatured || false;
    eventObj.isHot = eventObj.isHot || false; 
    eventObj.isUnmissable = eventObj.isUnmissable || false;
    eventObj.isPublished = eventObj.isPublished !== false; // Default to true
    
    // Ensure price is a number
    eventObj.price = typeof eventObj.price === 'number' ? eventObj.price : 0;
    
    // Set ticketsSold to 0 as default if we can't calculate it
    eventObj.ticketsSold = 0;
    
    return eventObj;
  });
  
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
    data: eventsWithStats
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }
  
  // Delete avatar if it exists and is not the default
  if (user.avatar && !user.avatar.includes('default-avatar')) {
    try {
      const avatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
        console.log('Deleted avatar:', avatarPath);
      }
    } catch (err) {
      console.error('Error deleting avatar:', err);
    }
  }
  
  // Also delete user's reviews
  await Review.deleteMany({ user: user._id });
  
  // Delete user's events (if they are an organizer)
  if (user.role === 'organizer') {
    const events = await Event.find({ organizer: user._id });
    
    // Delete event images
    for (let event of events) {
      if (event.image && !event.image.includes('default-event')) {
        try {
          const imagePath = path.join(__dirname, '..', event.image.replace(/^\//, ''));
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('Deleted event image:', imagePath);
          }
        } catch (err) {
          console.error('Error deleting event image:', err);
        }
      }
    }
    
    await Event.deleteMany({ organizer: user._id });
  }
  
  await user.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete any event (admin override)
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return next(new ErrorResponse(`Event not found with id ${req.params.id}`, 404));
  }
  
  // Delete event image if it exists and is not the default
  if (event.image && !event.image.includes('default-event')) {
    try {
      const imagePath = path.join(__dirname, '..', event.image.replace(/^\//, ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted event image:', imagePath);
      }
    } catch (err) {
      console.error('Error deleting event image:', err);
    }
  }
  
  // Delete all reviews for this event
  await Review.deleteMany({ event: event._id });
  
  await event.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update event flags (featured, hot, unmissable)
// @route   PATCH /api/admin/events/:id
// @access  Private/Admin
exports.updateEventFlags = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);
  
  if (!event) {
    return next(new ErrorResponse(`Event not found with id ${req.params.id}`, 404));
  }
  
  // Only allow specific flag fields to be updated
  const allowedFields = ['isFeatured', 'isHot', 'isUnmissable', 'isPublished'];
  const updateData = {};
  
  // Filter out only allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });
  
  // Make sure there are fields to update
  if (Object.keys(updateData).length === 0) {
    return next(new ErrorResponse('No valid fields to update', 400));
  }
  
  // Update event flags
  event = await Event.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Get reports (placeholder for future implementation)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res, next) => {
  // This is a placeholder for future implementation
  // In the future, this could fetch flagged content, user reports, etc.
  
  res.status(200).json({
    success: true,
    message: 'Reports feature coming soon',
    data: []
  });
}); 