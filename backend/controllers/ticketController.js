const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');

// @desc    Get all tickets for the current user
// @route   GET /api/tickets/user
// @access  Private
exports.getUserTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user.id })
    .populate('event', 'title startDateTime endDateTime venue image')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets
  });
});

// @desc    Cancel a ticket
// @route   POST /api/tickets/cancel/:id
// @access  Private
exports.cancelTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('event', 'price ticketsAvailable');

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Make sure user owns the ticket
  if (ticket.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to cancel this ticket');
  }

  // Check if ticket is already cancelled or used
  if (ticket.status !== 'active') {
    res.status(400);
    throw new Error('This ticket cannot be cancelled');
  }

  // If the event has a price, check for payment and handle refund
  if (ticket.event.price > 0) {
    const payment = await Payment.findOne({
      user: req.user.id,
      event: ticket.event._id,
      status: 'succeeded'
    });

    if (payment) {
      // TODO: Implement refund logic here
      // This would typically involve:
      // 1. Creating a refund through your payment provider (e.g., Stripe)
      // 2. Updating the payment status to 'refunded'
      // 3. Recording the refund details
      
      // For now, we'll just update the payment status
      payment.status = 'refunded';
      await payment.save();
    }
  }

  // Update ticket status
  ticket.status = 'cancelled';
  await ticket.save();

  // Increment available tickets
  ticket.event.ticketsAvailable += 1;
  await ticket.event.save();

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Generate QR code for a ticket
// @route   GET /api/tickets/:code/qr
// @access  Private
exports.getTicketQR = asyncHandler(async (req, res) => {
  const ticketCode = req.params.code;
  
  // Find ticket by code
  const ticket = await Ticket.findOne({ ticketCode })
    .populate('event', 'title startDateTime venue')
    .populate('user', 'name email');
  
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  
  // Ensure the user requesting the QR code owns the ticket
  if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'organizer') {
    res.status(401);
    throw new Error('Not authorized to access this ticket');
  }
  
  // Generate QR code with ticket information
  const qrData = JSON.stringify({
    ticketCode: ticket.ticketCode,
    eventId: ticket.event._id,
    userId: ticket.user._id,
    validationUrl: `${req.protocol}://${req.get('host')}/api/tickets/validate/${ticket.ticketCode}`
  });
  
  // Generate QR code as data URL
  const qrCode = await QRCode.toDataURL(qrData);
  
  res.status(200).json({
    success: true,
    data: {
      ticket,
      qrCode
    }
  });
});

// @desc    Validate a ticket (scan QR code)
// @route   POST /api/tickets/validate/:code
// @access  Private (Organizers and Admins)
exports.validateTicket = asyncHandler(async (req, res) => {
  const ticketCode = req.params.code;
  
  // Find ticket by code
  const ticket = await Ticket.findOne({ ticketCode })
    .populate({
      path: 'event',
      select: 'title startDateTime endDateTime venue organizer'
    })
    .populate('user', 'name email');
  
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  
  // Check if user is the organizer of the event or an admin
  if (ticket.event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to validate tickets for this event');
  }
  
  // Check if ticket is already used or cancelled
  if (ticket.status === 'used') {
    return res.status(400).json({
      success: false,
      message: 'This ticket has already been used',
      data: {
        ticket,
        valid: false,
        reason: 'ALREADY_USED'
      }
    });
  }
  
  if (ticket.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'This ticket has been cancelled',
      data: {
        ticket,
        valid: false,
        reason: 'CANCELLED'
      }
    });
  }
  
  // Check if event has already ended
  const now = new Date();
  if (now > ticket.event.endDateTime) {
    return res.status(400).json({
      success: false,
      message: 'The event has already ended',
      data: {
        ticket,
        valid: false,
        reason: 'EVENT_ENDED'
      }
    });
  }
  
  // Check if event hasn't started yet (with a 2-hour buffer)
  const twoHoursBefore = new Date(ticket.event.startDateTime);
  twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
  
  if (now < twoHoursBefore) {
    return res.status(400).json({
      success: false,
      message: 'The event has not started yet (entry allowed 2 hours before start)',
      data: {
        ticket,
        valid: false,
        reason: 'EVENT_NOT_STARTED'
      }
    });
  }
  
  // Mark ticket as used
  ticket.status = 'used';
  await ticket.save();
  
  // Notify the user
  const user = await User.findById(ticket.user._id);
  if (user) {
    await user.addNotification(
      'ticket',
      `Your ticket for ${ticket.event.title} was validated and used for entry.`,
      ticket.event._id
    );
  }
  
  res.status(200).json({
    success: true,
    message: 'Ticket successfully validated',
    data: {
      ticket,
      valid: true,
      validatedAt: new Date()
    }
  });
});

// @desc    Get ticket details by code
// @route   GET /api/tickets/details/:code
// @access  Private
exports.getTicketByCode = asyncHandler(async (req, res) => {
  const ticketCode = req.params.code;
  
  // Find ticket by code
  const ticket = await Ticket.findOne({ ticketCode })
    .populate('event', 'title startDateTime endDateTime venue image organizer')
    .populate('user', 'name email');
  
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  
  // Allow access to ticket owner, event organizer, or admin
  if (
    ticket.user._id.toString() !== req.user.id && 
    ticket.event.organizer.toString() !== req.user.id && 
    req.user.role !== 'admin'
  ) {
    res.status(401);
    throw new Error('Not authorized to access this ticket');
  }
  
  res.status(200).json({
    success: true,
    data: ticket
  });
}); 