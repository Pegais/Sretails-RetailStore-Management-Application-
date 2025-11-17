// models/DealerBill.js
const mongoose = require('mongoose');

const dealerBillSchema = new mongoose.Schema({
  dealerName: { type: String, trim: true },
  dealerGSTIN: { type: String, trim: true },
  invoiceNumber: { type: String, trim: true },
  invoiceDate: { type: Date },
  totalAmount: { type: Number },

  billType: { type: String, enum: ['pdf', 'image', 'csv', 'excel'] },
  fileUrl: { type: String, required: true },
  originalFileName: { type: String },
  extractedText: { type: String }, // Full OCR or parsed text
  
  itemsParsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' }],
  meta: { type: mongoose.Schema.Types.Mixed }, // Raw parsing result, confidence, etc.

  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DealerBill', dealerBillSchema);
