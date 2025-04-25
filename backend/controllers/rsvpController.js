const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Create email transporter
let transporter;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('Email transport configured successfully');
  } else {
    console.log('Email credentials not found, email notifications will be disabled');
  }
} catch (error) {
  console.error('Failed to initialize email transport:', error);
}

// @desc    Create RSVP for free event
// @route   POST /api/events/:eventId/rsvp
// @access  Public
exports.createRSVP = async (req, res) => {
  try {
    const { name, email, phone, quantity } = req.body;
    const eventId = req.params.id;
    
    console.log(`[RSVP Debug] Received RSVP request for event ID: ${eventId}`);
    console.log(`[RSVP Debug] Request params:`, req.params);
    console.log(`[RSVP Debug] Request body:`, req.body);
    
    // Check if eventId is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(eventId);
    console.log(`[RSVP Debug] Is valid ObjectId: ${isValidObjectId}`);
    
    if (!isValidObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid event ID format' });
    }

    // Validate required fields
    if (!name || !email || !quantity) {
      return res.status(400).json({ success: false, message: 'Name, email, and quantity are required' });
    }

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 10' });
    }

    // Find event
    console.log(`[RSVP Debug] Looking for event with ID: ${eventId}`);
    const event = await Event.findById(eventId).populate('organizer');
    console.log(`[RSVP Debug] Event found:`, event ? 'Yes' : 'No');
    
    if (!event) {
      console.log(`[RSVP Debug] Event not found for ID: ${eventId}`);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if event is free
    if (event.price !== 0) {
      return res.status(400).json({ success: false, message: 'RSVP is only available for free events' });
    }

    // Check event capacity
    if (event.ticketsAvailable < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough tickets available' });
    }

    // Check for duplicate RSVP
    const existingRSVP = await RSVP.findOne({ event: eventId, email });
    if (existingRSVP) {
      return res.status(400).json({ success: false, message: 'You have already RSVPed for this event' });
    }

    // Create RSVP
    const rsvp = await RSVP.create({
      event: eventId,
      name,
      email,
      phone,
      quantity
    });

    // Update event's RSVP count
    event.rsvpCount = (event.rsvpCount || 0) + 1;
    event.ticketsAvailable -= quantity;
    await event.save();

    // Send email to organizer if transporter is configured
    if (transporter && event.organizer && event.organizer.email) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: event.organizer.email,
          subject: `New RSVP for ${event.title}`,
          html: `
            <h2>New RSVP for ${event.title}</h2>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            ${phone ? `<p>Phone: ${phone}</p>` : ''}
            <p>Guests: ${quantity}</p>
            <p>Event Date: ${new Date(event.date).toLocaleDateString()}</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email notification sent to organizer: ${event.organizer.email}`);
      } catch (emailError) {
        // Just log the error but don't fail the RSVP process
        console.error('Failed to send email notification:', emailError);
      }
    } else {
      console.log('Email notification skipped - transporter not configured or missing organizer email');
    }

    res.status(201).json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get RSVPs by event ID
// @route   GET /api/events/:eventId/rsvps
// @access  Private (Organizers and Admins)
exports.getRSVPsByEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log(`Getting RSVPs for event: ${eventId}`);
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Authorization check - only event organizer or admin can view RSVPs
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view RSVPs for this event' });
    }
    
    // Find all RSVPs for this event
    const rsvps = await RSVP.find({ event: eventId })
      .sort('-createdAt');
    
    console.log(`Found ${rsvps.length} RSVPs for event ${eventId}`);
    
    // Calculate total guests
    const totalGuests = rsvps.reduce((total, rsvp) => total + rsvp.quantity, 0);
    
    res.status(200).json({
      success: true,
      count: rsvps.length,
      totalGuests,
      data: rsvps
    });
    
  } catch (error) {
    console.error('Error getting RSVPs by event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving RSVPs' 
    });
  }
};

