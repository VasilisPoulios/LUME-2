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
PaymentSchema.index({ paymentIntentId: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ event: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema); 