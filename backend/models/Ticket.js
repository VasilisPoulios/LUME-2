const mongoose = require('mongoose');
const crypto = require('crypto');

const TicketSchema = new mongoose.Schema(
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
    ticketCode: {
      type: String,
      unique: true,
      default: function() {
        // Generate a random ticket code
        return crypto.randomBytes(10).toString('hex').toUpperCase();
      }
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for quick lookups by ticket code
TicketSchema.index({ ticketCode: 1 });

// Compound index for user and event for quick lookups
TicketSchema.index({ user: 1, event: 1 });

// Create QR code URL virtual property
TicketSchema.virtual('qrCodeUrl').get(function() {
  return `/api/tickets/${this.ticketCode}/qr`;
});

module.exports = mongoose.model('Ticket', TicketSchema); 