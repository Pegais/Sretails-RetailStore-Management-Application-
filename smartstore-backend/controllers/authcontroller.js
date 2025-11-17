const User = require('../models/Users')
const { sendOtpMail } = require('../utils/sendOtp')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Store = require('../models/Store')

exports.register = async (req, res) => {
  const { name, email, password, role, storeName } = req.body

  try {
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'User already exists' })

    if (role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can register directly' })
    }

    const hashed = await bcrypt.hash(password, 10)

    // ✅ Create Store first
    const store = await Store.create({
      name: storeName,
     storeCode: `store-${Date.now()}`, // always unique
      ownerId: null // temporarily null
    })

    // ✅ Create Owner user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      storeId: store._id
    })

    // ✅ Link store to owner
    store.ownerId = user._id
    await store.save()

    res.status(201).json({ message: 'Owner and store created', userId: user._id, storeId: store._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creating user/store' })
  }
}


// ✅ Generate JWT
const generateToken = (userId, role, storeId) => {
  return jwt.sign(
    { userId, role, storeId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '3d' }
  )
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).populate('storeId')
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user._id, user.role, user.storeId?._id)

    res.cookie('smartstore_token', token, {
      httpOnly: true,
      secure: false, // ✅ Set to true in production with HTTPS
      sameSite: 'Lax',
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    })

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: {
          id: user.storeId?._id,
          name: user.storeId?.name,
          storeCode: user.storeId?.storeCode
        }
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error during login' })
  }
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = Date.now() + 10 * 60 * 1000 // 10 mins

    user.otp = otp
    user.otpExpires = expiry
    await user.save()

    await sendOtpMail(email, otp)
    res.json({ message: 'OTP sent successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.verifyOtp = (req, res) => {
  res.send('Verify OTP route hit')
}

exports.resetPassword = (req, res) => {
  res.send('Reset Password route hit')
}

exports.logout = (req, res) => {
  res.clearCookie('smartstore_token', {
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    sameSite: 'Lax'
  })
  res.json({ message: 'Logged out successfully' })
}


// OTP LOGIC HERE

const sendOtpBrevo = require('../utils/sendOtp')

exports.sendForgotOtp = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    user.otp = otp
    user.otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
    await user.save()

    await sendOtpBrevo.sendotp(email, otp)

    res.json({ message: 'OTP sent successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to send OTP' })
  }
}


// VERIFY OTP LOGIC HERE
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    user.otp = null
    user.otpExpires = null
    await user.save()

    res.json({ message: 'OTP verified successfully' })
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed' })
  }
}



exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: 'Password reset failed' })
  }
}
