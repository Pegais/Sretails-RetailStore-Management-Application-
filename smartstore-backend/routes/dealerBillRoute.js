const express = require('express');
const upload = require('../middlewares/multer'); // same middleware as before
const authmiddleware=require('../middlewares/authmiddleware')
const {uploadDealerBill } = require('../controllers/dealerBillController');

const router = express.Router();

// Upload dealer bill (image, PDF, CSV)
router.post('/upload', upload.single('bill'),authmiddleware.isAuthenticated,uploadDealerBill);

module.exports = router;
