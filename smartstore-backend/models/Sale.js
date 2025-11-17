const mongoose = require('mongoose')

const saleSchema = new mongoose.Schema(
  {
    saleId: {
      type: String,
      unique: true,
      required: true,
    }, // Format: "SALE-2024-001"

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },

    // Cart Items
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryItem',
          required: true,
        },
        itemName: { type: String, required: true },
        brand: String,
        category: String,
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true }, // Price at time of sale
        discount: { type: Number, default: 0 }, // Discount per item
        tax: { type: Number, default: 0 },
        subtotal: { type: Number, required: true }, // (quantity * unitPrice) - discount + tax
      },
    ],

    // Pricing Summary
    subtotal: { type: Number, required: true }, // Sum of all item subtotals
    discount: { type: Number, default: 0 }, // Overall discount
    tax: { type: Number, default: 0 }, // Overall tax
    total: { type: Number, required: true }, // Final amount

    // Payment
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'credit', 'mixed'],
      required: true,
    },
    payments: [
      {
        // For split payments
        method: { type: String, enum: ['cash', 'upi', 'card', 'credit'], required: true },
        amount: { type: Number, required: true },
        transactionId: String, // UPI UTR, Card transaction ID, etc.
        upiApp: String, // For UPI payments
        notes: String,
      },
    ],

    // Customer (optional - null for walk-in customers)
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customerName: String, // Quick entry if no customer registered
    customerPhone: String,

    // Metadata
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled', 'refunded'],
      default: 'completed',
    },
    saleType: {
      type: String,
      enum: ['retail', 'wholesale', 'online'],
      default: 'retail',
    },
    notes: String,

    // Staff
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cashierName: String,

    // Timestamps
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Generate unique saleId before saving
saleSchema.pre('save', async function (next) {
  if (!this.saleId) {
    const count = await mongoose.model('Sale').countDocuments({
      storeId: this.storeId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    })
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    this.saleId = `SALE-${dateStr}-${String(count + 1).padStart(3, '0')}`
  }
  next()
})

// Indexes for performance
saleSchema.index({ storeId: 1, saleDate: -1 })
saleSchema.index({ customerId: 1 })
saleSchema.index({ saleId: 1 })
saleSchema.index({ soldBy: 1 })

module.exports = mongoose.model('Sale', saleSchema)

