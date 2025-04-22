const express = require('express');
const { createPaymentIntent, confirmPayment, processPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create payment intent
router.post('/create-intent', createPaymentIntent);

// Confirm payment (legacy)
router.post('/confirm', confirmPayment);

// Process payment (new method that handles payment on the backend)
router.post('/process', processPayment);

module.exports = router; 