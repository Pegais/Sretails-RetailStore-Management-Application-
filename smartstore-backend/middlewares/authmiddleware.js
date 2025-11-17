const jwt = require('jsonwebtoken')
const Users = require('../models/Users')

exports.isAuthenticated = async(req, res, next) => {
  const token = req.cookies.smartstore_token
  

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded);
    
    req.user = decoded
    next()
  } catch (err) {
    // console.log(err);
    
    return res.status(403).json({ message: 'Forbidden: Invalid token' })
  }
}

// ✅ 2. Owner only
exports.isOwner = (req, res, next) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ message: 'Only owner access allowed' })
  }
  next()
}

// ✅ 3. Owner or Manager
exports.isManagerOrOwner = (req, res, next) => {
  if (req.user?.role === 'owner' || req.user?.role === 'manager') {
    return next()
  }
  return res.status(403).json({ message: 'Access denied. Owner or Manager only.' })
}
