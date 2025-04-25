const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/', contactController.submitContactForm);

// Admin-only routes
router.get('/', protect, authorize('admin'), contactController.getContactMessages);
router.patch('/:id', protect, authorize('admin'), contactController.updateContactStatus);

module.exports = router; 