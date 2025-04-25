const express = require('express');
const { 
  getUserTickets, 
  cancelTicket, 
  getTicketQR, 
  validateTicket, 
  getTicketByCode,
  getTicketAnalytics,
  checkInByCode,
  getTicketsByEvent
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Default route - redirect to user tickets
router.get('/', (req, res) => {
  console.log('Redirecting from /tickets to /tickets/user');
  return getUserTickets(req, res);
});

// Get user's tickets
router.get('/user', getUserTickets);

// Get tickets by event ID
router.get('/event/:eventId', authorize('organizer', 'admin'), getTicketsByEvent);

// Get ticket analytics (for organizers and admins)
router.get('/analytics', authorize('organizer', 'admin'), getTicketAnalytics);

// Get ticket details by code
router.get('/details/:code', getTicketByCode);

// Generate QR code for a ticket
router.get('/:code/qr', getTicketQR);

// Validate a ticket (for organizers and admins)
router.post('/validate/:code', authorize('organizer', 'admin'), validateTicket);

// Check in attendee by ticket code (for QR code scanning)
router.patch('/check-in-by-code', authorize('organizer', 'admin'), checkInByCode);

// Cancel a ticket
router.post('/cancel/:id', cancelTicket);

module.exports = router;
