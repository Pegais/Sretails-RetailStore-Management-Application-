import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Stack,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import HistoryIcon from '@mui/icons-material/History'
import { useTranslation } from 'react-i18next'
import axiosInstance from '../api/axiosInstance'
import useSmartStore from '../store/useSmartStore'

const QuickAddModal = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const fetchInventory = useSmartStore((state) => state.fetchInventory)
  const user = useSmartStore((state) => state.user)
  const storeId = user?.storeId

  const [itemName, setItemName] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentItems, setRecentItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [showFullForm, setShowFullForm] = useState(false)

  // Form fields
  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    category: '',
    quantity: 1,
    unit: 'pcs',
    mrp: 0,
    sellingPrice: 0,
    status: 'active',
  })

  const searchTimeoutRef = useRef(null)

  // Fetch recent items on mount
  useEffect(() => {
    if (open && storeId) {
      fetchRecentItems()
    }
  }, [open, storeId])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setItemName('')
      setSelectedSuggestion(null)
      setShowFullForm(false)
      setFormData({
        itemName: '',
        brand: '',
        category: '',
        quantity: 1,
        unit: 'pcs',
        mrp: 0,
        sellingPrice: 0,
        status: 'active',
      })
    }
  }, [open])

  const fetchRecentItems = async () => {
    try {
      const response = await axiosInstance.get('/api/inventory/recent', {
        params: { limit: 5 },
      })
      setRecentItems(response.data.recent || [])
    } catch (error) {
      console.warn('Failed to fetch recent items:', error)
    }
  }

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      const response = await axiosInstance.get('/api/inventory/suggestions', {
        params: { query, limit: 8 },
      })
      setSuggestions(response.data.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleItemNameChange = (value) => {
    setItemName(value)
    setFormData((prev) => ({ ...prev, itemName: value }))

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion)
    setItemName(suggestion.itemName)
    setFormData({
      itemName: suggestion.itemName,
      brand: suggestion.brand || '',
      category: suggestion.category || '',
      quantity: 1,
      unit: suggestion.unit || 'pcs',
      mrp: suggestion.price?.mrp || suggestion.price?.sellingPrice || 0,
      sellingPrice: suggestion.price?.sellingPrice || suggestion.price?.mrp || 0,
      status: 'active',
    })
    setSuggestions([])
  }

  const handleSelectRecent = (item) => {
    handleSelectSuggestion(item)
  }

  const handleSubmit = async () => {
    if (!formData.itemName || !formData.brand || !formData.category) {
      return
    }

    // Validate required price fields
    if (!formData.mrp && !formData.sellingPrice) {
      alert(t('inventory.priceRequired', 'Please enter at least MRP or Selling Price'))
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        itemName: formData.itemName,
        brand: formData.brand,
        category: formData.category,
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit,
        price: {
          mrp: Number(formData.mrp) || Number(formData.sellingPrice) || 0,
          sellingPrice: Number(formData.sellingPrice) || Number(formData.mrp) || 0,
          // ownerDealPrice is optional, not included
        },
        status: formData.status,
      }

      await axiosInstance.post('/api/inventory', payload)
      await fetchInventory(true)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to add item:', error)
      alert(error.response?.data?.message || t('inventory.addFailed', 'Failed to add item'))
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = formData.itemName && formData.brand && formData.category && (formData.mrp > 0 || formData.sellingPrice > 0)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {t('inventory.quickAdd', 'Quick Add Item')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Item Name Input with Autocomplete */}
          <Box>
            <TextField
              autoFocus
              fullWidth
              label={t('inventory.itemName')}
              value={itemName}
              onChange={(e) => handleItemNameChange(e.target.value)}
              placeholder={t('inventory.itemNamePlaceholder', 'Type item name, brand, or category...')}
              InputProps={{
                endAdornment: isSearching && <CircularProgress size={20} />,
              }}
            />

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <Paper
                elevation={3}
                sx={{
                  mt: 1,
                  maxHeight: 300,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton onClick={() => handleSelectSuggestion(suggestion)}>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={600}>
                                {suggestion.itemName}
                              </Typography>
                              {suggestion.frequency > 1 && (
                                <Chip
                                  label={`${suggestion.frequency}x`}
                                  size="small"
                                  color="primary"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                              {suggestion.brand && (
                                <Typography variant="caption" color="text.secondary">
                                  {suggestion.brand}
                                </Typography>
                              )}
                              {suggestion.category && (
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {suggestion.category}
                                  </Typography>
                                </>
                              )}
                              {suggestion.price?.sellingPrice && (
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="caption" color="primary" fontWeight={600}>
                                    ₹{suggestion.price.sellingPrice}
                                  </Typography>
                                </>
                              )}
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Recent Items */}
            {!itemName && recentItems.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <HistoryIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {t('inventory.recentItems', 'Recent Items')}
                  </Typography>
                </Stack>
                <List dense>
                  {recentItems.map((item, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton onClick={() => handleSelectRecent(item)}>
                        <ListItemText
                          primary={item.itemName}
                          secondary={
                            <Stack direction="row" spacing={1} mt={0.5}>
                              {item.brand && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.brand}
                                </Typography>
                              )}
                              {item.price?.sellingPrice && (
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="caption" color="primary" fontWeight={600}>
                                    ₹{item.price.sellingPrice}
                                  </Typography>
                                </>
                              )}
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* Full Form (shown when suggestion selected or "Add Details" clicked) */}
          {(selectedSuggestion || showFullForm) && (
            <>
              <Divider />
              <Stack spacing={2}>
                <TextField
                  label={t('inventory.brand')}
                  value={formData.brand}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label={t('inventory.category')}
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  fullWidth
                  required
                />
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
            </>
          )}

          {/* Show "Add Details" button if item name entered but no suggestion selected */}
          {itemName && !selectedSuggestion && !showFullForm && (
            <Button
              variant="outlined"
              onClick={() => setShowFullForm(true)}
              startIcon={<AddIcon />}
              fullWidth
            >
              {t('inventory.addDetails', 'Add Details')}
            </Button>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!canSubmit || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <AddIcon />}
        >
          {isLoading ? t('common.loading') : t('inventory.addItem', 'Add Item')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuickAddModal

