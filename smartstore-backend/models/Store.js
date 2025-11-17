const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storeCode: { type: String, unique: true }, // Optional slug or subdomain
  contactEmail: String,
  phone: String,
  logoUrl: String, // Optional branding
}, { timestamps: true })

module.exports = mongoose.model('Store', storeSchema)
