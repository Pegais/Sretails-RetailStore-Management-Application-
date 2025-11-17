import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
  Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import { Html5Qrcode } from 'html5-qrcode'
import { useTranslation } from 'react-i18next'

const BarcodeScanner = ({ open, onClose, onScanSuccess, onError }) => {
  const { t } = useTranslation()
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [manualBarcode, setManualBarcode] = useState('')

  useEffect(() => {
    if (open && !html5QrCodeRef.current) {
      startScanner()
    } else if (!open && html5QrCodeRef.current) {
      stopScanner()
    }

    return () => {
      if (html5QrCodeRef.current) {
        stopScanner()
      }
    }
  }, [open])

  const startScanner = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Check if running on mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Check if HTTPS or localhost (required for camera on mobile)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || 
                              window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              /^192\.168\./.test(window.location.hostname) ||
                              /^10\./.test(window.location.hostname)

      if (isMobile && !isSecureContext) {
        throw new Error(
          t('barcode.httpsRequired', 'Camera requires HTTPS or local network access. Please use HTTPS or access via local IP address.')
        )
      }

      const html5QrCode = new Html5Qrcode('barcode-scanner')
      html5QrCodeRef.current = html5QrCode

      // Get available cameras with better error handling
      let devices = []
      try {
        devices = await Html5Qrcode.getCameras()
      } catch (err) {
        console.error('Error getting cameras:', err)
        // Try alternative method
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop()) // Stop immediately, just testing
          throw new Error(t('barcode.cameraPermissionDenied', 'Camera permission denied. Please allow camera access in browser settings.'))
        } catch (permErr) {
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            throw new Error(t('barcode.cameraPermissionDenied', 'Camera permission denied. Please allow camera access in browser settings.'))
          }
          throw new Error(t('barcode.noCamera', 'No camera found or camera access failed'))
        }
      }

      if (devices.length === 0) {
        throw new Error(t('barcode.noCamera', 'No camera found'))
      }

      // Better camera selection for mobile
      let cameraId = devices[0].id
      if (isMobile) {
        // Prefer back camera on mobile
        const backCamera = devices.find((d) => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        )
        if (backCamera) {
          cameraId = backCamera.id
        }
      } else {
        // Prefer back camera or environment-facing camera
        const backCamera = devices.find((d) => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        )
        if (backCamera) {
          cameraId = backCamera.id
        }
      }

      // Mobile-optimized configuration
      const config = isMobile
        ? {
            fps: 10,
            qrbox: function(viewfinderWidth, viewfinderHeight) {
              // Use 80% of viewfinder on mobile for better scanning
              const minEdgePercentage = 0.8
              const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
              const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
              return {
                width: qrboxSize,
                height: qrboxSize
              }
            },
            aspectRatio: 1.0,
            disableFlip: false, // Allow rotation
          }
        : {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          }

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          // Success callback
          handleScanSuccess(decodedText)
        },
        (errorMessage) => {
          // Error callback - ignore scanning errors (just means no code detected yet)
          // Only log if it's a real error
          if (errorMessage && !errorMessage.includes('NotFoundException')) {
            console.debug('Scanning:', errorMessage)
          }
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error('Scanner error:', err)
      let errorMessage = err.message
      
      // Provide helpful error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = t('barcode.cameraPermissionDenied', 'Camera permission denied. Please allow camera access in browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = t('barcode.noCamera', 'No camera found')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = t('barcode.cameraInUse', 'Camera is already in use by another application.')
      } else if (err.message) {
        errorMessage = err.message
      } else {
        errorMessage = t('barcode.scannerError', 'Scanner error occurred')
      }
      
      setError(errorMessage)
      setIsScanning(false)
      if (onError) {
        onError(err)
      }
    }
  }

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear()
          html5QrCodeRef.current = null
          setIsScanning(false)
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err)
          html5QrCodeRef.current = null
          setIsScanning(false)
        })
    }
  }

  const handleScanSuccess = (barcode) => {
    stopScanner()
    if (onScanSuccess) {
      onScanSuccess(barcode)
    }
  }

  const handleManualSubmit = () => {
    if (manualBarcode.trim().length >= 12) {
      handleScanSuccess(manualBarcode.trim())
      setManualBarcode('')
    } else {
      setError(t('barcode.invalidBarcode', 'Invalid barcode. Must be at least 12 digits.'))
    }
  }

  // Check if mobile for fullscreen dialog
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobileDevice && window.innerWidth < 600}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          maxHeight: { xs: '100vh', sm: '90vh' },
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {t('barcode.scanBarcode', 'Scan Barcode')}
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

          {/* Scanner View */}
          <Box
            id="barcode-scanner"
            sx={{
              width: '100%',
              minHeight: { xs: 400, sm: 300 },
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#000',
              position: 'relative',
              display: isScanning ? 'block' : 'none',
            }}
          />

          {!isScanning && !error && (
            <Box
              sx={{
                width: '100%',
                minHeight: 300,
                borderRadius: 2,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stack spacing={2} alignItems="center">
                <QrCodeScannerIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {t('barcode.startingCamera', 'Starting camera...')}
                </Typography>
                <CircularProgress size={24} />
              </Stack>
            </Box>
          )}

          {/* Manual Entry Fallback */}
          <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('barcode.orEnterManually', 'Or enter barcode manually:')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('barcode.enterBarcode', 'Enter 12-13 digit barcode')}
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                inputProps={{
                  maxLength: 13,
                  pattern: '[0-9]*',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit()
                  }
                }}
              />
              <Button variant="contained" onClick={handleManualSubmit} disabled={manualBarcode.trim().length < 12}>
                {t('common.add', 'Add')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        {isScanning && (
          <Button onClick={stopScanner} variant="outlined">
            {t('barcode.stopScanning', 'Stop Scanning')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default BarcodeScanner

