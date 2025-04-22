const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications
} = require('../controllers/notificationController');

const router = express.Router();

// Import middleware
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getNotifications)
  .delete(clearNotifications);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id')
  .put(markAsRead);

module.exports = router; 