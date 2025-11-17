const Sale = require('../models/Sale')
const InventoryItem = require('../models/InvenotryItem')
const InventoryChangeLog = require('../models/InventoryChangeLog')
const Payment = require('../models/Payment')

const normalize = (str) => (typeof str === 'string' ? str.trim().toLowerCase() : str)

// Helper: Log inventory change
const logInventoryChange = async (itemId, storeId, userId, changeType, oldQuantity, newQuantity, reason, saleId = null) => {
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
      metadata: { saleId },
    })
  } catch (err) {
    console.error('Failed to log inventory change:', err)
  }
}

// @desc Create a new sale
// POST /api/sales
exports.createSale = async (req, res) => {
  try {
    const { storeId, userId } = req.user
    const {
      items,
      subtotal,
      discount = 0,
      tax = 0,
      total,
      paymentMethod,
      payments,
      customerId,
      customerName,
      customerPhone,
      notes,
      saleType = 'retail',
    } = req.body

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Sale must have at least one item' })
    }

    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Total amount must be greater than 0' })
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' })
    }

    // Validate payments array if provided
    if (payments && Array.isArray(payments)) {
      const paymentsTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      if (Math.abs(paymentsTotal - total) > 0.01) {
        // Allow small rounding differences
        return res.status(400).json({ error: 'Payment amounts do not match total' })
      }
    }

    // Validate and check inventory availability
    const inventoryUpdates = []
    const inventoryChecks = []

    for (const item of items) {
      const inventoryItem = await InventoryItem.findById(item.itemId)
      if (!inventoryItem) {
        return res.status(404).json({ error: `Item ${item.itemName} not found` })
      }

      // Check if item belongs to store
      if (inventoryItem.storeId.toString() !== storeId.toString()) {
        return res.status(403).json({ error: `Item ${item.itemName} does not belong to this store` })
      }

      // Check stock availability
      const currentStock = inventoryItem.quantity || 0
      if (currentStock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.itemName}. Available: ${currentStock}, Requested: ${item.quantity}`,
        })
      }

      inventoryChecks.push({
        itemId: item.itemId,
        currentStock,
        requested: item.quantity,
        itemName: item.itemName,
      })

      inventoryUpdates.push({
        itemId: item.itemId,
        oldQuantity: currentStock,
        newQuantity: currentStock - item.quantity,
      })
    }

    // Create sale
    const sale = await Sale.create({
      storeId,
      items: items.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        brand: item.brand || '',
        category: item.category || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        subtotal: item.subtotal || item.quantity * item.unitPrice - (item.discount || 0) + (item.tax || 0),
      })),
      subtotal: subtotal || items.reduce((sum, item) => sum + (item.subtotal || item.quantity * item.unitPrice), 0),
      discount: discount || 0,
      tax: tax || 0,
      total,
      paymentMethod,
      payments: payments || [{ method: paymentMethod, amount: total }],
      customerId: customerId || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      notes: notes || '',
      saleType,
      soldBy: userId,
      cashierName: req.user.name || 'Staff',
      status: 'completed',
      saleDate: new Date(),
    })

    // Update inventory quantities
    for (const update of inventoryUpdates) {
      await InventoryItem.findByIdAndUpdate(update.itemId, {
        $inc: { quantity: -update.requested },
        updatedAt: new Date(),
      })

      // Log inventory change
      await logInventoryChange(
        update.itemId,
        storeId,
        userId,
        'quantity_decrease',
        update.oldQuantity,
        update.newQuantity,
        `Sale completed: ${sale.saleId}`,
        sale._id
      )
    }

    // Create payment record
    const paymentRecord = await Payment.create({
      storeId,
      amount: total,
      paymentMode: paymentMethod,
      upiId: payments?.[0]?.transactionId || null,
      upiTransactionId: payments?.[0]?.transactionId || null,
      upiApp: payments?.[0]?.upiApp || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      itemsSold: items.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      notes: notes || `Sale: ${sale.saleId}`,
      date: new Date(),
      recordedBy: userId,
    })

    // Populate sale with item details
    const populatedSale = await Sale.findById(sale._id)
      .populate('items.itemId', 'itemName brand category price images')
      .populate('customerId', 'name phone email')
      .populate('soldBy', 'name email')

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      sale: populatedSale,
      payment: paymentRecord,
    })
  } catch (error) {
    console.error('Error creating sale:', error)
    res.status(500).json({ error: error.message || 'Failed to create sale' })
  }
}

// @desc Get all sales for a store
// GET /api/sales
exports.getSales = async (req, res) => {
  try {
    const { storeId } = req.user
    const { page = 1, limit = 50, startDate, endDate, status, customerId } = req.query

    const query = { storeId }

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {}
      if (startDate) query.saleDate.$gte = new Date(startDate)
      if (endDate) query.saleDate.$lte = new Date(endDate)
    }

    // Status filter
    if (status) {
      query.status = status
    }

    // Customer filter
    if (customerId) {
      query.customerId = customerId
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sales = await Sale.find(query)
      .populate('items.itemId', 'itemName brand category price')
      .populate('customerId', 'name phone')
      .populate('soldBy', 'name')
      .sort({ saleDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Sale.countDocuments(query)

    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error('Error fetching sales:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch sales' })
  }
}

// @desc Get sale by ID
// GET /api/sales/:id
exports.getSaleById = async (req, res) => {
  try {
    const { storeId } = req.user
    const { id } = req.params

    const sale = await Sale.findOne({ _id: id, storeId })
      .populate('items.itemId', 'itemName brand category price images specifications')
      .populate('customerId', 'name phone email address')
      .populate('soldBy', 'name email')

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' })
    }

    res.json({ sale })
  } catch (error) {
    console.error('Error fetching sale:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch sale' })
  }
}

// @desc Cancel/Refund a sale
// PATCH /api/sales/:id/cancel
exports.cancelSale = async (req, res) => {
  try {
    const { storeId, userId } = req.user
    const { id } = req.params
    const { reason } = req.body

    const sale = await Sale.findOne({ _id: id, storeId, status: 'completed' })

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found or already cancelled' })
    }

    // Restore inventory
    for (const item of sale.items) {
      const inventoryItem = await InventoryItem.findById(item.itemId)
      if (inventoryItem) {
        const oldQuantity = inventoryItem.quantity || 0
        const newQuantity = oldQuantity + item.quantity

        await InventoryItem.findByIdAndUpdate(item.itemId, {
          $inc: { quantity: item.quantity },
          updatedAt: new Date(),
        })

        // Log inventory change
        await logInventoryChange(
          item.itemId,
          storeId,
          userId,
          'quantity_increase',
          oldQuantity,
          newQuantity,
          `Sale cancelled: ${sale.saleId}. Reason: ${reason || 'No reason provided'}`,
          sale._id
        )
      }
    }

    // Update sale status
    sale.status = 'cancelled'
    sale.notes = sale.notes ? `${sale.notes}\nCancelled: ${reason || 'No reason'}` : `Cancelled: ${reason || 'No reason'}`
    await sale.save()

    res.json({
      success: true,
      message: 'Sale cancelled and inventory restored',
      sale,
    })
  } catch (error) {
    console.error('Error cancelling sale:', error)
    res.status(500).json({ error: error.message || 'Failed to cancel sale' })
  }
}

// @desc Get sales statistics
// GET /api/sales/stats
exports.getSalesStats = async (req, res) => {
  try {
    const { storeId } = req.user
    const { startDate, endDate } = req.query

    const dateQuery = {}
    if (startDate) dateQuery.$gte = new Date(startDate)
    if (endDate) dateQuery.$lte = new Date(endDate)

    const matchQuery = { storeId, status: 'completed' }
    if (Object.keys(dateQuery).length > 0) {
      matchQuery.saleDate = dateQuery
    }

    const stats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalTransactions: { $sum: 1 },
          averageSale: { $avg: '$total' },
          totalItemsSold: { $sum: { $size: '$items' } },
        },
      },
    ])

    const paymentMethodStats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ])

    res.json({
      stats: stats[0] || {
        totalSales: 0,
        totalTransactions: 0,
        averageSale: 0,
        totalItemsSold: 0,
      },
      paymentMethods: paymentMethodStats,
    })
  } catch (error) {
    console.error('Error fetching sales stats:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch sales stats' })
  }
}

