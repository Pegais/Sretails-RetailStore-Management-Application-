const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/Users')
const Store = require('../models/Store')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ googleId: profile.id })

    if (existingUser) return done(null, existingUser)

    // If not found, create new user with dummy store for now
    const tempStore = await Store.create({
      name: `Store-${profile.displayName}`,
      storeCode: `store-${Date.now()}`, // always unique
      ownerId: null
    })

    const newUser = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      role: 'owner', // or 'manager' based on your flow
      storeId: tempStore._id
    })

    tempStore.ownerId = newUser._id
    await tempStore.save()

    return done(null, newUser)
  } catch (err) {
    console.error(err)
    return done(err, null)
  }
}))

// ✅ Serializers at the end
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

module.exports = passport
