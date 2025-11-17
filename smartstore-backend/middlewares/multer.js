const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage to access buffer
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;
