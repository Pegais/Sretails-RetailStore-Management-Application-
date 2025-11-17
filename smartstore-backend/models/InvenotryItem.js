const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category: { type: String, trim: true }, // e.g., Paint, Pipe, Tap

  quantity: { type: Number, default: 0 },
  unit: { type: String, default: "pcs" }, // pcs, litres, kg, etc.

  specifications: {
    size: String,
    color: String,
    weight: String,
    material: String,
    dimensions: String,
    variant: String, // e.g., glossy/matte, pedestal/overhead
  },

  price: {
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, },
    ownerDealPrice: { type: Number, }
  },

  description: { type: String }, // Human-friendly + useful for AI search
  barcode: { type: String, default: null, index: true }, // Optional, indexed for fast lookups
  images: [{ type: String }], // File URLs or paths for product images

  tags: [{ type: String }], // e.g., ['bathroom', 'white', 'pedestal']
  searchKeywords: [{ type: String }], // AI-generated or manually added

  meta: { type: mongoose.Schema.Types.Mixed }, // AI tags, dynamic fields

  // 🚀 SaaS Multi-Tenant Support
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // 📆 Inventory Intelligence
  addedAt: { type: Date, default: Date.now }, // Track how long item has been in stock
  status: {
    type: String,
    enum: ['active', 'low-demand', 'stale', 'archived'],
    default: 'active'
  },
  dealer: {
    name: { type: String },
    gstin: { type: String },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'DealerBill' }, // Optional but useful
  },
  sourceBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DealerBill',
    default: null
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('InventoryItem', inventorySchema)
