const User = require('../models/User');
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
    if (user.avatar && user.avatar !== 'default-avatar.jpg') {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    
    // Set new avatar path
    req.body.avatar = `/uploads/avatars/${req.file.filename}`;
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
  if (user.avatar && user.avatar !== 'default-avatar.jpg') {
    const oldAvatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  // Update user with new avatar
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: `/uploads/avatars/${req.file.filename}` },
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