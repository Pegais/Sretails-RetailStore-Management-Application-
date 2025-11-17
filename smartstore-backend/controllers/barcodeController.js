const barcodeService = require('../services/barcodeService')
const InventoryItem = require('../models/InvenotryItem')
const InventoryChangeLog = require('../models/InventoryChangeLog')

/**
 * @desc Lookup product information by barcode
 * GET /api/barcode/lookup/:barcode
 */
exports.lookupBarcode = async (req, res) => {
  try {
    const { barcode } = req.params

    // Validate barcode format
    const validation = barcodeService.validateBarcode(barcode)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Lookup product info
    const productInfo = await barcodeService.lookupBarcode(validation.barcode)

    if (!productInfo) {
      return res.status(404).json({
        error: 'Product not found',
        barcode: validation.barcode,
        message: 'Barcode not found in database. Please add product manually.',
      })
    }

    res.json({
      success: true,
      barcode: validation.barcode,
      productInfo,
    })
  } catch (error) {
    console.error('Error in lookupBarcode:', error)
    res.status(500).json({
      error: error.message || 'Failed to lookup barcode',
    })
  }
}

/**
 * @desc Check if barcode exists in inventory and get product info
 * GET /api/barcode/inventory/:barcode
 */
exports.checkInventoryByBarcode = async (req, res) => {
  try {
    const { storeId } = req.user
    const { barcode } = req.params

    // Validate barcode format
    const validation = barcodeService.validateBarcode(barcode)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Step 1: Check if item exists in inventory
    const inventoryItem = await InventoryItem.findOne({
      storeId,
      barcode: validation.barcode,
    })

    // Step 2: Get product info from API (if not in inventory or for reference)
    let productInfo = null
    try {
      productInfo = await barcodeService.lookupBarcode(validation.barcode)
    } catch (error) {
      console.warn('API lookup failed, continuing with inventory check:', error.message)
      // Continue even if API fails
    }

    if (inventoryItem) {
      // Item exists in inventory
      return res.json({
        success: true,
        barcode: validation.barcode,
        productInfo: productInfo || {
          itemName: inventoryItem.itemName,
          brand: inventoryItem.brand,
          category: inventoryItem.category,
          barcode: validation.barcode,
        },
        inventory: {
          exists: true,
          itemId: inventoryItem._id,
          itemName: inventoryItem.itemName,
          currentQuantity: Number(inventoryItem.quantity) || 0,
          price: inventoryItem.price,
          unit: inventoryItem.unit,
        },
      })
    }

    // Item doesn't exist in inventory
    res.json({
      success: true,
      barcode: validation.barcode,
      productInfo,
      inventory: {
        exists: false,
      },
    })
  } catch (error) {
    console.error('Error in checkInventoryByBarcode:', error)
    res.status(500).json({
      error: error.message || 'Failed to check inventory',
    })
  }
}

/**
 * @desc Complete scan flow: Lookup + Check Inventory + Update/Create
 * POST /api/barcode/scan
 */
exports.scanBarcode = async (req, res) => {
  try {
    const { storeId, userId } = req.user
    const { barcode, quantity = 1, addToCart = false } = req.body

    // Validate barcode format
    const validation = barcodeService.validateBarcode(barcode)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Step 1: Get product info from API
    let productInfo = null
    try {
      productInfo = await barcodeService.lookupBarcode(validation.barcode)
    } catch (error) {
      console.warn('API lookup failed:', error.message)
      // Continue - user can still add manually
    }

    // Step 2: Check if item exists in inventory
    let inventoryItem = await InventoryItem.findOne({
      storeId,
      barcode: validation.barcode,
    })

    const quantityToAdd = Number(quantity) || 1

    if (inventoryItem) {
      // Item exists - update quantity
      const oldQuantity = Number(inventoryItem.quantity) || 0
      const newQuantity = oldQuantity + quantityToAdd

      inventoryItem.quantity = newQuantity
      inventoryItem.updatedAt = new Date()
      await inventoryItem.save()

      // Log inventory change
      try {
        await InventoryChangeLog.create({
          itemId: inventoryItem._id,
          storeId,
          changedBy: userId,
          changeType: 'barcode_scan',
          oldQuantity,
          newQuantity,
          quantityChange: quantityToAdd,
          reason: `Barcode scanned: ${validation.barcode}`,
          metadata: { barcode: validation.barcode, scannedBy: userId },
        })
      } catch (logError) {
        console.error('Failed to log inventory change:', logError)
      }

      return res.json({
        success: true,
        message: 'Item quantity updated',
        barcode: validation.barcode,
        productInfo: productInfo || {
          itemName: inventoryItem.itemName,
          brand: inventoryItem.brand,
          category: inventoryItem.category,
        },
        inventory: {
          exists: true,
          itemId: inventoryItem._id,
          itemName: inventoryItem.itemName,
          oldQuantity,
          newQuantity,
          price: inventoryItem.price,
        },
        addToCart: addToCart,
      })
    } else {
      // Item doesn't exist - return info for manual creation
      return res.json({
        success: true,
        message: 'Item not found in inventory. Please create it.',
        barcode: validation.barcode,
        productInfo,
        inventory: {
          exists: false,
        },
        requiresCreation: true,
      })
    }
  } catch (error) {
    console.error('Error in scanBarcode:', error)
    res.status(500).json({
      error: error.message || 'Failed to scan barcode',
    })
  }
}

/**
 * @desc Create inventory item from barcode scan
 * POST /api/barcode/create-item
 */
exports.createItemFromBarcode = async (req, res) => {
  try {
    const { storeId, userId } = req.user
    const { barcode, itemName, brand, category, quantity = 1, price, unit = 'pcs' } = req.body

    // Validate barcode format
    const validation = barcodeService.validateBarcode(barcode)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Check if item already exists
    const existingItem = await InventoryItem.findOne({
      storeId,
      barcode: validation.barcode,
    })

    if (existingItem) {
      return res.status(400).json({
        error: 'Item with this barcode already exists',
        itemId: existingItem._id,
        itemName: existingItem.itemName,
      })
    }

    // Validate required fields
    if (!itemName) {
      return res.status(400).json({ error: 'Item name is required' })
    }

    if (!price || (!price.mrp && !price.sellingPrice)) {
      return res.status(400).json({ error: 'Price (MRP or Selling Price) is required' })
    }

    // Create inventory item
    const newItem = await InventoryItem.create({
      itemName: itemName.trim(),
      brand: (brand || '').trim(),
      category: (category || '').trim(),
      barcode: validation.barcode,
      quantity: Number(quantity) || 1,
      unit: unit || 'pcs',
      price: {
        mrp: Number(price.mrp) || Number(price.sellingPrice) || 0,
        sellingPrice: Number(price.sellingPrice) || Number(price.mrp) || 0,
      },
      storeId,
      createdBy: userId,
      status: 'active',
    })

    // Log inventory change
    try {
      await InventoryChangeLog.create({
        itemId: newItem._id,
        storeId,
        changedBy: userId,
        changeType: 'barcode_scan',
        oldQuantity: 0,
        newQuantity: newItem.quantity,
        quantityChange: newItem.quantity,
        reason: `Item created from barcode scan: ${validation.barcode}`,
        metadata: { barcode: validation.barcode, scannedBy: userId },
      })
    } catch (logError) {
      console.error('Failed to log inventory change:', logError)
    }

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: newItem,
    })
  } catch (error) {
    console.error('Error in createItemFromBarcode:', error)
    res.status(500).json({
      error: error.message || 'Failed to create item',
    })
  }
}

