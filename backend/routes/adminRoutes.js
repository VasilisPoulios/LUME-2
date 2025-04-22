const express = require('express');
const {
  getAllUsers,
  deleteUser,
  deleteEvent,
  getReports,
  getOrganizers,
  getAllEvents,
  updateEventFlags
} = require('../controllers/adminController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply admin authorization to all routes
router.use(protect, authorize('admin'));

// User management routes
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .delete(deleteUser);

// Organizer management routes
router.route('/organizers')
  .get(getOrganizers);

// Event management routes
router.route('/events')
  .get(getAllEvents);

router.route('/events/:id')
  .delete(deleteEvent)
  .patch(updateEventFlags);

// Reports route (placeholder for future implementation)
router.route('/reports')
  .get(getReports);

module.exports = router; 