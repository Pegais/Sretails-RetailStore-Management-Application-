const xlsx = require('xlsx')

const normalizeKey = (key = '') =>
  key
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')

const normalizeRowKeys = (row = {}) => {
  const normalized = {}
  Object.keys(row).forEach((key) => {
    normalized[normalizeKey(key)] = row[key]
  })
  return normalized
}

const parseDealerWorkbook = (buffer, originalName = '') => {
  const workbook = xlsx.read(buffer, { type: 'buffer' })
  const sheetNames = workbook.SheetNames

  if (sheetNames.length < 2) {
    throw new Error(
      'Excel file must contain at least two sheets (Dealer metadata and Inventory items)'
    )
  }

  const dealerSheet = workbook.Sheets[sheetNames[0]]
  const dealerRaw = xlsx.utils.sheet_to_json(dealerSheet, { defval: '' })

  if (!dealerRaw.length) {
    throw new Error('Dealer metadata sheet is empty')
  }

  const dealerRow = normalizeRowKeys(dealerRaw[0])
  const dealerInfo = {
    dealerName: dealerRow.dealername || '',
    dealerGSTIN: dealerRow.dealergstin || '',
    invoiceDate: dealerRow.invoicedate || '',
    invoiceNumber: dealerRow.invoicenumber || '',
    totalAmount: parseFloat(dealerRow.totalamount || 0),
  }

  if (!dealerInfo.dealerName || !dealerInfo.invoiceDate) {
    throw new Error('Missing dealer name or invoice date in metadata sheet')
  }

  const itemSheet = workbook.Sheets[sheetNames[1]]
  const itemRaw = xlsx.utils.sheet_to_json(itemSheet, { defval: '' })

  if (!itemRaw.length) {
    throw new Error('Inventory items sheet is empty')
  }

  const normalizedItems = itemRaw.map(normalizeRowKeys)

  return {
    dealerInfo,
    itemRows: normalizedItems,
    sheetNames,
    originalName,
  }
}

module.exports = {
  parseDealerWorkbook,
}

