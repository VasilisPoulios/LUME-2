const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  checkedInGuests: {
    type: Number,
    default: 0,
    min: 0
  },
  lastCheckedInAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
rsvpSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema); 