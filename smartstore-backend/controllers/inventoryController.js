const InventoryItem = require('../models/InvenotryItem');
const InventoryChangeLog = require('../models/InventoryChangeLog');

// @desc Create inventory item
// POST /api/inventory/add
const csv = require('csv-parser');
const xlsx = require('xlsx');
const Tesseract = require('tesseract.js');
const axios = require('axios');

const normalize = str => (typeof str === 'string' ? str.trim().toLowerCase() : str)

const validateItem = (item) => {
  const requiredFields = ['itemName', 'brand', 'category', 'price']
  const missingFields = requiredFields.filter(key => !item[key])

  // Only MRP and sellingPrice are required in price object, ownerDealPrice is optional
  const requiredPriceFields = ['mrp', 'sellingPrice']
  const missingPriceFields = item.price
    ? requiredPriceFields.filter(key => item.price[key] === undefined || item.price[key] === null)
    : requiredPriceFields

  if (missingFields.length || missingPriceFields.length) {
    return `Missing fields: ${[...missingFields, ...missingPriceFields].join(', ')}`
  }

  return null
}
exports.createInventoryItems = async (req, res) => {
  console.log(req.user, "from req user");

  try {
    const userId = req.user?.userId
    const storeId = req.user?.storeId

    if (!userId || !storeId) {
      return res.status(401).json({ message: 'Authentication failed: user/store context missing' })
    }

    const payload = req.body

    const handleItem = async (item, userId, storeId) => {
      const error = validateItem(item)
      if (error) return { status: 'error', itemName: item.itemName, reason: error }

      const filter = {
        itemName: normalize(item.itemName),
        brand: normalize(item.brand),
        category: normalize(item.category),
        'specifications.size': normalize(item.specifications?.size),
        'specifications.color': normalize(item.specifications?.color),
        'specifications.material': normalize(item.specifications?.material),
        'specifications.variant': normalize(item.specifications?.variant),
        storeId
      }

      const existing = await InventoryItem.findOne(filter)

      const incomingQuantity = Number(item.quantity) || 0

      if (existing) {
        const currentQuantity = Number(existing.quantity) || 0
        existing.quantity = currentQuantity + incomingQuantity
        existing.updatedAt = new Date()
        await existing.save()
        return { status: 'updated', item: existing.itemName }
      } else {
        const newItem = new InventoryItem({
          ...item,
          itemName: normalize(item.itemName),
          brand: normalize(item.brand),
          category: normalize(item.category),
          quantity: incomingQuantity,
          specifications: {
            ...item.specifications,
            size: normalize(item.specifications?.size),
            color: normalize(item.specifications?.color),
            material: normalize(item.specifications?.material),
            variant: normalize(item.specifications?.variant),
          },
          createdBy: userId,
          storeId: storeId
        })
        await newItem.save()
        return { status: 'created'}
      }
    }

    if (Array.isArray(payload)) {
      const results = await Promise.all(payload.map(item => handleItem(item, userId, storeId)))
      const summary = {
        created: results.filter(r => r.status === 'created'),
        updated: results.filter(r => r.status === 'updated'),
        failed: results.filter(r => r.status === 'error'),
      }
      return res.status(207).json({ message: 'Bulk upload processed', ...summary })
    }

    if (typeof payload === 'object' && payload !== null) {
      const result = await handleItem(payload, userId, storeId)
      if (result.status === 'error') {
        return res.status(400).json({ message: result.reason })
      }
      return res.status(200).json({ message: result.status, item: result.item })
    }

    return res.status(400).json({ message: 'Invalid payload' })
  } catch (err) {
    console.error('❌ Inventory upload error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}






// @desc Update item


// Helper function to log inventory changes
const logInventoryChange = async (itemId, storeId, userId, changeType, oldQuantity, newQuantity, reason = '', sourceBillId = null, metadata = {}) => {
  try {
    const quantityChange = newQuantity - oldQuantity
    await InventoryChangeLog.create({
      itemId,
      storeId,
      changedBy: userId,
      changeType,
      oldQuantity,
      newQuantity,
      quantityChange,
      reason,
      sourceBillId,
      metadata,
    })
  } catch (err) {
    console.error('Failed to log inventory change:', err)
    // Don't throw - logging failure shouldn't break the main operation
  }
}

exports.updateItem = async (req, res) => {
  try {
    const itemId = req.params.id
    const userId = req.user?.userId
    const storeId = req.user?.storeId || req.body.storeId

    const existingItem = await InventoryItem.findById(itemId)
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Check if user has permission (same store)
    if (storeId && existingItem.storeId.toString() !== storeId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Item belongs to different store' })
    }

    const oldQuantity = existingItem.quantity || 0
    let quantityChanged = false
    let changeType = 'item_updated'

    // ✅ Normalize string fields from request before update
    if (req.body.itemName) existingItem.itemName = normalize(req.body.itemName)
    if (req.body.brand) existingItem.brand = normalize(req.body.brand)
    if (req.body.category) existingItem.category = normalize(req.body.category)

    if (req.body.quantity !== undefined) {
      const newQty = Number(req.body.quantity) || 0
      if (newQty !== oldQuantity) {
        quantityChanged = true
        const qtyDiff = newQty - oldQuantity
        if (qtyDiff > 0) {
          changeType = 'quantity_increase'
        } else if (qtyDiff < 0) {
          changeType = 'quantity_decrease'
        } else {
          changeType = 'quantity_set'
        }
      }
      existingItem.quantity = newQty
    }
    if (req.body.unit) existingItem.unit = req.body.unit

    if (req.body.specifications) {
      existingItem.specifications = {
        size: normalize(req.body.specifications.size),
        color: normalize(req.body.specifications.color),
        weight: normalize(req.body.specifications.weight),
        material: normalize(req.body.specifications.material),
        dimensions: normalize(req.body.specifications.dimensions),
        variant: normalize(req.body.specifications.variant)
      }
    }

    if (req.body.price) {
      existingItem.price = {
        mrp: req.body.price.mrp,
        sellingPrice: req.body.price.sellingPrice,
        ownerDealPrice: req.body.price.ownerDealPrice
      }
    }

    if (req.body.description) existingItem.description = req.body.description
    if (req.body.barcode) existingItem.barcode = req.body.barcode
    if (req.body.images) existingItem.images = req.body.images
    if (req.body.tags) existingItem.tags = req.body.tags.map(normalize)
    if (req.body.searchKeywords) existingItem.searchKeywords = req.body.searchKeywords.map(normalize)
    if (req.body.meta) existingItem.meta = req.body.meta
    if (req.body.status) existingItem.status = req.body.status

    existingItem.updatedAt = new Date()

    await existingItem.save()

    // Log the change if quantity changed
    if (quantityChanged && userId) {
      await logInventoryChange(
        itemId,
        existingItem.storeId,
        userId,
        changeType,
        oldQuantity,
        existingItem.quantity,
        req.body.reason || 'Manual update',
        null,
        { updatedFields: Object.keys(req.body) }
      )
    }

    res.status(200).json({ message: 'Item updated successfully', item: existingItem })

  } catch (err) {
    console.error('❌ Inventory update error:', err)
    res.status(500).json({ message: 'Internal Server Error', error: err.message })
  }
}

// @desc Delete item
exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user?.userId
    const storeId = req.user?.storeId

    const item = await InventoryItem.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Check if user has permission (same store)
    if (storeId && item.storeId.toString() !== storeId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Item belongs to different store' })
    }

    // Log deletion before deleting
    if (userId) {
      await logInventoryChange(
        item._id,
        item.storeId,
        userId,
        'item_deleted',
        item.quantity || 0,
        0,
        req.body.reason || 'Item deleted',
        null,
        { itemName: item.itemName }
      )
    }

    await InventoryItem.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Item deleted successfully' })
  } catch (err) {
    console.error('❌ Inventory delete error:', err)
    res.status(500).json({ error: err.message })
  }
}

// @desc Get inventory suggestions for autocomplete
// GET /api/inventory/suggestions?query=samsung&limit=10
exports.getInventorySuggestions = async (req, res) => {
  try {
    const storeId = req.user?.storeId
    const { query = '', limit = 10 } = req.query

    if (!storeId) {
      return res.status(401).json({ error: 'Store context missing' })
    }

    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] })
    }

    const searchQuery = query.trim()
    const searchRegex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    // Find items matching the query (itemName, brand, or category)
    const matchingItems = await InventoryItem.find({
      storeId,
      $or: [
        { itemName: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
      ],
    })
      .select('itemName brand category price quantity unit specifications addedAt createdAt')
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(parseInt(limit) * 2) // Get more to calculate frequency

    // Calculate frequency and last used date
    const itemMap = new Map()
    matchingItems.forEach((item) => {
      const key = `${normalize(item.itemName)}|${normalize(item.brand)}|${normalize(item.category)}`
      const existing = itemMap.get(key)
      
      if (!existing) {
        itemMap.set(key, {
          itemName: item.itemName,
          brand: item.brand,
          category: item.category,
          price: item.price,
          unit: item.unit,
          specifications: item.specifications,
          frequency: 1,
          lastUsed: item.updatedAt || item.createdAt,
          firstSeen: item.createdAt,
        })
      } else {
        existing.frequency++
        if (new Date(item.updatedAt || item.createdAt) > new Date(existing.lastUsed)) {
          existing.lastUsed = item.updatedAt || item.createdAt
        }
      }
    })

    // Convert to array and sort by frequency and recency
    const suggestions = Array.from(itemMap.values())
      .sort((a, b) => {
        // First by frequency (most used first)
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency
        }
        // Then by recency (most recent first)
        return new Date(b.lastUsed) - new Date(a.lastUsed)
      })
      .slice(0, parseInt(limit))

    res.json({ suggestions })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    res.status(500).json({ error: error.message })
  }
}

