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
app.use(cookieParser())
const isProduction = process.env.NODE_ENV === 'production'
app.use(
  session({
    name: 'smartstore-session',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    keys: [process.env.JWT_SECRET],
    secure: isProduction, // true for HTTPS in production
    sameSite: isProduction ? 'None' : 'Lax', // 'None' required for cross-origin cookies
    httpOnly: true
  })
)

app.use(passport.initialize())
app.use(passport.session())
//used to jwt cookie

// Middlewares
// CORS Configuration for cross-origin cookie sharing
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173']

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) return callback(null, true)
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Required for cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}))


app.use(express.json())


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
