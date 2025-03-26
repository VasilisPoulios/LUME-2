const path = require('path');
const multer = require('multer');

// Set storage engine for events
const eventStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/events');
  },
  filename: function(req, file, cb) {
    cb(
      null,
      `event-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Set storage engine for avatars
const avatarStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/avatars');
  },
  filename: function(req, file, cb) {
    cb(
      null,
      `avatar-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Please upload an image file (jpeg, jpg, png, webp)'));
  }
};

// Initialize upload for events
const uploadEvent = multer({
  storage: eventStorage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: fileFilter
});

// Initialize upload for avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2000000 }, // 2MB
  fileFilter: fileFilter
});

module.exports = {
  event: uploadEvent,
  avatar: uploadAvatar
}; 