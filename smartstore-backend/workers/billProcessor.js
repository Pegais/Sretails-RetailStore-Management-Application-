// workers/billProcessor.js
const billProcessingQueue = require('../queues/billProcessQueue');
const Tesseract = require('tesseract.js');
const gptDealerBillParser = require('../utils/gptdealerParser');
const DealerBill = require('../models/dealerBill');
const InventoryItem = require('../models/InvenotryItem');
const s3Service = require('../services/s3UploadService');

// Process bills in background
billProcessingQueue.process(async (job) => {
  const { billId, s3Key, storeId, userId } = job.data;

  try {
    console.log(`🔄 Processing bill: ${billId}`);

    // Update status to processing
    await DealerBill.findByIdAndUpdate(billId, { 
      status: 'processing' 
    });

    // Step 1: Get signed URL and download image
    const imageUrl = s3Service.getSignedUrl(s3Key);

    // Step 2: OCR Extraction
    console.log('📸 Running OCR...');
    const { data: { text, confidence } } = await Tesseract.recognize(
      imageUrl,
      'eng+hin', // English + Hindi
      {
        logger: m => console.log(m)
      }
    );

    console.log(`OCR Confidence: ${confidence}%`);

    // Step 3: Check if OCR quality is too low
    if (confidence < 60) {
      await DealerBill.findByIdAndUpdate(billId, {
        status: 'manual_review_needed',
        extractedText: text,
        meta: { ocrConfidence: confidence, error: 'Low OCR quality' }
      });
      
      // TODO: Send notification to user
      console.log('⚠️ OCR quality too low, needs manual review');
      return { status: 'manual_review', billId };
    }

    // Step 4: GPT Parsing
    console.log('🤖 Parsing with GPT...');
    const parsedData = await gptDealerBillParser(text);

    if (!parsedData || !parsedData.items || parsedData.items.length === 0) {
      await DealerBill.findByIdAndUpdate(billId, {
        status: 'parsing_failed',
        extractedText: text,
        meta: { ocrConfidence: confidence, error: 'No items extracted' }
      });
      
      console.log('❌ GPT parsing failed');
      return { status: 'parsing_failed', billId };
    }

    // Step 5: Save to Database
    const savedItemIds = [];

    for (const item of parsedData.items) {
      try {
        const newItem = await InventoryItem.create({
          itemName: item.itemName,
          brand: item.brand || 'Unknown',
          category: item.category || 'Uncategorized',
          quantity: item.quantity,
          unit: item.unit || 'pcs',
          specifications: item.specifications,
          price: item.price,
          storeId,
          createdBy: userId,
          sourceBillId: billId,
          dealer: {
            name: parsedData.dealer?.dealerName,
            gstin: parsedData.dealer?.dealerGSTIN
          },
          meta: {
            confidenceScore: item.confidenceScore || confidence
          }
        });

        savedItemIds.push(newItem._id);
      } catch (err) {
        console.warn('⚠️ Failed to save item:', item.itemName, err.message);
      }
    }

    // Step 6: Update DealerBill
    await DealerBill.findByIdAndUpdate(billId, {
      status: 'completed',
      dealerName: parsedData.dealer?.dealerName,
      dealerGSTIN: parsedData.dealer?.dealerGSTIN,
      invoiceNumber: parsedData.dealer?.invoiceNumber,
      invoiceDate: parsedData.dealer?.invoiceDate,
      totalAmount: parsedData.dealer?.totalAmount,
      extractedText: text,
      itemsParsed: savedItemIds,
      meta: {
        ocrConfidence: confidence,
        itemsExtracted: parsedData.items.length,
        itemsSaved: savedItemIds.length
      },
      processedAt: new Date()
    });

    console.log(`✅ Bill processed successfully: ${savedItemIds.length} items saved`);

    // TODO: Send success notification to user (WhatsApp/Push)

    return { 
      status: 'success', 
      billId, 
      itemsCreated: savedItemIds.length 
    };

  } catch (error) {
    console.error('❌ Bill processing error:', error);

    await DealerBill.findByIdAndUpdate(billId, {
      status: 'failed',
      meta: { error: error.message }
    });

    throw error; // Bull will retry
  }
});

// Event listeners
billProcessingQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

billProcessingQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

console.log('🔥 Bill processing worker is running...');