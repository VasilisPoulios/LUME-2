const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const createUploadDirs = () => {
  const eventDir = path.join(__dirname, '../uploads/events');
  const avatarDir = path.join(__dirname, '../uploads/avatars');
  
  if (!fs.existsSync(eventDir)) {
    fs.mkdirSync(eventDir, { recursive: true });
  }
  
  if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
  }
};

// Create upload directories
createUploadDirs();

// Set storage engine for events
const eventStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/events'));
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with uuid to prevent name collisions
    const uniqueId = uuidv4();
    cb(
      null,
      `event-${uniqueId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`
    );
  }
});

// Set storage engine for avatars
const avatarStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with uuid
    const uniqueId = uuidv4();
    cb(
      null,
      `avatar-${uniqueId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`
    );
  }
});

// Check file type and size
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|webp|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Please upload an image file (jpeg, jpg, png, webp, gif)'));
  }
};

// Initialize upload for events
const uploadEvent = multer({
  storage: eventStorage,
  limits: { 
    fileSize: 5000000 // 5MB
  },
  fileFilter: fileFilter
});

// Initialize upload for avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { 
    fileSize: 2000000 // 2MB
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Events: max 5MB, Avatars: max 2MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  event: uploadEvent,
  avatar: uploadAvatar,
  handleMulterError
}; 