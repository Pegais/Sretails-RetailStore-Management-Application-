// controllers/billUploadController.js
const path = require('path')
const s3UploadService = require('../services/s3UploadService')
const billProcessingQueue = require('../queues/billProcessQueue')
const DealerBill = require('../models/dealerBill')
const InventoryItem = require('../models/InvenotryItem')
const { parseDealerWorkbook } = require('../utils/dealerBillExcelParser')

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']
const EXCEL_EXTENSIONS = ['.xls', '.xlsx']

const { findOrCreateInventoryItem } = require('../utils/inventoryHelper')

const normalize = (str) => (typeof str === 'string' ? str.trim().toLowerCase() : str)
const toNumber = (value, fallback = 0) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const handleImageUpload = async ({ buffer, fileName, storeId, userId }) => {
  const { s3Url, s3Key, size } = await s3UploadService.uploadBillImage(buffer, fileName, storeId)

  const dealerBill = await DealerBill.create({
    storeId,
    uploadedBy: userId,
    billType: 'image',
    fileUrl: s3Url,
    s3Key,
    originalFileName: fileName,
    status: 'pending',
    meta: { fileSize: size },
  })

  await billProcessingQueue.add({
    billId: dealerBill._id,
    s3Key,
    storeId,
    userId,
  })

  return {
    responseCode: 202,
    payload: {
      success: true,
      mode: 'image',
      message: '✅ Bill uploaded! Processing in background...',
      billId: dealerBill._id,
      status: 'pending',
      estimatedTime: '30-60 seconds',
    },
  }
}

const handleExcelUpload = async ({ buffer, fileName, mimetype, storeId, userId }) => {
  const { dealerInfo, itemRows } = parseDealerWorkbook(buffer, fileName)

  const uploadInfo = await s3UploadService.uploadBillFile(buffer, fileName, storeId, {
    contentType: mimetype,
  })

  const dealerBill = await DealerBill.create({
    storeId,
    uploadedBy: userId,
    billType: 'excel',
    fileUrl: uploadInfo.s3Url,
    s3Key: uploadInfo.s3Key,
    originalFileName: fileName,
    status: 'completed',
    meta: {
      dealerInfo,
      rowsParsed: itemRows.length,
      fileSize: uploadInfo.size,
    },
    dealerName: dealerInfo.dealerName,
    dealerGSTIN: dealerInfo.dealerGSTIN,
    invoiceDate: new Date(dealerInfo.invoiceDate),
    invoiceNumber: dealerInfo.invoiceNumber,
    totalAmount: dealerInfo.totalAmount,
    processedAt: new Date(),
  })

  const savedItems = []
  let itemsCreated = 0
  let itemsUpdated = 0

  for (const row of itemRows) {
    const qty = toNumber(row.quantity, null)
    const basePrice = toNumber(row.rate, null)

    if (qty === null || basePrice === null || !row.itemname) continue

    const itemPayload = {
      itemName: row.itemname, // Don't normalize here, let helper do it
      brand: row.brand || '',
      category: row.category || '',
      quantity: qty,
      unit: row.unit || 'pcs',
      specifications: {
        size: normalize(row.size),
        color: normalize(row.color),
        material: normalize(row.material),
        variant: normalize(row.variant),
      },
      price: {
        mrp: toNumber(row.mrp || basePrice, basePrice),
        sellingPrice: basePrice,
        ownerDealPrice: toNumber(row.ownerdealprice, undefined),
      },
      meta: {
        hsn: row.hsn || '',
        discount: toNumber(row.discount, 0),
        taxPercent: toNumber(row.taxpercent, 18),
      },
      storeId,
      createdBy: userId,
      sourceBillId: dealerBill._id,
      dealer: {
        name: dealerInfo.dealerName,
        gstin: dealerInfo.dealerGSTIN || '',
        billId: dealerBill._id,
      },
    }

    try {
      const result = await findOrCreateInventoryItem(itemPayload, storeId)
      savedItems.push(result.item._id)
      
      if (result.action === 'created') {
        itemsCreated++
        console.log(`✅ Created new item: ${itemPayload.itemName}`)
      } else if (result.action === 'updated') {
        itemsUpdated++
        console.log(`🔄 Updated quantity for: ${itemPayload.itemName} (${result.oldQuantity} → ${result.newQuantity})`)
      }
    } catch (err) {
      console.warn('⚠️ Skipping item due to DB error:', row.itemname, err.message)
    }
  }

  dealerBill.itemsParsed = savedItems
  dealerBill.meta = {
    ...dealerBill.meta,
    itemsSaved: savedItems.length,
    itemsCreated,
    itemsUpdated,
  }
  await dealerBill.save()

  return {
    responseCode: 201,
    payload: {
      success: true,
      mode: 'excel',
      message: `✅ Dealer bill parsed: ${itemsCreated} new items, ${itemsUpdated} updated`,
      billId: dealerBill._id,
      dealerPreview: dealerInfo,
      itemsCreated,
      itemsUpdated,
      itemsTotal: savedItems.length,
      fileUrl: dealerBill.fileUrl,
    },
  }
}

