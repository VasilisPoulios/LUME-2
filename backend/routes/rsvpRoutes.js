const express = require('express');
const { getOrganizerRSVPs, getUserRSVPs, checkInRSVP } = require('../controllers/rsvpController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all RSVPs for an organizer's events
router.get('/', protect, authorize('organizer', 'admin'), getOrganizerRSVPs);

// Get all RSVPs for the current user
router.get('/user', protect, getUserRSVPs);

// Check in guests for an RSVP
router.patch('/:id/check-in', protect, authorize('organizer', 'admin'), checkInRSVP);

module.exports = router; 