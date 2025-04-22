const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  venue: { 
    type: String 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create indexes for efficient querying
ReviewSchema.index({ user: 1, event: 1 }, { unique: true }); // Prevent duplicate reviews
ReviewSchema.index({ event: 1 }); // For event-based queries
ReviewSchema.index({ organizer: 1 }); // For organizer-based queries
ReviewSchema.index({ venue: 1 }); // For venue-based queries
ReviewSchema.index({ rating: 1 }); // For rating-based queries

// Static method to get average rating for an event
ReviewSchema.statics.getEventRating = async function(eventId) {
  const result = await this.aggregate([
    { $match: { event: eventId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Static method to get average rating for an organizer
ReviewSchema.statics.getOrganizerRating = async function(organizerId) {
  const result = await this.aggregate([
    { $match: { organizer: organizerId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Static method to get average rating for a venue
ReviewSchema.statics.getVenueRating = async function(venue) {
  const result = await this.aggregate([
    { $match: { venue: venue } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Static method to get reviews with filtering options
ReviewSchema.statics.getFilteredReviews = async function({
  eventId,
  organizerId,
  venue,
  minRating,
  maxRating,
  page = 1,
  limit = 10
}) {
  const query = {};
  
  if (eventId) query.event = eventId;
  if (organizerId) query.organizer = organizerId;
  if (venue) query.venue = venue;
  if (minRating || maxRating) {
    query.rating = {};
    if (minRating) query.rating.$gte = minRating;
    if (maxRating) query.rating.$lte = maxRating;
  }

  const skip = (page - 1) * limit;
  
  const reviews = await this.find(query)
    .populate('user', 'name avatar')
    .populate('event', 'title')
    .populate('organizer', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    reviews,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

// Instance method to check if a user has already reviewed an event
ReviewSchema.methods.hasUserReviewed = async function(userId, eventId) {
  const existingReview = await this.constructor.findOne({ user: userId, event: eventId });
  return !!existingReview;
};

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review; 