// @desc Get recent items for quick add
// GET /api/inventory/recent?limit=10
exports.getRecentItems = async (req, res) => {
  try {
    const storeId = req.user?.storeId
    const { limit = 10 } = req.query

    if (!storeId) {
      return res.status(401).json({ error: 'Store context missing' })
    }

    // Get recently added/updated items
    const recentItems = await InventoryItem.find({ storeId })
      .select('itemName brand category price quantity unit specifications updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))

    // Group by unique combinations and get most recent
    const itemMap = new Map()
    recentItems.forEach((item) => {
      const key = `${normalize(item.itemName)}|${normalize(item.brand)}|${normalize(item.category)}`
      const existing = itemMap.get(key)
      
      if (!existing || new Date(item.updatedAt) > new Date(existing.updatedAt)) {
        itemMap.set(key, {
          itemName: item.itemName,
          brand: item.brand,
          category: item.category,
          price: item.price,
          unit: item.unit,
          specifications: item.specifications,
          lastUsed: item.updatedAt || item.createdAt,
        })
      }
    })

    const recent = Array.from(itemMap.values())
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, parseInt(limit))

    res.json({ recent })
  } catch (error) {
    console.error('Error fetching recent items:', error)
    res.status(500).json({ error: error.message })
  }
}

// @desc Get inventory change logs (last 3 days only)
exports.getInventoryChangeLogs = async (req, res) => {
  try {
    const storeId = req.user?.storeId || req.params.storeId
    const itemId = req.query.itemId
    const limit = parseInt(req.query.limit) || 50
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    // Only fetch logs from last 3 days
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const query = {
      storeId,
      createdAt: { $gte: threeDaysAgo },
    }
    if (itemId) query.itemId = itemId

    const logs = await InventoryChangeLog.find(query)
      .populate('itemId', 'itemName brand category')
      .populate('changedBy', 'name email')
      .populate('sourceBillId', 'originalFileName dealerName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await InventoryChangeLog.countDocuments(query)

    res.status(200).json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('❌ Error fetching change logs:', err)
    res.status(500).json({ error: err.message })
  }
}

// @desc Update quantity (convenience endpoint)
exports.updateQuantity = async (req, res) => {
  try {
    const itemId = req.params.id
    const userId = req.user?.userId
    const storeId = req.user?.storeId
    const { quantity, action, amount, reason } = req.body // action: 'set', 'increase', 'decrease'

    const item = await InventoryItem.findById(itemId)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    if (storeId && item.storeId.toString() !== storeId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const oldQuantity = item.quantity || 0
    let newQuantity = oldQuantity
    let changeType = 'quantity_set'

    if (action === 'set' && quantity !== undefined) {
      newQuantity = Number(quantity) || 0
      changeType = 'quantity_set'
    } else if (action === 'increase' && amount !== undefined) {
      newQuantity = oldQuantity + Number(amount)
      changeType = 'quantity_increase'
    } else if (action === 'decrease' && amount !== undefined) {
      newQuantity = Math.max(0, oldQuantity - Number(amount))
      changeType = 'quantity_decrease'
    } else {
      return res.status(400).json({ message: 'Invalid action or missing parameters' })
    }

    item.quantity = newQuantity
    item.updatedAt = new Date()
    await item.save()

    // Log the change
    if (userId) {
      await logInventoryChange(
        itemId,
        item.storeId,
        userId,
        changeType,
        oldQuantity,
        newQuantity,
        reason || `Quantity ${action}`,
        null,
        { action, amount: amount || quantity }
      )
    }

    res.status(200).json({
      message: 'Quantity updated successfully',
      item,
      oldQuantity,
      newQuantity,
    })
  } catch (err) {
    console.error('❌ Quantity update error:', err)
    res.status(500).json({ error: err.message })
  }
}


exports.getItemsByStore = async (req, res) => {
  try {
    const storeId = req.params.storeId || req.user.storeId
    if (!storeId) {
      return res.status(400).json({ error: 'Store id missing in request' })
    }
    const items = await InventoryItem.find({ storeId }).sort({ updatedAt: -1 })

    res.json(items)
  } catch (err) {
    console.error('Error fetching store inventory:', err)
    res.status(500).json({ error: 'Failed to load inventory' })
  }
};


exports.getItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching item by ID:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

exports.uploadImageToInventory = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Find the inventory item
    const inventoryItem = await InventoryItem.findById(itemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Validate uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Add uploaded Cloudinary URLs to item
    const newImageUrls = req.files.map((file) => file.path);
    inventoryItem.images.push(...newImageUrls);

    // Update timestamp
    inventoryItem.updatedAt = new Date();

    await inventoryItem.save();

    res.status(200).json({
      message: 'Images uploaded and linked successfully',
      images: inventoryItem.images,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
}



// dealer bill reading through OCR and excel files formatter
exports.dealerBillUploadController=async (req, res) => {
  try {
    const file = req.file;
    const fileUrl = file.path;
    const fileName = file.originalname;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const extension = fileName.split('.').pop().toLowerCase();

    if (['csv', 'xls', 'xlsx'].includes(extension)) {
      // === Parse CSV or Excel ===
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const workbook = xlsx.read(response.data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);

      // TODO: Map & sanitize fields before saving
      return res.status(200).json({ dataExtracted: jsonData });
    }

    if (['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
      // === OCR with Tesseract ===
      const { data: imageBuffer } = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });

      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');

      // TODO: Extract lines → fields like item, quantity, price from text
      return res.status(200).json({ ocrText: text });
    }

    return res.status(400).json({ error: 'Unsupported file format' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};