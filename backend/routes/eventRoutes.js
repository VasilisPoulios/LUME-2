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
  createRSVP
} = require('../controllers/eventController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Search events
router.get('/search', searchEvents);

// Events by date
router.get('/date/:date', getEventsByDate);

// Nearby events
router.get('/nearby', getNearbyEvents);

// Standard event routes
router
  .route('/')
  .get(getEvents)
  .post(
    protect,
    authorize('organizer', 'admin'),
    upload.event.single('image'),
    createEvent
  );

router
  .route('/:id')
  .get(getEvent)
  .put(
    protect,
    authorize('organizer', 'admin'),
    upload.event.single('image'),
    updateEvent
  )
  .delete(
    protect,
    authorize('organizer', 'admin'),
    deleteEvent
  );

// RSVP route
router.post('/:eventId/rsvp', protect, createRSVP);

module.exports = router; 