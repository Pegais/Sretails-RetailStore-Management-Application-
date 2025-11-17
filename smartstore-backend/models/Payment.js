// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  
  // Payment details
  amount: { type: Number, required: true },
  paymentMode: { 
    type: String, 
    enum: ['cash', 'upi', 'card', 'credit'],
    required: true 
  },
  
  // UPI specific
  upiId: String, // customer's UPI ID
  upiTransactionId: String, // UTR number
  upiApp: { type: String, enum: ['phonepe', 'paytm', 'gpay', 'bhim', 'other'] },
  
  // Customer info
  customerName: String,
  customerPhone: String,
  
  // Items sold (optional link)
  itemsSold: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    itemName: String,
    quantity: Number,
    price: Number
  }],
  
  // Metadata
  notes: String,
  date: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);