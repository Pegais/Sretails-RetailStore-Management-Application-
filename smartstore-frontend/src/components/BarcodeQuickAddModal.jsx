import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import useSmartStore from '../store/useSmartStore'

const BarcodeQuickAddModal = ({ open, onClose, barcode, productInfo, onSuccess }) => {
  const { t } = useTranslation()
  const createItemFromBarcode = useSmartStore((state) => state.createItemFromBarcode)
  const fetchInventory = useSmartStore((state) => state.fetchInventory)
  const isLookingUp = useSmartStore((state) => state.isLookingUp)

  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    category: '',
    quantity: 1,
    unit: 'pcs',
    mrp: 0,
    sellingPrice: 0,
  })
  const [error, setError] = useState(null)

  // Pre-fill form when productInfo or barcode changes
  useEffect(() => {
    if (productInfo) {
      setFormData((prev) => ({
        ...prev,
        itemName: productInfo.itemName || '',
        brand: productInfo.brand || '',
        category: productInfo.category || '',
      }))
    }
  }, [productInfo])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        itemName: '',
        brand: '',
        category: '',
        quantity: 1,
        unit: 'pcs',
        mrp: 0,
        sellingPrice: 0,
      })
      setError(null)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!formData.itemName || !barcode) {
      setError(t('barcode.fillRequiredFields', 'Please fill all required fields'))
      return
    }

    if (!formData.mrp && !formData.sellingPrice) {
      setError(t('inventory.priceRequired', 'Please enter at least MRP or Selling Price'))
      return
    }

    setError(null)
    try {
      await createItemFromBarcode({
        barcode,
        itemName: formData.itemName,
        brand: formData.brand,
        category: formData.category,
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit,
        price: {
          mrp: Number(formData.mrp) || Number(formData.sellingPrice) || 0,
          sellingPrice: Number(formData.sellingPrice) || Number(formData.mrp) || 0,
        },
      })

      await fetchInventory(true)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message || t('barcode.createFailed', 'Failed to create item'))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {t('barcode.createItem', 'Create Item from Barcode')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {productInfo && (
            <Alert severity="info">
              {t('barcode.productFound', 'Product information found from barcode database')}
            </Alert>
          )}

          <TextField
            label={t('barcode.barcodeNumber', 'Barcode')}
            value={barcode || ''}
            disabled
            fullWidth
            helperText={t('barcode.scannedBarcode', 'Scanned barcode number')}
          />

          <TextField
            label={t('inventory.itemName')}
            value={formData.itemName}
            onChange={(e) => setFormData((prev) => ({ ...prev, itemName: e.target.value }))}
            fullWidth
            required
            autoFocus
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label={t('inventory.brand')}
              value={formData.brand}
              onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('inventory.category')}
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label={t('inventory.quantity')}
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) || 1 }))}
              fullWidth
            />
            <TextField
              label={t('inventory.unit')}
              value={formData.unit}
              onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label={t('inventory.mrp')}
              type="number"
              value={formData.mrp}
              onChange={(e) => setFormData((prev) => ({ ...prev, mrp: Number(e.target.value) || 0 }))}
              fullWidth
              required
            />
            <TextField
              label={t('inventory.sellingPrice')}
              type="number"
              value={formData.sellingPrice}
              onChange={(e) => setFormData((prev) => ({ ...prev, sellingPrice: Number(e.target.value) || 0 }))}
              fullWidth
              required
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={isLookingUp}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLookingUp || !formData.itemName || (!formData.mrp && !formData.sellingPrice)}
          startIcon={isLookingUp ? <CircularProgress size={16} /> : null}
        >
          {isLookingUp ? t('common.loading') : t('barcode.createAndAdd', 'Create & Add to Cart')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BarcodeQuickAddModal

