const express = require('express');
const {
  updateProfile,
  uploadAvatar,
  getUserById,
  updateInterests,
  getSavedEvents,
  saveEvent,
  deleteSavedEvent
} = require('../controllers/userController');

const router = express.Router();

// Import middleware
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// User profile routes
router.put(
  '/profile',
  protect,
  upload.avatar.single('avatar'),
  upload.handleMulterError,
  updateProfile
);

// User interests route
router.put('/interests', protect, updateInterests);

// Avatar upload route
router.post(
  '/avatar',
  protect,
  upload.avatar.single('avatar'),
  upload.handleMulterError,
  uploadAvatar
);

// Saved events routes
router.get('/saved-events', protect, getSavedEvents);
router.post('/saved-events/:eventId', protect, saveEvent);
router.delete('/saved-events/:eventId', protect, deleteSavedEvent);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router; 