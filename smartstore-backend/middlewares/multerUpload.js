const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'smartstore_inventory',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'csv'],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

// const upload = multer({ storage });
// Filter for file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, PDF, and CSV are allowed.'));
  }
};

// File size limit: 5MB per file
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = upload;
