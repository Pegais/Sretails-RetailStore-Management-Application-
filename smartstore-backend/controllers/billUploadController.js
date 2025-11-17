// controllers/billUploadController.js
const s3UploadService = require('../services/s3UploadService');
const billProcessingQueue = require('../queues/billProcessQueue');
const DealerBill = require('../models/dealerBill');

exports.uploadBillImage = async (req, res) => {
  try {
    const { storeId, userId } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    const fileName = req.file.originalname;

    // Step 1: Upload to S3 (fast)
    console.log('📤 Uploading to S3...');
    const { s3Url, s3Key, size } = await s3UploadService.uploadBillImage(
      buffer, 
      fileName, 
      storeId
    );

    // Step 2: Create DealerBill entry (pending status)
    const dealerBill = await DealerBill.create({
      storeId,
      uploadedBy: userId,
      billType: 'image',
      fileUrl: s3Url,
      s3Key,
      originalFileName: fileName,
      status: 'pending', // Will be updated by worker
      meta: { fileSize: size }
    });

    // Step 3: Add to processing queue (background)
    await billProcessingQueue.add({
      billId: dealerBill._id,
      s3Key,
      storeId,
      userId
    });

    console.log(`🎯 Bill ${dealerBill._id} added to queue`);

    // Step 4: Return immediately
    return res.status(202).json({
      success: true,
      message: '✅ Bill uploaded! Processing in background...',
      billId: dealerBill._id,
      status: 'pending',
      estimatedTime: '30-60 seconds'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Failed to upload bill',
      details: error.message
    });
  }
};

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