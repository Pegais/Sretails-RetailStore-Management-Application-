const express = require('express')
const router = express.Router()
const barcodeController = require('../controllers/barcodeController')
const { isAuthenticated, isManagerOrOwner } = require('../middlewares/authmiddleware')

// Public endpoint - just lookup product info (no auth needed for testing)
router.get('/lookup/:barcode', barcodeController.lookupBarcode)

// Authenticated endpoints
router.get('/inventory/:barcode', isAuthenticated, barcodeController.checkInventoryByBarcode)
router.post('/scan', isAuthenticated, barcodeController.scanBarcode)
router.post('/create-item', isAuthenticated, isManagerOrOwner, barcodeController.createItemFromBarcode)

module.exports = router

