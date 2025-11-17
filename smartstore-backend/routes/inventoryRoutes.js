const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { isAuthenticated, isManagerOrOwner } = require('../middlewares/authmiddleware'); // Protect routes if needed
const upload = require('../middlewares/multerUpload');


// IMPORTANT: Specific routes must come BEFORE parameterized routes (/:id)
// Otherwise Express will match /:id first and treat "suggestions" as an ID

router.get('/', isAuthenticated, isManagerOrOwner, inventoryController.getItemsByStore)
router.get('/store/:storeId', isAuthenticated, isManagerOrOwner, inventoryController.getItemsByStore)
router.get('/barcode/:barcode', isAuthenticated, isManagerOrOwner, inventoryController.findByBarcode)
router.post('/', isAuthenticated, isManagerOrOwner, inventoryController.createInventoryItems)

// Quick Add suggestions (must be before /:id route)
router.get('/suggestions', isAuthenticated, isManagerOrOwner, inventoryController.getInventorySuggestions)
router.get('/recent', isAuthenticated, isManagerOrOwner, inventoryController.getRecentItems)

// Change logs (must be before /:id route)
router.get('/logs/changes', isAuthenticated, isManagerOrOwner, inventoryController.getInventoryChangeLogs)

// Quantity management (must be before /:id route)
router.patch('/:id/quantity', isAuthenticated, isManagerOrOwner, inventoryController.updateQuantity)

// Upload routes
router.post(
  '/upload-images/:itemId',
  isAuthenticated,
  isManagerOrOwner,
  upload.array('images', 5),
  inventoryController.uploadImageToInventory
)

router.post(
  '/dealer-bill-upload',
  isAuthenticated,
  isManagerOrOwner,
  upload.single('file'),
  inventoryController.dealerBillUploadController
)

// Parameterized routes (must come LAST)
router.get('/:id', isAuthenticated, isManagerOrOwner, inventoryController.getItem)
router.put('/:id', isAuthenticated, isManagerOrOwner, inventoryController.updateItem)
router.delete('/:id', isAuthenticated, isManagerOrOwner, inventoryController.deleteItem)

module.exports = router;
