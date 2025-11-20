const express = require('express')
const router = express.Router()
const authController = require('../controllers/authcontroller')
const authMiddleware=require('../middlewares/authmiddleware')
const passport = require('passport')
const jwt = require('jsonwebtoken')
// Routes
router.post('/register',authController.register)
router.post('/login', authController.login)
router.post('/forgot-password', authController.sendForgotOtp)
router.post('/verify-otp', authController.verifyOtp)
router.post('/reset-password', authController.resetPassword)
router.post('/logout', authController.logout)



// google routes 
// Step 1: Trigger Google login
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

// Step 2: Google callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Issue your own JWT cookie here
    const token = jwt.sign(
      {
        userId: req.user._id,
        role: req.user.role,
        storeId: req.user.storeId
      },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    )

    res.cookie('smartstore_token', token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: 'Lax',
      maxAge: 3 * 24 * 60 * 60 * 1000
    })

    // Redirect to frontend dashboard
    // Use FRONTEND_URL from environment or default to current origin
    const frontendUrl = process.env.FRONTEND_URL || (req.protocol + '://' + req.get('host'))
    res.redirect(`${frontendUrl}/dashboard`)
  }
)


//get info with protected route
router.get('/me', authMiddleware.isAuthenticated, (req, res) => {
  res.json({
    message: 'Authorized route accessed!',
    user: req.user // userId, role, storeId
  })
})
module.exports = router
