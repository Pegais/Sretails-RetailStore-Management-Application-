const axios = require('axios')
const BarcodeCache = require('../models/BarcodeCache')

// API Configuration
const BARCODE_API_CONFIG = {
  // Using UPCitemdb.com free tier
  baseURL: 'https://api.upcitemdb.com/prod/trial',
  endpoint: '/lookup',
  // Alternative: Barcode Lookup API (uncomment if using)
  // baseURL: 'https://api.barcodelookup.com/v3',
  // endpoint: '/products',
  // apiKey: process.env.BARCODE_API_KEY,
}

/**
 * Normalize product data from external API to our format
 */
const normalizeProductData = (apiResponse, barcode) => {
  // UPCitemdb.com response format
  if (apiResponse.items && apiResponse.items.length > 0) {
    const item = apiResponse.items[0]
    return {
      itemName: item.title || item.description || 'Unknown Product',
      brand: item.brand || '',
      category: item.category || '',
      description: item.description || '',
      images: item.images && item.images.length > 0 ? [item.images[0]] : [],
      barcode: barcode,
      // Additional metadata
      metadata: {
        upc: item.upc || barcode,
        ean: item.ean || '',
        model: item.model || '',
        color: item.color || '',
        size: item.size || '',
        dimension: item.dimension || '',
        weight: item.weight || '',
      },
    }
  }

  // Barcode Lookup API response format (if using)
  if (apiResponse.products && apiResponse.products.length > 0) {
    const product = apiResponse.products[0]
    return {
      itemName: product.product_name || product.title || 'Unknown Product',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      barcode: barcode,
      metadata: {
        upc: product.upc || barcode,
        ean: product.ean || '',
        model: product.model || '',
      },
    }
  }

  return null
}

/**
 * Check if barcode is in cache and not expired
 */
const getCachedProduct = async (barcode) => {
  try {
    const cached = await BarcodeCache.findOne({
      barcode,
      expiresAt: { $gt: new Date() },
    })

    if (cached) {
      return cached.productInfo
    }
    return null
  } catch (error) {
    console.error('Error checking cache:', error)
    return null
  }
}

/**
 * Save product info to cache
 */
const saveToCache = async (barcode, productInfo) => {
  try {
    await BarcodeCache.findOneAndUpdate(
      { barcode },
      {
        barcode,
        productInfo,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      { upsert: true, new: true }
    )
  } catch (error) {
    console.error('Error saving to cache:', error)
    // Don't throw - caching failure shouldn't break the flow
  }
}

/**
 * Lookup barcode from external API
 */
const lookupBarcodeFromAPI = async (barcode) => {
  try {
    // Validate barcode format (EAN-13: 13 digits, UPC-A: 12 digits)
    const barcodeStr = String(barcode).trim()
    if (!/^\d{12,13}$/.test(barcodeStr)) {
      throw new Error('Invalid barcode format. Must be 12 or 13 digits.')
    }

    // UPCitemdb.com API call
    const response = await axios.get(`${BARCODE_API_CONFIG.baseURL}${BARCODE_API_CONFIG.endpoint}`, {
      params: {
        upc: barcodeStr,
      },
      timeout: 5000, // 5 second timeout
    })

    if (response.data.code === 'OK' && response.data.items && response.data.items.length > 0) {
      return normalizeProductData(response.data, barcodeStr)
    }

    // If using Barcode Lookup API (uncomment if needed)
    /*
    const response = await axios.get(`${BARCODE_API_CONFIG.baseURL}${BARCODE_API_CONFIG.endpoint}`, {
      params: {
        barcode: barcodeStr,
      },
      headers: {
        'X-RapidAPI-Key': BARCODE_API_CONFIG.apiKey,
      },
      timeout: 5000,
    })
    */

    return null // Product not found
  } catch (error) {
    if (error.response) {
      // API returned error
      if (error.response.status === 404) {
        return null // Product not found
      }
      if (error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    }
    console.error('Barcode API error:', error.message)
    throw new Error(`Failed to lookup barcode: ${error.message}`)
  }
}

/**
 * Main function to lookup barcode
 * Checks cache first, then API if needed
 */
const lookupBarcode = async (barcode) => {
  try {
    // Step 1: Check cache
    const cached = await getCachedProduct(barcode)
    if (cached) {
      console.log(`✅ Barcode ${barcode} found in cache`)
      return cached
    }

    // Step 2: Call external API
    console.log(`🔍 Looking up barcode ${barcode} from API...`)
    const productInfo = await lookupBarcodeFromAPI(barcode)

    if (productInfo) {
      // Step 3: Save to cache
      await saveToCache(barcode, productInfo)
      console.log(`✅ Barcode ${barcode} found and cached`)
      return productInfo
    }

    // Product not found
    console.log(`❌ Barcode ${barcode} not found in API`)
    return null
  } catch (error) {
    console.error('Error in lookupBarcode:', error)
    throw error
  }
}

/**
 * Validate barcode format
 */
const validateBarcode = (barcode) => {
  if (!barcode) {
    return {
      valid: false,
      error: 'Barcode is required.',
    }
  }
  
  const barcodeStr = String(barcode).trim().replace(/\D/g, '') // Remove non-digits
  
  // EAN-13: 13 digits, UPC-A: 12 digits
  if (!/^\d{12,13}$/.test(barcodeStr)) {
    return {
      valid: false,
      error: `Invalid barcode format. Must be 12 or 13 digits. Got: ${barcodeStr.length} digits.`,
    }
  }
  return { valid: true, barcode: barcodeStr }
}

module.exports = {
  lookupBarcode,
  validateBarcode,
  getCachedProduct,
  saveToCache,
}