// @desc    Get all RSVPs for organizer's events
// @route   GET /api/rsvps
// @access  Private (Organizers and Admins)
exports.getOrganizerRSVPs = async (req, res) => {
  try {
    // Check if user is organizer or admin
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access RSVPs' 
      });
    }
    
    // Get organizer ID (either from query or use current user)
    const organizerId = req.query.organizer || req.user.id;
    
    // Additional authorization check if querying another organizer's data
    if (organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this organizer\'s RSVPs' 
      });
    }
    
    // Find all events for this organizer
    const events = await Event.find({ organizer: organizerId });
    
    if (!events.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    const eventIds = events.map(event => event._id);
    
    // Find all RSVPs for these events
    const rsvps = await RSVP.find({ event: { $in: eventIds } })
      .populate('event', 'title date')
      .sort('-createdAt');
    
    // Get counts per event
    const eventRSVPCounts = {};
    const eventGuestCounts = {};
    
    rsvps.forEach(rsvp => {
      const eventId = rsvp.event._id.toString();
      
      // Count RSVPs per event
      if (!eventRSVPCounts[eventId]) {
        eventRSVPCounts[eventId] = 0;
      }
      eventRSVPCounts[eventId]++;
      
      // Count total guests per event
      if (!eventGuestCounts[eventId]) {
        eventGuestCounts[eventId] = 0;
      }
      eventGuestCounts[eventId] += rsvp.quantity;
    });
    
    // Calculate total guests
    const totalGuests = rsvps.reduce((total, rsvp) => total + rsvp.quantity, 0);
    
    res.status(200).json({
      success: true,
      count: rsvps.length,
      totalGuests,
      eventRSVPCounts,
      eventGuestCounts,
      data: rsvps
    });
    
  } catch (error) {
    console.error('Error getting organizer RSVPs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving RSVPs' 
    });
  }
};

// @desc    Get all RSVPs for the current user
// @route   GET /api/rsvps/user
// @access  Private
exports.getUserRSVPs = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    console.log(`Getting RSVPs for user: ${userId}`);
    
    // Find RSVPs by email (since RSVPs are linked by email, not user ID)
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }
    
    // Find all RSVPs with the user's email
    const rsvps = await RSVP.find({ email: userEmail })
      .populate({
        path: 'event',
        select: 'title description image venue address startDateTime endDateTime'
      })
      .sort('-createdAt');
    
    console.log(`Found ${rsvps.length} RSVPs for user ${userId}`);
    
    // Calculate total number of guests
    const totalGuests = rsvps.reduce((total, rsvp) => total + rsvp.quantity, 0);
    
    res.status(200).json({
      success: true,
      count: rsvps.length,
      totalGuests,
      data: rsvps
    });
    
  } catch (error) {
    console.error('Error getting user RSVPs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving your RSVPs' 
    });
  }
};

// @desc    Check in RSVP guests
// @route   PATCH /api/rsvps/:id/check-in
// @access  Private (Organizers and Admins)
exports.checkInRSVP = async (req, res) => {
  try {
    const rsvpId = req.params.id;
    const { checkedInGuests } = req.body;
    
    if (checkedInGuests === undefined || checkedInGuests === null) {
      return res.status(400).json({
        success: false,
        message: 'Number of checked-in guests is required'
      });
    }
    
    // Find the RSVP
    const rsvp = await RSVP.findById(rsvpId).populate('event');
    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }
    
    // Authorization check - only event organizer or admin can check in RSVP
    if (
      rsvp.event.organizer.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check in RSVPs for this event'
      });
    }
    
    // Validate check-in count
    if (checkedInGuests < 0 || checkedInGuests > rsvp.quantity) {
      return res.status(400).json({
        success: false,
        message: `Checked-in guests must be between 0 and ${rsvp.quantity}`
      });
    }
    
    // Update the RSVP with check-in info
    rsvp.checkedInGuests = checkedInGuests;
    rsvp.lastCheckedInAt = checkedInGuests > 0 ? Date.now() : null;
    
    await rsvp.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully updated check-in status. ${checkedInGuests} of ${rsvp.quantity} guests checked in.`,
      data: rsvp
    });
    
  } catch (error) {
    console.error('Error checking in RSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking in RSVP'
    });
  }
}; 