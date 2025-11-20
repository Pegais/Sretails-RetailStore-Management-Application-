# SmartStore 🏪

A comprehensive **Point-of-Sale (POS) and Inventory Management SaaS Platform** built for modern retail businesses. SmartStore streamlines store operations through automated inventory tracking, AI-powered bill processing, real-time sales management, and intelligent analytics.

![SmartStore](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB)
![Node](https://img.shields.io/badge/Node.js-Express-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-8.16-47A248)

## 🌟 Features

### 📦 Inventory Management
- **Real-time Stock Tracking**: Monitor inventory levels with instant updates across all operations
- **Smart Filters**: Categorize items by Low Stock, Slow Movers, Stale Items, and Active status
- **Quantity Management**: Increase, decrease, or set quantities with automatic logging
- **Inventory Change Logs**: Track all inventory modifications with 3-day history
- **Quick Add**: Intelligent autocomplete with frequency-based suggestions
- **Recent Items**: Quick access to frequently used inventory items

### 💳 Point of Sale (POS)
- **Barcode Scanning**: Camera-based barcode scanning for quick product lookup
- **Cart Management**: Add, remove, and adjust quantities seamlessly
- **Multi-Payment Support**: Accept Cash, UPI, Card, and Credit payments
- **Split Payments**: Handle mixed payment methods in a single transaction
- **Real-time Inventory Sync**: Automatic inventory deduction on sale completion
- **Sales History**: Complete transaction history with detailed analytics
- **Receipt Generation**: Digital receipts for all transactions

### 📄 Dealer Bill Processing
- **AI-Powered OCR**: Automatically extract data from JPEG/PNG bill images using Tesseract.js
- **Excel Import**: Parse .xls and .xlsx dealer bills automatically
- **GPT-4 Integration**: Intelligent text extraction and parsing using OpenAI API
- **Background Processing**: Asynchronous bill processing using Redis job queue
- **Duplicate Prevention**: Smart detection of duplicate bills
- **Cloud Storage**: Secure bill storage on AWS S3
- **Auto Inventory Creation**: Automatically create inventory items from bills

### 📊 Analytics & Dashboard
- **Real-time Revenue Metrics**: Live tracking of sales and revenue
- **Payment Analytics**: Cash vs Digital payment breakdowns
- **Low Stock Alerts**: Proactive notifications for inventory replenishment
- **Inventory Statistics**: Comprehensive inventory insights
- **Recent Activity**: Track all recent changes and transactions

### 👥 User Management
- **Role-Based Access Control**: Owner, Manager, and Staff roles with granular permissions
- **JWT Authentication**: Secure session management with HTTP-only cookies
- **Google OAuth**: One-click login with Google account
- **OTP-Based Password Reset**: Secure password recovery system
- **Multi-Store Support**: Architecture ready for multi-store operations

### 🌐 Internationalization
- **Multi-Language Support**: English and Hindi language options
- **Language Toggle**: Switch languages on-the-fly
- **Localized UI**: All components support i18n

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern UI library with hooks
- **Material UI v7** - Component library for responsive design
- **Zustand** - Lightweight state management
- **React Router v7** - Client-side routing
- **Formik & Yup** - Form handling and validation
- **Framer Motion** - Animation library
- **i18next** - Internationalization framework
- **Axios** - HTTP client
- **html5-qrcode** - Barcode scanning
- **Lottie React** - Animation components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web framework
- **MongoDB 8.16** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Redis 5.9** - Caching and job queue
- **Bull** - Job queue management
- **JWT** - Authentication tokens
- **Passport.js** - Authentication middleware
- **Tesseract.js** - OCR engine
- **OpenAI GPT-4** - AI text extraction
- **AWS S3** - Cloud storage
- **Cloudinary** - Image processing
- **Sharp** - Image optimization
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Bcrypt** - Password hashing

### DevOps
- **AWS EC2** - Cloud hosting
- **Nginx** - Reverse proxy and web server
- **PM2** - Process manager
- **Git** - Version control

## 📁 Project Structure

```
Sretails/
├── smartstore-frontend/          # React frontend application
│   ├── src/
│   │   ├── api/                  # API configuration
│   │   ├── components/           # Reusable UI components
│   │   │   ├── layouts/          # Layout components
│   │   │   ├── BarcodeScanner.jsx
│   │   │   └── ...
│   │   ├── pages/                # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── POSPage.jsx
│   │   │   └── ...
│   │   ├── store/                # State management (Zustand)
│   │   ├── i18n/                 # Internationalization
│   │   ├── services/             # Business logic
│   │   └── config/               # Configuration files
│   ├── public/                   # Static assets
│   └── package.json
│
├── smartstore-backend/           # Node.js backend application
│   ├── config/                   # Configuration files
│   │   ├── db.js                 # MongoDB connection
│   │   ├── passport.js           # Authentication config
│   │   └── cloudinary.js         # Cloudinary config
│   ├── controllers/              # Route controllers
│   │   ├── authcontroller.js
│   │   ├── inventoryController.js
│   │   ├── salesController.js
│   │   ├── barcodeController.js
│   │   └── ...
│   ├── models/                   # MongoDB models
│   │   ├── Store.js
│   │   ├── Users.js
│   │   ├── InvenotryItem.js
│   │   ├── Sale.js
│   │   └── ...
│   ├── routes/                   # Express routes
│   ├── middlewares/              # Custom middlewares
│   ├── services/                 # Business services
│   ├── queues/                   # Job queues
│   ├── workers/                  # Background workers
│   ├── utils/                    # Utility functions
│   ├── pdf-parser-flask/         # Python PDF parser
│   ├── server.js                 # Entry point
│   └── package.json
│
└── deploy/                       # Deployment scripts and docs
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**
- **AWS Account** (for S3 storage)
- **OpenAI API Key** (for AI bill parsing)
- **Google OAuth Credentials** (for Google login)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Sretails
```

#### 2. Backend Setup

```bash
cd smartstore-backend
npm install
```

Create a `.env` file in `smartstore-backend/`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smartstore

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

#### 3. Frontend Setup

```bash
cd smartstore-frontend
npm install
```

Create a `.env` file in `smartstore-frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

#### 4. Start MongoDB and Redis

**MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**Redis:**
```bash
# Windows
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

#### 5. Run the Application

**Start Backend:**
```bash
cd smartstore-backend
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

**Start Frontend:**
```bash
cd smartstore-frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔐 Authentication

### First-Time Setup

1. Navigate to the registration page
2. Create an **Owner** account (only owners can register)
3. Complete your store profile
4. Start adding inventory and processing sales

### User Roles

- **Owner**: Full access to all features, user management
- **Manager**: Can manage inventory, sales, and view reports
- **Staff**: Limited access to POS and inventory viewing

## 📖 Usage Guide

### Adding Inventory

1. Navigate to **Inventory** from the sidebar
2. Click **"Add Item"** or use **Quick Add**
3. Enter item details (name, brand, category, price, quantity)
4. Optionally add barcode for scanning
5. Save the item

### Processing a Sale

1. Go to **POS** from the sidebar
2. Search for items or scan barcode
3. Add items to cart
4. Adjust quantities as needed
5. Select payment method (Cash, UPI, Card, Credit)
6. Complete the transaction
7. Receipt will be generated automatically

### Uploading Dealer Bills

1. Navigate to **Dealer Bills** or **Uploaded Documents**
2. Click **"Upload Bill"**
3. Choose image file (JPEG/PNG) or Excel file (.xls/.xlsx)
4. Bill will be processed in the background
5. Check status in the uploaded documents page
6. Items will be automatically added to inventory

### Barcode Scanning

1. In POS or Inventory page, click the barcode scanner icon
2. Allow camera permissions
3. Point camera at barcode
4. Product will be automatically identified and added

## 🧪 Testing

```bash
# Frontend tests
cd smartstore-frontend
npm test

# Backend tests (if implemented)
cd smartstore-backend
npm test
```

## 🚢 Deployment

### AWS EC2 Deployment

Refer to the deployment documentation in the `deploy/` folder:

- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `QUICK_DEPLOYMENT_GUIDE.md` - Quick start guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

### Quick Deploy

```bash
# Build frontend
cd smartstore-frontend
npm run build

# Start backend with PM2
cd smartstore-backend
pm2 start server.js --name smartstore-backend

# Configure Nginx (see deploy/nginx-smartstore.conf)
```

## 🔧 Configuration

### Environment Variables

See the installation section for required environment variables. Make sure all secrets are properly configured before deploying to production.

### Database Indexing

The application includes optimized database indexes for performance. Indexes are automatically created on:
- Store IDs
- Sale dates
- User IDs
- Inventory item names and barcodes

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new owner
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/send-otp` - Send password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Inventory Endpoints

- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `POST /api/inventory/:id/quantity` - Update quantity

### Sales Endpoints

- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/store/:storeId` - Get sales by store

### Dealer Bill Endpoints

- `POST /api/dealer-bills/upload` - Upload dealer bill
- `GET /api/dealer-bills` - Get all bills
- `GET /api/dealer-bills/:id` - Get bill by ID

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Developed with ❤️ for modern retail businesses

## 🙏 Acknowledgments

- Material UI for the excellent component library
- OpenAI for GPT-4 API
- Tesseract.js community for OCR capabilities
- MongoDB for robust database solution
- React team for the amazing framework

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Made with React ⚛️ and Node.js 🟢**

