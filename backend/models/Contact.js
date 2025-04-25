const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new'
    },
    notes: {
      type: String,
      trim: true
    },
    adminResponse: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Add pagination plugin
contactSchema.plugin(mongoosePaginate);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 