const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
  getEventsByDate,
  getNearbyEvents,
  getPersonalizedEvents,
  getPastEvents
} = require('../controllers/eventController');

// Add RSVP controller import
const { createRSVP } = require('../controllers/rsvpController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Search events
router.get('/search', searchEvents);

// Events by date
router.get('/date/:date', getEventsByDate);

// Past events
router.get('/past', getPastEvents);

// Nearby events
router.get('/nearby', getNearbyEvents);

// Personalized events - requires authentication
router.get('/personalized', protect, getPersonalizedEvents);

// Standard event routes
router
  .route('/')
  .get(getEvents)
  .post(
    protect,
    authorize('organizer', 'admin'),
    upload.event.single('image'),
    upload.handleMulterError,
    createEvent
  );

router
  .route('/:id')
  .get(getEvent)
  .put(
    protect,
    authorize('organizer', 'admin'),
    upload.event.single('image'),
    upload.handleMulterError,
    updateEvent
  )
  .delete(
    protect,
    authorize('organizer', 'admin'),
    deleteEvent
  );

// RSVP route
router.post('/:id/rsvp', createRSVP);

module.exports = router; 