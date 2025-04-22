const mongoose = require('mongoose');
const slugify = require('slugify');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'Music',
        'Visual Arts',
        'Performing Arts',
        'Film',
        'Lectures',
        'Fashion',
        'Food',
        'Sports',
        'Technology',
        'Health',
        'Business',
        'Lifestyle',
        'Other'
      ]
    },
    tags: [String],
    price: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: 'default-event.jpg'
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    venue: {
      type: String,
      required: [true, 'Please add a venue']
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    startDateTime: {
      type: Date,
      required: [true, 'Please add a start date and time']
    },
    endDateTime: {
      type: Date,
      required: [true, 'Please add an end date and time']
    },
    ticketsAvailable: {
      type: Number,
      required: [true, 'Please add the number of available tickets']
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    rsvpCount: {
      type: Number,
      default: 0
    },
    // Flag fields for admin features
    isFeatured: {
      type: Boolean,
      default: false
    },
    isHot: {
      type: Boolean,
      default: false
    },
    isUnmissable: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
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

// Create slug from the title
EventSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

// Create geospatial index
EventSchema.index({ location: '2dsphere' });

// Create text index for search
EventSchema.index({ 
  title: 'text', 
  description: 'text', 
  venue: 'text', 
  address: 'text', 
  tags: 'text' 
});

module.exports = mongoose.model('Event', EventSchema); 