const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Notification Schema - subdocument for User
const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['event', 'review', 'ticket', 'system', 'payment'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'organizer', 'admin'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: 'default-avatar.jpg'
    },
    savedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      }
    ],
    interests: [String],
    notifications: [NotificationSchema],
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

// Create a 2dsphere index on the location field
UserSchema.index({ location: '2dsphere' });

// Virtual for full avatar URL
UserSchema.virtual('avatarUrl').get(function() {
  if (this.avatar === 'default-avatar.jpg') {
    return `/uploads/avatars/default-avatar.jpg`;
  }
  return this.avatar;
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Add notification method
UserSchema.methods.addNotification = async function(type, message, relatedId = null) {
  this.notifications.unshift({
    type,
    message,
    relatedId,
    read: false,
    createdAt: Date.now()
  });

  // Limit to 50 notifications
  if (this.notifications.length > 50) {
    this.notifications = this.notifications.slice(0, 50);
  }

  return this.save();
};

// Mark notification as read
UserSchema.methods.markNotificationAsRead = async function(notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.read = true;
    return this.save();
  }
  return this;
};

// Mark all notifications as read
UserSchema.methods.markAllNotificationsAsRead = async function() {
  this.notifications.forEach(notification => {
    notification.read = true;
  });
  return this.save();
};

// Clear notifications
UserSchema.methods.clearNotifications = async function() {
  this.notifications = [];
  return this.save();
};

module.exports = mongoose.model('User', UserSchema); 