const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  googleId: String,

  role: {
    type: String,
    enum: ['owner', 'manager', 'staff'],
    default: 'staff'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },

  otp: String,
  otpExpires: Date
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
