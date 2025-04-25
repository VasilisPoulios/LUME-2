require('dotenv').config();

// Check if Stripe key is set properly
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('ERROR: STRIPE_SECRET_KEY environment variable is not set!');
  console.error('Payment processing will fail. Please check your .env file or environment configuration.');
} else {
  console.log('Stripe Key found (starts with):', stripeKey.substring(0, 8) + '...');
  console.log('Stripe Key starts with "sk_":', stripeKey.startsWith('sk_'));
}

const stripe = require('stripe')(stripeKey);
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const asyncHandler = require('express-async-handler');
const { generateTicketCode, generateTicketQR } = require('../utils/ticketUtils');

// Debug: Log the Stripe key (first few characters only)
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'Not found');

// Helper function to determine if price is in cents or euros
const normalizePrice = (price) => {
  // If price is likely already in cents (large number), return as is
  if (price > 100) return price;
  // Otherwise convert to cents (from euros/dollars)
  return Math.round(price * 100);
};

// @desc    Create payment intent for an event
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { eventId, quantity = 1 } = req.body;
  
  console.log(`Creating payment intent for eventId: ${eventId}, quantity: ${quantity}`);

  // Validate event exists and has available tickets
  const event = await Event.findById(eventId);
  if (!event) {
    console.log(`Event not found with ID: ${eventId}`);
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  // Verify ticket quantity is valid
  const requestedQuantity = parseInt(quantity, 10);
  if (isNaN(requestedQuantity) || requestedQuantity < 1) {
    return res.status(400).json({ success: false, message: 'Invalid ticket quantity' });
  }

  // Check if enough tickets are available
  if (!event.ticketsAvailable || event.ticketsAvailable < requestedQuantity) {
    return res.status(400).json({ 
      success: false, 
      message: `Only ${event.ticketsAvailable} tickets available` 
    });
  }

  // Calculate total amount
  let unitPrice = event.price || 0;
  if (event.isFree || unitPrice === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'This event is free and does not require payment' 
    });
  }

  // Convert price to cents for Stripe if needed
  const priceInCents = normalizePrice(unitPrice);
  const totalAmount = priceInCents * requestedQuantity;

  console.log(`Price calculation: ${unitPrice} € per ticket (${priceInCents} cents) * ${requestedQuantity} tickets = ${totalAmount} cents total`);

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      metadata: {
        eventId,
        userId: req.user.id,
        quantity: requestedQuantity
      }
    });

    console.log(`Payment intent created: ${paymentIntent.id}`);

    // Create payment record
    await Payment.create({
      user: req.user.id,
      event: eventId,
      amount: unitPrice * requestedQuantity,
      quantity: requestedQuantity,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    // Important: Send back the client_secret
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount / 100, // Return in EUR, not cents
      currency: 'eur',
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Payment processing error', 
      error: error.message 
    });
  }
});

// @desc    Confirm payment and create ticket
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, eventId } = req.body;
  
  console.log(`Confirming payment for intent: ${paymentIntentId}, event: ${eventId || 'not provided'}, user: ${req.user.id}`);

  try {
    // Verify payment intent exists and is succeeded
    console.log('Retrieving payment intent from Stripe');
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log(`Payment intent retrieved, status: ${paymentIntent ? paymentIntent.status : 'null'}`);
    
    if (!paymentIntent) {
      console.log('Payment intent not found in Stripe');
      res.status(404);
      throw new Error('Payment intent not found');
    }
    
    if (paymentIntent.status !== 'succeeded') {
      console.log(`Payment intent status is ${paymentIntent.status}, not succeeded`);
      res.status(400);
      throw new Error(`Invalid payment status: ${paymentIntent.status}`);
    }
    
    // Get payment record
    console.log('Looking for payment record in database');
    const payment = await Payment.findOne({ paymentIntentId });
    
    if (!payment) {
      console.log('Payment record not found in database');
      
      // Check if there's metadata in the payment intent to create a payment record
      if (paymentIntent.metadata && paymentIntent.metadata.eventId) {
        console.log('Creating payment record from metadata');
        const newPayment = await Payment.create({
          user: req.user.id,
          event: paymentIntent.metadata.eventId,
          amount: paymentIntent.amount / 100, // Convert from cents
          quantity: parseInt(paymentIntent.metadata.quantity || 1, 10),
          paymentIntentId: paymentIntent.id,
          status: 'succeeded'
        });
        
        console.log(`Created new payment record: ${newPayment._id}`);
        
        // Continue with the newly created payment
        return confirmPaymentAfterRecord(req, res, newPayment, paymentIntent);
      }
      
      res.status(404);
      throw new Error('Payment record not found');
    }

    return confirmPaymentAfterRecord(req, res, payment, paymentIntent);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'An error occurred while confirming payment');
  }
});

