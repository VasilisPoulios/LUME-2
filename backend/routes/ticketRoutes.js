const express = require('express');
const { 
  getUserTickets, 
  cancelTicket, 
  getTicketQR, 
  validateTicket, 
  getTicketByCode 
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's tickets
router.get('/user', getUserTickets);

// Get ticket details by code
router.get('/details/:code', getTicketByCode);

// Generate QR code for a ticket
router.get('/:code/qr', getTicketQR);

// Validate a ticket (for organizers and admins)
router.post('/validate/:code', authorize('organizer', 'admin'), validateTicket);

// Cancel a ticket
router.post('/cancel/:id', cancelTicket);

module.exports = router; 