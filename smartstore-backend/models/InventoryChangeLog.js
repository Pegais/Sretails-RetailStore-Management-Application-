const mongoose = require('mongoose')

const inventoryChangeLogSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changeType: {
    type: String,
    enum: ['quantity_increase', 'quantity_decrease', 'quantity_set', 'item_created', 'item_updated', 'item_deleted', 'bill_upload'],
    required: true,
  },
  oldQuantity: {
    type: Number,
    default: 0,
  },
  newQuantity: {
    type: Number,
    default: 0,
  },
  quantityChange: {
    type: Number, // positive for increase, negative for decrease
    default: 0,
  },
  reason: {
    type: String,
    default: '',
  },
  sourceBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DealerBill',
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
inventoryChangeLogSchema.index({ itemId: 1, createdAt: -1 })
inventoryChangeLogSchema.index({ storeId: 1, createdAt: -1 })

module.exports = mongoose.model('InventoryChangeLog', inventoryChangeLogSchema)