// Helper function to confirm payment after finding/creating the payment record
const confirmPaymentAfterRecord = async (req, res, payment, paymentIntent) => {
  try {
    // Verify user owns the payment
    if (payment.user.toString() !== req.user.id) {
      console.log(`Auth error: Payment user ${payment.user} does not match request user ${req.user.id}`);
      res.status(401);
      throw new Error('Not authorized to confirm this payment');
    }

    // Check if payment is already processed
    if (payment.status === 'succeeded') {
      console.log('Payment was already processed, finding tickets');
      const tickets = await Ticket.find({ 
        user: req.user.id, 
        event: payment.event,
        createdAt: { $gte: payment.createdAt }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Payment was already processed',
        alreadyProcessed: true,
        data: {
          payment,
          tickets
        }
      });
    }

    // Get event
    console.log(`Finding event with ID: ${payment.event}`);
    const event = await Event.findById(payment.event);
    if (!event) {
      console.log(`Event not found with ID: ${payment.event}`);
      res.status(404);
      throw new Error('Event not found');
    }

    // Get quantity from payment record
    const quantity = payment.quantity || 1;
    console.log(`Processing payment for ${quantity} tickets`);

    // Check if tickets are still available
    if (!event.ticketsAvailable || event.ticketsAvailable < quantity) {
      console.log(`Not enough tickets available. Only ${event.ticketsAvailable} remaining.`);
      
      // Refund the payment since not enough tickets are available
      console.log('Creating refund in Stripe');
      await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        reason: 'requested_by_customer'
      });
      
      payment.status = 'refunded';
      await payment.save();
      console.log('Payment marked as refunded');

      res.status(400);
      throw new Error(`Not enough tickets available. Only ${event.ticketsAvailable} remaining. Payment has been refunded.`);
    }

    // Create tickets - one for each quantity
    console.log(`Creating ${quantity} tickets with QR codes`);
    const tickets = [];

    for (let i = 0; i < quantity; i++) {
      const ticketCode = generateTicketCode();
      
      // Create the ticket first to get its ID
      const ticket = await Ticket.create({
        user: req.user.id,
        event: event._id,
        payment: payment._id,
        ticketCode,
        isUsed: false,
        status: 'active'
      });
      
      // Generate QR code for the ticket
      try {
        const qrCodeData = await generateTicketQR(
          ticket._id.toString(),
          ticket.ticketCode,
          event._id.toString()
        );
        
        // Update the ticket with the QR code data
        ticket.qrCodeData = qrCodeData;
        await ticket.save();
        
        // Verify QR code was saved
        const savedTicket = await Ticket.findById(ticket._id);
        console.log(`QR code saved successfully: ${savedTicket.qrCodeData ? 'Yes' : 'No'}`);
        console.log(`QR code data length: ${savedTicket.qrCodeData ? savedTicket.qrCodeData.substring(0, 30) + '...' : 'N/A'}`);
        
        console.log(`QR code generated for ticket ${ticket._id}`);
      } catch (qrError) {
        console.error(`Failed to generate QR code for ticket ${ticket._id}:`, qrError);
        // Continue with other tickets even if QR generation fails for one
      }
      
      tickets.push(ticket);
    }

    // Update payment status
    payment.status = 'succeeded';
    payment.receiptUrl = paymentIntent.charges?.data?.[0]?.receipt_url || null;
    await payment.save();
    console.log('Payment status updated to succeeded');

    // Decrement available tickets
    event.ticketsAvailable -= quantity;
    await event.save();
    console.log(`Updated event ticket count, new availability: ${event.ticketsAvailable}`);

    console.log(`Payment confirmed successfully, created ${tickets.length} tickets with QR codes`);

    return res.status(200).json({
      success: true,
      data: {
        payment,
        tickets,
        ticketIds: tickets.map(ticket => ticket._id)
      }
    });
  } catch (error) {
    console.error('Error in confirmPaymentAfterRecord:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'An error occurred while processing payment');
  }
};

