const express = require('express');
const {
  updateProfile,
  uploadAvatar,
  getUserById
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
  updateProfile
);

// Avatar upload route
router.post(
  '/avatar',
  protect,
  upload.avatar.single('avatar'),
  uploadAvatar
);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router; 