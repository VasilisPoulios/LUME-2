const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @desc    Create RSVP for free event
// @route   POST /api/events/:eventId/rsvp
// @access  Public
exports.createRSVP = async (req, res) => {
  try {
    const { name, email, phone, quantity } = req.body;
    const eventId = req.params.eventId;

    // Validate required fields
    if (!name || !email || !quantity) {
      return res.status(400).json({ success: false, message: 'Name, email, and quantity are required' });
    }

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 10' });
    }

    // Find event
    const event = await Event.findById(eventId).populate('organizer');
    if (!event) {
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

    // Send email to organizer
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

    res.status(201).json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}; 