// @desc    Process payment directly with payment method
// @route   POST /api/payments/process
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  const { eventId, quantity = 1, paymentMethodId } = req.body;

  console.log(`Processing payment for eventId: ${eventId}, quantity: ${quantity}, method: ${paymentMethodId}`);

  if (!eventId || !paymentMethodId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }

  // Validate event exists and has available tickets
  const event = await Event.findById(eventId);
  if (!event) {
    console.log(`Event not found with ID: ${eventId}`);
    return res.status(404).json({ 
      success: false, 
      message: 'Event not found' 
    });
  }

  // Verify ticket quantity is valid
  const requestedQuantity = parseInt(quantity, 10);
  if (isNaN(requestedQuantity) || requestedQuantity < 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid ticket quantity' 
    });
  }

  // Check if enough tickets are available
  if (!event.ticketsAvailable || event.ticketsAvailable < requestedQuantity) {
    return res.status(400).json({ 
      success: false, 
      message: `Only ${event.ticketsAvailable} tickets available` 
    });
  }

  // Calculate total amount
  let unitPrice = event.price || 0;
  if (event.isFree || unitPrice === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'This event is free and does not require payment' 
    });
  }

  // Convert price to cents for Stripe if needed
  const priceInCents = normalizePrice(unitPrice);
  const totalAmount = priceInCents * requestedQuantity;

  console.log(`Price calculation: ${unitPrice} € per ticket (${priceInCents} cents) * ${requestedQuantity} tickets = ${totalAmount} cents total`);

  try {
    // Create payment intent and confirm it immediately
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment immediately
      metadata: {
        eventId,
        userId: req.user.id,
        quantity: requestedQuantity
      }
    });

    console.log(`Payment intent created and confirmed: ${paymentIntent.id}, status: ${paymentIntent.status}`);

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Create payment record
      const payment = await Payment.create({
        user: req.user.id,
        event: eventId,
        amount: unitPrice * requestedQuantity,
        quantity: requestedQuantity,
        paymentIntentId: paymentIntent.id,
        status: 'completed'
      });

      console.log(`Payment record created: ${payment._id}`);

      // Update event ticket count
      event.ticketsAvailable -= requestedQuantity;
      await event.save();

      // Generate tickets with QR codes
      console.log(`Creating ${requestedQuantity} tickets with QR codes`);
      const tickets = [];

      for (let i = 0; i < requestedQuantity; i++) {
        const ticketCode = generateTicketCode();
        
        // Create the ticket first to get its ID
        const ticket = await Ticket.create({
          user: req.user.id,
          event: eventId,
          payment: payment._id,
          ticketCode,
          isUsed: false,
          status: 'active'
        });
        
        // Generate QR code for the ticket
        try {
          const qrCodeData = await generateTicketQR(
            ticket._id.toString(),
            ticket.ticketCode,
            eventId
          );
          
          // Update the ticket with the QR code data
          ticket.qrCodeData = qrCodeData;
          await ticket.save();
          
          // Verify QR code was saved
          const savedTicket = await Ticket.findById(ticket._id);
          console.log(`QR code saved successfully: ${savedTicket.qrCodeData ? 'Yes' : 'No'}`);
          console.log(`QR code data length: ${savedTicket.qrCodeData ? savedTicket.qrCodeData.substring(0, 30) + '...' : 'N/A'}`);
          
          console.log(`QR code generated for ticket ${ticket._id}`);
        } catch (qrError) {
          console.error(`Failed to generate QR code for ticket ${ticket._id}:`, qrError);
          // Continue with other tickets even if QR generation fails for one
        }
        
        tickets.push(ticket);
      }

      res.status(200).json({
        success: true,
        message: 'Payment successful',
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status
        },
        tickets: tickets.map(ticket => ({
          id: ticket._id,
          code: ticket.ticketCode
        }))
      });
    } else {
      console.log(`Payment failed with status: ${paymentIntent.status}`);
      return res.status(400).json({ 
        success: false, 
        message: `Payment failed with status: ${paymentIntent.status}` 
      });
    }
  } catch (error) {
    console.error('Stripe payment processing error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Payment processing error', 
      error: error.message 
    });
  }
});

module.exports = {
  createPaymentIntent,
  processPayment,
  confirmPayment
}; 