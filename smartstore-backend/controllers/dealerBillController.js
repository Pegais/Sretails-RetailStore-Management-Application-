const xlsx = require('xlsx');
const cloudinary = require('../config/cloudinary');
const DealerBill = require('../models/dealerBill');
const InventoryItem = require('../models/InvenotryItem');

function normalizeKey(key) {
  return key.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

function normalizeRowKeys(row) {
  const normalized = {};
  for (const key in row) {
    normalized[normalizeKey(key)] = row[key];
  }
  return normalized;
}

exports.uploadDealerBill = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;

    if (sheetNames.length < 2) {
      return res.status(400).json({ message: 'Excel file must contain two sheets: Dealer Metadata and Inventory Items' });
    }

    // ✅ Sheet 1: Dealer Metadata
    const dealerSheet = workbook.Sheets[sheetNames[0]];
    const dealerRaw = xlsx.utils.sheet_to_json(dealerSheet, { defval: '' });
    if (!dealerRaw || dealerRaw.length === 0) {
      return res.status(400).json({ message: 'Dealer metadata sheet is empty' });
    }

    const dealerRow = normalizeRowKeys(dealerRaw[0]);
    const dealerInfo = {
      dealerName: dealerRow.dealername || '',
      dealerGSTIN: dealerRow.dealergstin || '',
      invoiceDate: dealerRow.invoicedate || '',
      invoiceNumber: dealerRow.invoicenumber || '',
      totalAmount: parseFloat(dealerRow.totalamount || 0)
    };

    if (!dealerInfo.dealerName || !dealerInfo.invoiceDate) {
      return res.status(400).json({ message: 'Missing dealer name or invoice date in metadata sheet' });
    }

    // ✅ Sheet 2: Inventory Items
    const itemSheet = workbook.Sheets[sheetNames[1]];
    const itemRaw = xlsx.utils.sheet_to_json(itemSheet, { defval: '' });
    if (!itemRaw || itemRaw.length === 0) {
      return res.status(400).json({ message: 'Inventory items sheet is empty' });
    }

    // ✅ Upload to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'smartstore_inventory',
          public_id: `${Date.now()}-${originalName}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(fileBuffer);
    });

    const fileUrl = cloudinaryResult.secure_url;

    // ✅ Create DealerBill document
    const dealerBill = await DealerBill.create({
      dealerName: dealerInfo.dealerName,
      dealerGSTIN: dealerInfo.dealerGSTIN,
      invoiceDate: new Date(dealerInfo.invoiceDate),
      invoiceNumber: dealerInfo.invoiceNumber,
      totalAmount: dealerInfo.totalAmount,
      billType: 'excel',
      fileUrl,
      originalFileName: originalName,
      extractedText: '',
      meta: { dealerInfo, rawItems: itemRaw },
      storeId,
      uploadedBy: userId
    });

    // ✅ Save Inventory Items
    const savedItems = [];

    for (const rawRow of itemRaw) {
      const row = normalizeRowKeys(rawRow);
      if (!row.itemname || !row.quantity || !row.rate) continue;

      const item = {
        itemName: row.itemname,
        brand: row.brand || '',
        category: row.category || '',
        quantity: parseFloat(row.quantity),
        rate: parseFloat(row.rate),
        price:{
          mrp: parseFloat(row.mrp || row.rate),
        },
        unit: row.unit || 'pcs',
        meta:{
          hsn: row.hsn || '',
          
          discount: parseFloat(row.discount || 0),
          taxPercent: parseFloat(row.taxpercent || 18)
        },
        storeId,
        createdBy: userId,
        sourceBillId: dealerBill._id,
        dealer: {
          name: dealerInfo.dealerName,
          gstin: dealerInfo.dealerGSTIN || ''
        }
      };

      try {
        const newItem = await InventoryItem.create(item);
        savedItems.push(newItem._id);
      } catch (err) {
        console.warn('⚠️ Skipping item due to DB error:', item.itemName, err.message);
      }
    }

    // ✅ Link parsed items
    dealerBill.itemsParsed = savedItems;
    await dealerBill.save();

    return res.status(201).json({
      message: '✅ Dealer bill uploaded and inventory saved successfully',
      dealerPreview: dealerInfo,
      itemPreviewCount: savedItems.length,
      fileUrl,
      billId: dealerBill._id
    });

  } catch (err) {
    console.error('❌ Upload Error:', err);
    return res.status(500).json({
      message: 'Failed to upload or parse dealer bill',
      error: err.message
    });
  }
};
