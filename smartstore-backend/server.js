const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config()


const passport = require('./config/passport')
const session = require('cookie-session')


const app = express()
// Cookie Session config
app.use(
  session({
    name: 'smartstore-session',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    keys: [process.env.JWT_SECRET]
  })
)

app.use(passport.initialize())
app.use(passport.session())

// Middlewares
// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // Add common local network IPs (192.168.x.x, 10.0.x.x, 172.16.x.x - 172.31.x.x)
  /^http:\/\/192\.168\.\d+\.\d+:5173$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+:5173$/,
]

// Add production frontend URL from environment
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL)
  // Also add without port if it's an IP
  const frontendUrl = process.env.FRONTEND_URL
  if (frontendUrl.startsWith('http://') || frontendUrl.startsWith('https://')) {
    try {
      const url = new URL(frontendUrl)
      // Add version without port
      allowedOrigins.push(`${url.protocol}//${url.hostname}`)
      // Also add with port 80/443 if not specified
      if (!url.port) {
        if (url.protocol === 'https:') {
          allowedOrigins.push(`${url.protocol}//${url.hostname}:443`)
        } else {
          allowedOrigins.push(`${url.protocol}//${url.hostname}:80`)
        }
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)
      
      // In production, be more strict
      if (process.env.NODE_ENV === 'production') {
        // Check if origin matches allowed patterns
        const isAllowed = allowedOrigins.some((pattern) => {
          if (typeof pattern === 'string') {
            // Exact match
            if (origin === pattern) return true
            // Match without port (http://IP and http://IP:80 are same)
            const originUrl = new URL(origin)
            const patternUrl = new URL(pattern)
            if (originUrl.protocol === patternUrl.protocol && 
                originUrl.hostname === patternUrl.hostname) {
              return true
            }
            return false
          }
          return pattern.test(origin)
        })
        
        if (isAllowed) {
          callback(null, true)
        } else {
          console.warn(`CORS blocked origin in production: ${origin}`)
          console.warn(`Allowed origins:`, allowedOrigins.filter(p => typeof p === 'string'))
          callback(new Error('Not allowed by CORS'))
        }
      } else {
        // In development, allow all
        callback(null, true)
      }
    },
    credentials: true,
  })
)
app.use(express.json())

//used to jwt cookie
app.use(cookieParser())

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err))


//STARTING WORKER
require('./workers/billProcessor')
console.log('🔥 Background worker started. Waiting for jobs...');
// Routes
const inventoryRoutes = require('./routes/inventoryRoutes');
const authRoutes = require('./routes/authRoutes')
const multerRoute=require('./routes/multerUploadRoute')
const dealerRoute=require('./routes/dealerBillRoute');
const paymentRoutes =require('./routes/paymentRoutes')
const billRoutes =require('./routes/billRoute');
const salesRoutes = require('./routes/salesRoutes')
const barcodeRoutes = require('./routes/barcodeRoutes')
app.use('/auth', authRoutes)

//Inventory routes
app.use('/api/inventory', inventoryRoutes);
//FILE uplaod routes
app.use('/api/multer',multerRoute)

//dealer bill route
// app.use('/api/bill',dealerRoute)


//billUpload
app.use('/dealer/bill',billRoutes);

//paytmentroutes
app.use('/dealer/payment',paymentRoutes)

//sales routes
app.use('/api/sales', salesRoutes)

//barcode routes
app.use('/api/barcode', barcodeRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Server start
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
