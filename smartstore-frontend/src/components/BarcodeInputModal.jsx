import { useState } from 'react'
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
  Tabs,
  Tab,
  Box,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { useTranslation } from 'react-i18next'
import useSmartStore from '../store/useSmartStore'

const BarcodeInputModal = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const checkInventoryByBarcode = useSmartStore((state) => state.checkInventoryByBarcode)
  const productInfo = useSmartStore((state) => state.productInfo)
  const isLookingUp = useSmartStore((state) => state.isLookingUp)
  const barcodeError = useSmartStore((state) => state.barcodeError)

  const [barcode, setBarcode] = useState('')
  const [error, setError] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleBarcodeSubmit = async () => {
    const trimmedBarcode = barcode.trim()
    
    // Validate barcode format
    if (!trimmedBarcode) {
      setError(t('barcode.enterBarcode', 'Please enter a barcode'))
      return
    }

    // Check if it's numeric and 12-13 digits
    if (!/^\d{12,13}$/.test(trimmedBarcode)) {
      setError(t('barcode.invalidFormat', 'Barcode must be 12-13 digits'))
      return
    }

    setError(null)
    try {
      const result = await checkInventoryByBarcode(trimmedBarcode)
      
      if (!result) {
        setError(t('barcode.lookupFailed', 'Failed to lookup barcode. Please try again.'))
        return
      }

      // Success - pass to parent
      onSuccess?.(trimmedBarcode, result)
      handleClose()
    } catch (err) {
      console.error('Barcode lookup error:', err)
      const errorMsg = err.response?.data?.error || err.message || t('barcode.lookupFailed', 'Failed to lookup barcode')
      setError(errorMsg)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('barcode.invalidImage', 'Please upload an image file'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('barcode.imageTooLarge', 'Image size must be less than 5MB'))
      return
    }

    setImageFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageSubmit = async () => {
    if (!imageFile) {
      setError(t('barcode.selectImage', 'Please select an image'))
      return
    }

    setError(null)
    
    // For now, show message that image scanning will be implemented
    // In production, you would upload to backend and use OCR service
    setError(t('barcode.imageScanComingSoon', 'Image scanning coming soon. Please enter barcode manually for now.'))
    
    // TODO: Implement image upload + OCR
    // 1. Upload image to backend
    // 2. Backend uses OCR (Tesseract.js or cloud service) to extract barcode
    // 3. Return barcode number
    // 4. Then lookup barcode
  }

  const handleClose = () => {
    setBarcode('')
    setError(null)
    setImageFile(null)
    setImagePreview(null)
    setTabValue(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {t('barcode.enterBarcode', 'Enter Barcode')}
          </Typography>
          <IconButton onClick={handleClose} size="small">
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

          {barcodeError && (
            <Alert severity="warning" onClose={() => {}}>
              {barcodeError}
            </Alert>
          )}

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<QrCodeScannerIcon />} label={t('barcode.manualEntry', 'Manual Entry')} />
            <Tab icon={<PhotoCameraIcon />} label={t('barcode.photoScan', 'Photo Scan')} disabled />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <TextField
                fullWidth
                label={t('barcode.barcodeNumber', 'Barcode')}
                placeholder={t('barcode.enterBarcodePlaceholder', 'Enter 12-13 digit barcode')}
                value={barcode}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 13) {
                    setBarcode(value)
                    setError(null)
                  }
                }}
                inputProps={{
                  maxLength: 13,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeSubmit()
                  }
                }}
                autoFocus
                helperText={t('barcode.barcodeHelper', 'Enter the barcode number from the product')}
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="barcode-image-upload"
                type="file"
                onChange={handleImageUpload}
                capture="environment" // Use back camera on mobile
              />
              <label htmlFor="barcode-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<PhotoCameraIcon />}
                  sx={{ mb: 2, py: 2 }}
                >
                  {t('barcode.takePhoto', 'Take Photo or Select Image')}
                </Button>
              </label>

              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Barcode preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 8,
                      border: '1px solid #ddd',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {t('barcode.imageScanComingSoon', 'Image scanning coming soon. Please enter barcode manually for now.')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={handleClose} disabled={isLookingUp}>
          {t('common.cancel')}
        </Button>
        {tabValue === 0 && (
          <Button
            onClick={handleBarcodeSubmit}
            variant="contained"
            disabled={isLookingUp || !barcode.trim() || barcode.trim().length < 12}
            startIcon={isLookingUp ? <CircularProgress size={16} /> : null}
          >
            {isLookingUp ? t('common.loading') : t('barcode.lookup', 'Lookup')}
          </Button>
        )}
        {tabValue === 1 && (
          <Button
            onClick={handleImageSubmit}
            variant="contained"
            disabled={!imageFile}
          >
            {t('barcode.scanImage', 'Scan Image')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default BarcodeInputModal

