const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Get pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Get total notifications count
  const total = user.notifications.length;
  
  // Get notifications for current page
  const notifications = user.notifications.slice(startIndex, endIndex);
  
  // Create pagination object
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  // Count unread notifications
  const unreadCount = user.notifications.filter(n => !n.read).length;
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    pagination,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  const notification = user.notifications.id(req.params.id);
  
  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }
  
  await user.markNotificationAsRead(req.params.id);
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  await user.markAllNotificationsAsRead();
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
exports.clearNotifications = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  await user.clearNotifications();
  
  res.status(200).json({
    success: true,
    message: 'All notifications cleared'
  });
}); 