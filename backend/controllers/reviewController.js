const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  
  // Check if event exists
  const event = await Event.findById(req.body.event);
  if (!event) {
    return next(new ErrorResponse(`No event found with id ${req.body.event}`, 404));
  }
  
  // Set organizer from event if not provided
  if (!req.body.organizer) {
    req.body.organizer = event.organizer;
  }
  
  // Set venue from event if not provided
  if (!req.body.venue) {
    req.body.venue = event.venue;
  }
  
  // Check if user already reviewed this event
  const existingReview = await Review.findOne({ 
    user: req.user.id, 
    event: req.body.event 
  });
  
  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this event', 400));
  }
  
  const review = await Review.create(req.body);
  
  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews by a specific user
// @route   GET /api/reviews?user=:userId
// @access  Public
exports.getUserReviews = asyncHandler(async (req, res, next) => {
  // Check if user parameter is provided
  if (!req.query.user) {
    return next(new ErrorResponse('Please provide a user ID', 400));
  }
  
  const userId = req.query.user;
  
  try {
    // Validate that the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with id ${userId}`
      });
    }
    
    // Get page and limit from query parameters or use defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Get reviews by user
    const reviews = await Review.find({ user: userId })
      .populate('event', 'title date image venue')
      .populate('organizer', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const count = await Review.countDocuments({ user: userId });
    
    // Calculate pagination
    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    };
    
    return res.status(200).json({
      success: true,
      count: reviews.length,
      totalReviews: count,
      data: reviews,
      pagination
    });
  } catch (err) {
    console.error('Error in getUserReviews:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews',
      error: err.message
    });
  }
});

// @desc    Get reviews for a specific event
// @route   GET /api/reviews/event/:id
// @access  Public
exports.getEventReviews = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  
  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`No event found with id ${eventId}`, 404));
  }
  
  // Get page and limit from query parameters or use defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const minRating = req.query.minRating ? parseInt(req.query.minRating, 10) : null;
  const maxRating = req.query.maxRating ? parseInt(req.query.maxRating, 10) : null;
  
  const result = await Review.getFilteredReviews({
    eventId,
    minRating,
    maxRating,
    page,
    limit
  });
  
  // Get average rating for the event
  const ratingStats = await Review.getEventRating(eventId);
  
  res.status(200).json({
    success: true,
    averageRating: ratingStats.averageRating,
    totalReviews: ratingStats.totalReviews,
    data: result.reviews,
    pagination: result.pagination
  });
});

// @desc    Get reviews for a specific organizer
// @route   GET /api/reviews/organizer/:id
// @access  Public
exports.getOrganizerReviews = asyncHandler(async (req, res, next) => {
  const organizerId = req.params.id;
  
  // Check if organizer exists
  const organizer = await User.findById(organizerId);
  if (!organizer) {
    return next(new ErrorResponse(`No organizer found with id ${organizerId}`, 404));
  }
  
  // Get page and limit from query parameters or use defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const minRating = req.query.minRating ? parseInt(req.query.minRating, 10) : null;
  const maxRating = req.query.maxRating ? parseInt(req.query.maxRating, 10) : null;
  
  const result = await Review.getFilteredReviews({
    organizerId,
    minRating,
    maxRating,
    page,
    limit
  });
  
  // Get average rating for the organizer
  const ratingStats = await Review.getOrganizerRating(organizerId);
  
  res.status(200).json({
    success: true,
    averageRating: ratingStats.averageRating,
    totalReviews: ratingStats.totalReviews,
    data: result.reviews,
    pagination: result.pagination
  });
});

// @desc    Get reviews for a specific venue
// @route   GET /api/reviews/venue/:venueName
// @access  Public
exports.getVenueReviews = asyncHandler(async (req, res, next) => {
  const venue = req.params.venueName;
  
  // Get page and limit from query parameters or use defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const minRating = req.query.minRating ? parseInt(req.query.minRating, 10) : null;
  const maxRating = req.query.maxRating ? parseInt(req.query.maxRating, 10) : null;
  
  const result = await Review.getFilteredReviews({
    venue,
    minRating,
    maxRating,
    page,
    limit
  });
  
  // Get average rating for the venue
  const ratingStats = await Review.getVenueRating(venue);
  
  res.status(200).json({
    success: true,
    averageRating: ratingStats.averageRating,
    totalReviews: ratingStats.totalReviews,
    data: result.reviews,
    pagination: result.pagination
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
  }
  
  // Check if user is review owner or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 401));
  }
  
  await review.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate('event', 'title')
    .populate('organizer', 'name');
  
  if (!review) {
    return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
  }
  
  // Check if user is review owner
  if (review.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this review', 401));
  }
  
  // Users can only update rating and comment
  const updateData = {
    rating: req.body.rating,
    comment: req.body.comment
  };
  
  review = await Review.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: review
  });
}); 