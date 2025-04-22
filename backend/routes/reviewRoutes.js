const express = require('express');
const {
  createReview,
  getReview,
  getEventReviews,
  getOrganizerReviews,
  getVenueReviews,
  getUserReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Create a review - requires authentication
router.post('/', protect, createReview);

// Get reviews for a specific event
router.get('/event/:id', getEventReviews);

// Get reviews for a specific organizer
router.get('/organizer/:id', getOrganizerReviews);

// Get reviews for a specific venue
router.get('/venue/:venueName', getVenueReviews);

// Get reviews by specific user (uses query parameter ?user=userId)
router.get('/', getUserReviews);

// Routes for individual reviews - these must come after the specific routes
// Get a single review
router.get('/:id', getReview);

// Update a review - requires authentication
router.put('/:id', protect, updateReview);

// Delete a review - requires authentication
router.delete('/:id', protect, deleteReview);

module.exports = router; 