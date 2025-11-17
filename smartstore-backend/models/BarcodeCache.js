const mongoose = require('mongoose')

const barcodeCacheSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productInfo: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    cachedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 30) // Cache for 30 days
        return date
      },
    },
  },
  { timestamps: true }
)

// Index for faster lookups
barcodeCacheSchema.index({ barcode: 1 })
barcodeCacheSchema.index({ expiresAt: 1 })

// Auto-delete expired entries (optional - can run cleanup job)
barcodeCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('BarcodeCache', barcodeCacheSchema)