exports.uploadBillImage = async (req, res) => {
  try {
    const { storeId, userId } = req.user

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const buffer = req.file.buffer
    const fileName = req.file.originalname
    const mimetype = req.file.mimetype
    const extension = path.extname(fileName).toLowerCase()

    if (IMAGE_EXTENSIONS.includes(extension)) {
      const result = await handleImageUpload({ buffer, fileName, storeId, userId })
      return res.status(result.responseCode).json(result.payload)
    }

    if (EXCEL_EXTENSIONS.includes(extension)) {
      const result = await handleExcelUpload({ buffer, fileName, mimetype, storeId, userId })
      return res.status(result.responseCode).json(result.payload)
    }

    return res.status(400).json({
      error: 'Unsupported file format. Upload .jpeg/.jpg for snapshot bills or .xls/.xlsx for spreadsheets.',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      error: 'Failed to upload bill',
      details: error.message,
    })
  }
}

// Check processing status
exports.getBillStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { storeId } = req.user;

    const bill = await DealerBill.findOne({ 
      _id: billId, 
      storeId 
    }).populate('itemsParsed', 'itemName quantity price');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    return res.json({
      billId: bill._id,
      status: bill.status, // pending, processing, completed, failed, manual_review_needed
      itemsExtracted: bill.itemsParsed?.length || 0,
      dealerName: bill.dealerName,
      totalAmount: bill.totalAmount,
      confidence: bill.meta?.ocrConfidence,
      processedAt: bill.processedAt,
      items: bill.itemsParsed
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all bills for a store
exports.getAllBills = async (req, res) => {
  try {
    const { storeId } = req.user;
    const { page = 1, limit = 20, status, billType } = req.query;

    const query = { storeId };
    if (status) query.status = status;
    if (billType) query.billType = billType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bills = await DealerBill.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name email')
      .select('-extractedText -meta.rawItems'); // Exclude large fields

    const total = await DealerBill.countDocuments(query);

    return res.json({
      bills: bills.map((bill) => ({
        _id: bill._id,
        dealerName: bill.dealerName,
        dealerGSTIN: bill.dealerGSTIN,
        invoiceNumber: bill.invoiceNumber,
        invoiceDate: bill.invoiceDate,
        totalAmount: bill.totalAmount,
        billType: bill.billType,
        fileUrl: bill.fileUrl,
        originalFileName: bill.originalFileName,
        status: bill.status,
        itemsParsed: bill.itemsParsed?.length || 0,
        uploadedAt: bill.uploadedAt,
        processedAt: bill.processedAt,
        uploadedBy: bill.uploadedBy,
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({ error: error.message });
  }
};