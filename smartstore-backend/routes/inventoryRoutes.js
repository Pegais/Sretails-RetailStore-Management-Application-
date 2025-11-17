const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { isAuthenticated, isManagerOrOwner } = require('../middlewares/authmiddleware'); // Protect routes if needed
const upload = require('../middlewares/multerUpload');


router.get('/', isAuthenticated, isManagerOrOwner, inventoryController.getItemsByStore)
router.get('/store/:storeId', isAuthenticated, isManagerOrOwner, inventoryController.getItemsByStore)
router.post('/', isAuthenticated, isManagerOrOwner, inventoryController.createInventoryItems)
router.get('/:id', isAuthenticated, isManagerOrOwner, inventoryController.getItem)
router.put('/:id', isAuthenticated, isManagerOrOwner, inventoryController.updateItem)
router.delete('/:id', isAuthenticated, isManagerOrOwner, inventoryController.deleteItem)

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

// Quantity management
router.patch('/:id/quantity', isAuthenticated, isManagerOrOwner, inventoryController.updateQuantity)

// Change logs
router.get('/logs/changes', isAuthenticated, isManagerOrOwner, inventoryController.getInventoryChangeLogs)

module.exports = router;
