const InventoryItem = require('../models/InvenotryItem');

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

  const priceFields = ['mrp', 'sellingPrice', 'ownerDealPrice']
  const missingPriceFields = item.price
    ? priceFields.filter(key => item.price[key] === undefined)
    : priceFields

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

      if (existing) {
        existing.quantity += item.quantity
        existing.updatedAt = new Date()
        await existing.save()
        return { status: 'updated', item: existing.itemName }
      } else {
        const newItem = new InventoryItem({
          ...item,
          itemName: normalize(item.itemName),
          brand: normalize(item.brand),
          category: normalize(item.category),
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
        return { status: 'created', item: newItem.itemName }
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






// @desc Get all items for a store
exports.getItemsByStore = async (req, res) => {
  try {
    const items = await InventoryItem.find({ storeId: req.params.storeId });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get single item
exports.getItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Update item


exports.updateItem = async (req, res) => {
  try {
    const itemId = req.params.id
    // const userId = req.userId

    const existingItem = await InventoryItem.findById(itemId)
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // ✅ Normalize string fields from request before update
    if (req.body.itemName) existingItem.itemName = normalize(req.body.itemName)
    if (req.body.brand) existingItem.brand = normalize(req.body.brand)
    if (req.body.category) existingItem.category = normalize(req.body.category)

    if (req.body.quantity !== undefined) existingItem.quantity = req.body.quantity
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

    res.status(200).json({ message: 'Item updated successfully', item: existingItem })

  } catch (err) {
    console.error('❌ Inventory update error:', err)
    res.status(500).json({ message: 'Internal Server Error', error: err.message })
  }
}

// @desc Delete item
exports.deleteItem = async (req, res) => {
  try {
    const deleted = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getItemsByStore = async (req, res) => {
  try {
    const storeId = req.user.storeId
    const items = await InventoryItem.find({ storeId }).sort({ updatedAt: -1 })
    console.log(items, "from items");

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