const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
require('./workers/billProcessor')

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
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

//used to jwt cookie
app.use(cookieParser())

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err))

// Routes
const inventoryRoutes = require('./routes/inventoryRoutes');
const authRoutes = require('./routes/authRoutes')
const multerRoute=require('./routes/multerUploadRoute')
const dealerRoute=require('./routes/dealerBillRoute');
const paymentRoutes =require('./routes/paymentRoutes')
const billRoutes =require('./routes/billRoute');
app.use('/auth', authRoutes)

//Inventory routes
app.use('/api/inventory', inventoryRoutes);
//FILE uplaod routes
app.use('/api/multer',multerRoute)

//dealer bill route
app.use('/api/bill',dealerRoute)


//billUpload
app.use('/dealer/bill',billRoutes);

//paytmentroutes
app.use('/dealer/payment',paymentRoutes)


// Server start
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
