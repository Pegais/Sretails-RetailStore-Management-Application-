const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { isAuthenticated, isManagerOrOwner } = require('../middlewares/authmiddleware'); // Protect routes if needed
const upload = require('../middlewares/multerUpload');


// 🟢 Public routes for customers
router.get('/', isAuthenticated, isManagerOrOwner, inventoryController.getItemsByStore); // read-only
router.get('/:id', inventoryController.getItem);


// Protected routes
// CRUD Routes
router.post('/', isAuthenticated, isManagerOrOwner, inventoryController.createInventoryItems);
router.get('/store/:storeId', isAuthenticated, isManagerOrOwner, inventoryController.getItemsByStore);
router.get('/:id', isAuthenticated, isManagerOrOwner, inventoryController.getItem);
router.put('/:id', isAuthenticated, isManagerOrOwner, inventoryController.updateItem);
router.delete('/:id', isAuthenticated, isManagerOrOwner, inventoryController.deleteItem);
// Upload images and update InventoryItem's images array
router.post(
    '/upload-images/:itemId',
    upload.array('images', 5), // allow up to 5 images
    inventoryController.uploadImageToInventory
);

// for dealer bill upload
router.post(
    '/dealer-bill-upload',
    upload.single('file'),
   inventoryController.dealerBillUploadController
);

module.exports = router;
