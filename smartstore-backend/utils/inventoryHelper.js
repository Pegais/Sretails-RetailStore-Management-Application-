const InventoryItem = require('../models/InvenotryItem')
const InventoryChangeLog = require('../models/InventoryChangeLog')

/**
 * Normalize string for comparison (lowercase, trim, remove extra spaces)
 */
const normalizeString = (str) => {
  if (!str) return ''
  return String(str).toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Check if two prices are the same (within 0.01 tolerance)
 */
const isPriceEqual = (price1, price2) => {
  if (!price1 || !price2) return false
  const p1 = Number(price1.sellingPrice || price1.mrp || 0)
  const p2 = Number(price2.sellingPrice || price2.mrp || 0)
  return Math.abs(p1 - p2) < 0.01
}

/**
 * Check if two dealers are the same
 */
const isDealerEqual = (dealer1, dealer2) => {
  if (!dealer1 || !dealer2) return false
  const name1 = normalizeString(dealer1.name)
  const name2 = normalizeString(dealer2.name)
  return name1 === name2
}

/**
 * Find existing inventory item or create new one
 * Returns: { item, isNew, action: 'created' | 'updated' | 'duplicate' }
 */
const findOrCreateInventoryItem = async (itemData, storeId) => {
  const {
    itemName,
    brand,
    category,
    quantity,
    unit,
    specifications,
    price,
    dealer,
    storeId: providedStoreId,
    createdBy,
    sourceBillId,
    meta,
  } = itemData

  // Normalize item name for comparison
  const normalizedItemName = normalizeString(itemName)
  const normalizedBrand = normalizeString(brand || '')

  // Find existing items with same name and brand in the store
  const existingItems = await InventoryItem.find({
    storeId: providedStoreId || storeId,
    itemName: { $regex: new RegExp(`^${normalizedItemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    ...(normalizedBrand ? { brand: { $regex: new RegExp(`^${normalizedBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } } : {}),
  })

  // Check each existing item to see if it matches (same price and dealer)
  for (const existing of existingItems) {
    const priceMatch = isPriceEqual(existing.price, price)
    const dealerMatch = isDealerEqual(existing.dealer, dealer)

    if (priceMatch && dealerMatch) {
      // Match found! Update quantity
      const oldQuantity = existing.quantity || 0
      const newQuantity = oldQuantity + (quantity || 0)

      existing.quantity = newQuantity
      existing.updatedAt = new Date()
      // Update source bill reference to latest
      if (sourceBillId) {
        existing.sourceBillId = sourceBillId
        if (dealer) {
          existing.dealer = {
            ...existing.dealer,
            ...dealer,
            billId: sourceBillId,
          }
        }
      }
      await existing.save()

      // Log the change from bill upload
      try {
        await InventoryChangeLog.create({
          itemId: existing._id,
          storeId: existing.storeId,
          changedBy: createdBy,
          changeType: 'bill_upload',
          oldQuantity,
          newQuantity,
          quantityChange: newQuantity - oldQuantity,
          reason: 'Bill upload - quantity updated',
          sourceBillId,
          metadata: { dealerName: dealer?.name },
        })
      } catch (logErr) {
        console.warn('Failed to log bill upload change:', logErr.message)
      }

      return {
        item: existing,
        isNew: false,
        action: 'updated',
        oldQuantity,
        newQuantity,
      }
    }
  }

  // No match found - create new item
  const newItem = await InventoryItem.create({
    itemName: normalizeString(itemName),
    brand: normalizedBrand || 'Unknown',
    category: normalizeString(category || 'Uncategorized'),
    quantity: quantity || 0,
    unit: unit || 'pcs',
    specifications: specifications || {},
    price: price || { mrp: 0, sellingPrice: 0 },
    storeId: providedStoreId || storeId,
    createdBy,
    sourceBillId,
    dealer: dealer || {},
    meta: meta || {},
  })

  // Log the creation from bill upload
  try {
    await InventoryChangeLog.create({
      itemId: newItem._id,
      storeId: newItem.storeId,
      changedBy: createdBy,
      changeType: 'bill_upload',
      oldQuantity: 0,
      newQuantity: quantity || 0,
      quantityChange: quantity || 0,
      reason: 'Bill upload - new item created',
      sourceBillId,
      metadata: { dealerName: dealer?.name },
    })
  } catch (logErr) {
    console.warn('Failed to log bill upload creation:', logErr.message)
  }

  return {
    item: newItem,
    isNew: true,
    action: 'created',
    oldQuantity: 0,
    newQuantity: quantity || 0,
  }
}

module.exports = {
  findOrCreateInventoryItem,
  normalizeString,
  isPriceEqual,
  isDealerEqual,
}

