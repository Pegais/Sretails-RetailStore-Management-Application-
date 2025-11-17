const cloudinary = require('../config/cloudinary');
const DealerBill = require('../models/dealerBill');
const InventoryItem = require('../models/InvenotryItem');
const { parseDealerWorkbook } = require('../utils/dealerBillExcelParser');

exports.uploadDealerBill = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    const { dealerInfo, itemRows } = parseDealerWorkbook(fileBuffer, originalName);

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
      meta: { dealerInfo, rawItems: itemRows },
      storeId,
      uploadedBy: userId
    });

    // ✅ Save Inventory Items
    const savedItems = [];

    for (const row of itemRows) {
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
