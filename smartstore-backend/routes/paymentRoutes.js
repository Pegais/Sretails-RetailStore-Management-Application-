// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authmiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/', isAuthenticated, paymentController.addPayment);
router.get('/daily', isAuthenticated, paymentController.getDailySales);
router.get('/analytics', isAuthenticated, paymentController.getPaymentAnalytics);

module.exports = router;