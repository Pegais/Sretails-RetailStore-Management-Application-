// routes/billRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticated } = require('../middlewares/authmiddleware');
const billUploadController = require('../controllers/billUploadController');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post(
  '/upload', 
  isAuthenticated, 
  upload.single('bill'), 
  billUploadController.uploadBillImage
);

router.get(
  '/status/:billId', 
  isAuthenticated, 
  billUploadController.getBillStatus
);

module.exports = router;