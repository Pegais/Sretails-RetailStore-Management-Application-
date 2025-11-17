// controllers/paymentController.js
const mongoose = require('mongoose')
const Payment = require('../models/Payment');

// Quick add payment (mobile optimized)
exports.addPayment = async (req, res) => {
  try {
    const { storeId, userId } = req.user;
    const { 
      amount, 
      paymentMode, 
      upiId, 
      upiTransactionId, 
      upiApp,
      customerName,
      customerPhone,
      itemsSold,
      notes 
    } = req.body;

    const payment = await Payment.create({
      storeId,
      amount,
      paymentMode,
      upiId,
      upiTransactionId,
      upiApp,
      customerName,
      customerPhone,
      itemsSold,
      notes,
      recordedBy: userId
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded',
      payment
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get daily sales summary
exports.getDailySales = async (req, res) => {
  try {
    const { storeId } = req.user;
    const { date } = req.query; // YYYY-MM-DD

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      storeId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    const summary = {
      totalSales: 0,
      cash: 0,
      upi: 0,
      card: 0,
      credit: 0,
      transactionCount: payments.length
    };

    payments.forEach(p => {
      summary.totalSales += p.amount;
      summary[p.paymentMode] += p.amount;
    });

    return res.json({
      date,
      summary,
      payments
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get payment analytics
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const { storeId } = req.user;
    const { startDate, endDate } = req.query;

    const analytics = await Payment.aggregate([
      {
        $match: {
          storeId: mongoose.Types.ObjectId(storeId),
          date: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          }
        }
      },
      {
        $group: {
          _id: '$paymentMode',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.json({ analytics });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};