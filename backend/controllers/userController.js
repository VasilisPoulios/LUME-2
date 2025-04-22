const User = require('../models/User');
const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Handle avatar upload
  if (req.file) {
    // Delete old avatar if it exists and is not the default
    if (user.avatar && !user.avatar.includes('default-avatar')) {
      try {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log('Deleted old avatar:', oldAvatarPath);
        }
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }
    
    // Format the avatar path for database storage
    const avatarPath = `/uploads/avatars/${path.basename(req.file.path)}`;
    req.body.avatar = avatarPath;
    console.log('New avatar uploaded:', avatarPath);
  }

  // Fields to update
  const fieldsToUpdate = {
    name: req.body.name || user.name,
    email: req.body.email || user.email,
    avatar: req.body.avatar || user.avatar,
    interests: req.body.interests || user.interests,
    location: req.body.location || user.location
  };

  // Update user
  user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user interests
// @route   PUT /api/users/interests
// @access  Private
exports.updateInterests = asyncHandler(async (req, res) => {
  if (!req.body.interests || !Array.isArray(req.body.interests)) {
    res.status(400);
    throw new Error('Please provide an array of interests');
  }
  
  // Ensure all interests are strings
  const interests = req.body.interests.map(interest => interest.toString().trim());
  
  // Update user interests
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { interests },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      interests: user.interests
    }
  });
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an avatar image');
  }

  const user = await User.findById(req.user.id);

  // Delete old avatar if it exists and is not the default
  if (user.avatar && !user.avatar.includes('default-avatar')) {
    try {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
        console.log('Deleted old avatar:', oldAvatarPath);
      }
    } catch (err) {
      console.error('Error deleting old avatar:', err);
    }
  }

  // Format the avatar path for database storage
  const avatarPath = `/uploads/avatars/${path.basename(req.file.path)}`;

  // Update user with new avatar
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarPath },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {
      avatar: updatedUser.avatar
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user's saved events
// @route   GET /api/users/saved-events
// @access  Private
exports.getSavedEvents = asyncHandler(async (req, res) => {
  try {
    console.log('Getting saved events for user:', req.user.id);
    
    // Find the user and populate their savedEvents
    const user = await User.findById(req.user.id).populate({
      path: 'savedEvents',
      model: 'Event',
      select: 'title description image date time location price category isFeatured organizer'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if savedEvents exists, if not initialize it
    if (!user.savedEvents) {
      user.savedEvents = [];
      await user.save();
    }

    console.log(`Found ${user.savedEvents.length} saved events`);
    
    return res.status(200).json({
      success: true,
      count: user.savedEvents.length,
      data: user.savedEvents
    });
  } catch (error) {
    console.error('Error in getSavedEvents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching saved events',
      error: error.message
    });
  }
});

// @desc    Save an event
// @route   POST /api/users/saved-events/:eventId
// @access  Private
exports.saveEvent = asyncHandler(async (req, res) => {
  try {
    const eventId = req.params.eventId;
    console.log(`Attempting to save event ${eventId} for user ${req.user.id}`);

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize savedEvents array if it doesn't exist
    if (!user.savedEvents) {
      user.savedEvents = [];
    }

    // Check if the event is already saved
    if (user.savedEvents.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Event already saved'
      });
    }

    // Add the event to saved events
    user.savedEvents.push(eventId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Event saved successfully'
    });
  } catch (error) {
    console.error('Error in saveEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving event',
      error: error.message
    });
  }
});

// @desc    Delete a saved event
// @route   DELETE /api/users/saved-events/:eventId
// @access  Private
exports.deleteSavedEvent = asyncHandler(async (req, res) => {
  try {
    const eventId = req.params.eventId;
    console.log(`Attempting to remove event ${eventId} from saved events for user ${req.user.id}`);

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user has any saved events
    if (!user.savedEvents || user.savedEvents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No saved events to remove'
      });
    }

    // Check if the event is in the saved events
    if (!user.savedEvents.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Event not found in saved events'
      });
    }

    // Remove the event from saved events
    user.savedEvents = user.savedEvents.filter(id => id.toString() !== eventId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Event removed from saved events'
    });
  } catch (error) {
    console.error('Error in deleteSavedEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing saved event',
      error: error.message
    });
  }
}); 