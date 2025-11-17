const express = require('express')
const router = express.Router()
const salesController = require('../controllers/salesController')
const { isAuthenticated, isManagerOrOwner } = require('../middlewares/authmiddleware')

// All sales routes require authentication
// Create sale (any authenticated user can make sales)
router.post('/', isAuthenticated, salesController.createSale)

// Get sales (owner/manager only for privacy)
router.get('/', isAuthenticated, isManagerOrOwner, salesController.getSales)

// Get sale by ID
router.get('/:id', isAuthenticated, isManagerOrOwner, salesController.getSaleById)

// Cancel/Refund sale (owner/manager only)
router.patch('/:id/cancel', isAuthenticated, isManagerOrOwner, salesController.cancelSale)

// Get sales statistics
router.get('/stats/summary', isAuthenticated, isManagerOrOwner, salesController.getSalesStats)

module.exports = router

