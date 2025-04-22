const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add payment amount']
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending'
    },
    receiptUrl: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ paymentIntentId: 1 }, { unique: true });
PaymentSchema.index({ event: 1, user: 1 });

module.exports = mongoose.model('Payment', PaymentSchema); 