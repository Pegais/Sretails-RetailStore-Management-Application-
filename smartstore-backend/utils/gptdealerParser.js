const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Use GPT to parse dealer bill OCR text into structured data
 * @param {string} ocrText - Raw OCR extracted text from dealer bill
 * @returns {{dealer: Object, items: Array}} Parsed structured JSON
 */
async function gptDealerBillParser(ocrText) {
  console.log("THE OCR TEXT PASSED TO GPT :",ocrText)
  const prompt = `
You are a smart parser for hardware and sanitary bills. The OCR text provided below is raw invoice data extracted from a scanned PDF. Parse and convert it into JSON format with the following structure:

{
  "dealer": {
    "dealerName": "",
    "dealerGSTIN": "",
    "invoiceNumber": "",
    "invoiceDate": "",
    "totalAmount": 0
  },
  "items": [
    {
      "itemName": "",
      "brand": "",
      "category": "",
      "quantity": 0,
      "unit": "",
      "specifications": {
        "size": "",
        "color": "",
        "weight": "",
        "material": "",
        "dimensions": "",
        "variant": ""
      },
      "price": {
        "mrp": 0,
        "sellingPrice": 0,
        "ownerDealPrice": 0
      },
      "description": "",
      "tags": [],
      "searchKeywords": [],
      "confidenceScore": 0.9
    }
  ]
}

OCR TEXT:
""" 
${ocrText}
"""`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const rawJson = response.choices?.[0]?.message?.content?.trim();
    if (!rawJson) throw new Error("No content returned from GPT");

    const parsed = JSON.parse(rawJson);

    // 🔁 Deduplicate inventory items based on itemName + brand + MRP
    const seen = new Set();
    const deduplicatedItems = [];

    for (const item of parsed.items || []) {
      if (!item.itemName || !item.brand || !item.price?.mrp) continue; // Fail-safe skip

      const key = `${item.itemName.trim().toLowerCase()}-${item.brand.trim().toLowerCase()}-${item.price.mrp}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicatedItems.push(item);
      }
    }

    return {
      dealer: parsed.dealer || {},
      items: deduplicatedItems
    };

  } catch (error) {
    console.error("GPT Parsing Error:", error.message);
    return {
      dealer: {},
      items: []
    };
  }
}

module.exports = gptDealerBillParser;
