import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PaymentIcon from '@mui/icons-material/Payment'
import ClearIcon from '@mui/icons-material/Clear'
import useSmartStore from '../store/useSmartStore'
import { useTranslation } from 'react-i18next'

const POSPage = () => {
  const { t } = useTranslation()

  // Store state
  const items = useSmartStore((state) => state.items)
  const fetchInventory = useSmartStore((state) => state.fetchInventory)
  const isInventoryLoading = useSmartStore((state) => state.isInventoryLoading)
  const cart = useSmartStore((state) => state.cart)
  const addToCart = useSmartStore((state) => state.addToCart)
  const removeFromCart = useSmartStore((state) => state.removeFromCart)
  const updateCartItem = useSmartStore((state) => state.updateCartItem)
  const clearCart = useSmartStore((state) => state.clearCart)
  const getCartTotal = useSmartStore((state) => state.getCartTotal)
  const createSale = useSmartStore((state) => state.createSale)
  const isSalesLoading = useSmartStore((state) => state.isSalesLoading)
  const salesError = useSmartStore((state) => state.salesError)

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items.filter((item) => (item.quantity || 0) > 0).slice(0, 50) // Show top 50 in-stock items
    }

    const query = searchQuery.toLowerCase()
    return items
      .filter(
        (item) =>
          item.itemName?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.barcode?.toLowerCase().includes(query)
      )
      .filter((item) => (item.quantity || 0) > 0)
      .slice(0, 50)
  }, [items, searchQuery])

  const cartTotal = getCartTotal()

  const handleAddToCart = (item) => {
    if ((item.quantity || 0) <= 0) {
      alert(t('pos.outOfStock', 'Item is out of stock'))
      return
    }

    const existingCartItem = cart.find((cartItem) => cartItem.itemId === item._id)
    if (existingCartItem) {
      const currentStock = item.quantity || 0
      if (existingCartItem.quantity >= currentStock) {
        alert(t('pos.insufficientStock', { available: currentStock }))
        return
      }
    }

    addToCart(item, 1)
  }

  const handleQuantityChange = (itemId, change) => {
    const cartItem = cart.find((item) => item.itemId === itemId)
    if (!cartItem) return

    const inventoryItem = items.find((item) => item._id === itemId)
    if (!inventoryItem) return

    const newQuantity = cartItem.quantity + change
    const availableStock = inventoryItem.quantity || 0

    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    if (newQuantity > availableStock) {
      alert(t('pos.insufficientStock', { available: availableStock }))
      return
    }

    updateCartItem(itemId, { quantity: newQuantity })
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(t('pos.emptyCart', 'Cart is empty'))
      return
    }
    setPaymentDialogOpen(true)
  }

  const handleProcessPayment = async () => {
    try {
      const saleData = {
        items: cart.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          brand: item.brand,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          subtotal: item.subtotal,
        })),
        subtotal: cartTotal.subtotal,
        discount: cartTotal.discount,
        tax: cartTotal.tax,
        total: cartTotal.total,
        paymentMethod,
        payments: [{ method: paymentMethod, amount: cartTotal.total }],
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        saleType: 'retail',
      }

      await createSale(saleData)
      setPaymentDialogOpen(false)
      setCustomerName('')
      setCustomerPhone('')
      setPaymentMethod('cash')
      alert(t('pos.saleCompleted', 'Sale completed successfully!'))
    } catch (error) {
      console.error('Sale error:', error)
      alert(error.response?.data?.error || t('pos.saleFailed', 'Failed to complete sale'))
    }
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        {t('pos.title', 'Point of Sale')}
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side: Item Search & Selection */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <TextField
              fullWidth
              placeholder={t('pos.searchItems', 'Search items by name, brand, or barcode...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {isInventoryLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredItems.length === 0 ? (
              <Alert severity="info">{t('pos.noItemsFound', 'No items found')}</Alert>
            ) : (
              <Box
                sx={{
                  maxHeight: 'calc(100vh - 300px)',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {filteredItems.map((item) => {
                  const inCart = cart.find((cartItem) => cartItem.itemId === item._id)
                  const stock = item.quantity || 0
                  const isOutOfStock = stock <= 0

                  return (
                    <Paper
                      key={item._id}
                      elevation={1}
                      sx={{
                        p: 2,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.6 : 1,
                        border: inCart ? '2px solid' : '1px solid',
                        borderColor: inCart ? 'primary.main' : 'divider',
                        '&:hover': isOutOfStock ? {} : { boxShadow: 3 },
                      }}
                      onClick={() => !isOutOfStock && handleAddToCart(item)}
                    >
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {item.itemName}
                        </Typography>
                        {item.brand && (
                          <Typography variant="caption" color="text.secondary">
                            {item.brand}
                          </Typography>
                        )}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            ₹{item.price?.sellingPrice || item.price?.mrp || 0}
                          </Typography>
                          <Chip
                            label={isOutOfStock ? t('pos.outOfStock', 'Out of Stock') : `${stock} ${item.unit || 'pcs'}`}
                            size="small"
                            color={isOutOfStock ? 'error' : stock <= 10 ? 'warning' : 'default'}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Stack>
                        {inCart && (
                          <Typography variant="caption" color="primary" fontWeight={600}>
                            {t('pos.inCart', { quantity: inCart.quantity })}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  )
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Side: Cart */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <ShoppingCartIcon color="primary" />
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('pos.cart', 'Cart')} ({cart.length})
              </Typography>
            </Stack>

            {cart.length === 0 ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stack spacing={2} alignItems="center">
                  <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('pos.emptyCart', 'Cart is empty')}
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <>
                <List sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                  {cart.map((item) => {
                    const inventoryItem = items.find((i) => i._id === item.itemId)
                    return (
                      <ListItem
                        key={item.itemId}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          mb: 1,
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {item.itemName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{item.unitPrice} × {item.quantity} = ₹{item.subtotal}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => removeFromCart(item.itemId)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.itemId, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.itemId, 1)}
                            disabled={!inventoryItem || item.quantity >= (inventoryItem.quantity || 0)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </ListItem>
                    )
                  })}
                </List>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('pos.subtotal', 'Subtotal')}:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{cartTotal.subtotal.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>
                      {t('pos.total', 'Total')}:
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      ₹{cartTotal.total.toFixed(2)}
                    </Typography>
                  </Stack>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<PaymentIcon />}
                    onClick={handleCheckout}
                    disabled={isSalesLoading}
                    sx={{ py: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    {isSalesLoading ? t('pos.processing', 'Processing...') : t('pos.checkout', 'Checkout')}
                  </Button>

                  {cart.length > 0 && (
                    <Button variant="outlined" size="small" fullWidth onClick={clearCart} startIcon={<ClearIcon />}>
                      {t('pos.clearCart', 'Clear Cart')}
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('pos.selectPayment', 'Select Payment Method')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl>
              <FormLabel>{t('pos.paymentMethod', 'Payment Method')}</FormLabel>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <FormControlLabel value="cash" control={<Radio />} label={t('pos.cash', 'Cash')} />
                <FormControlLabel value="upi" control={<Radio />} label={t('pos.upi', 'UPI')} />
                <FormControlLabel value="card" control={<Radio />} label={t('pos.card', 'Card')} />
                <FormControlLabel value="credit" control={<Radio />} label={t('pos.credit', 'Credit')} />
              </RadioGroup>
            </FormControl>

            <TextField
              label={t('pos.customerName', 'Customer Name (Optional)')}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
            />

            <TextField
              label={t('pos.customerPhone', 'Customer Phone (Optional)')}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              fullWidth
            />

            <Alert severity="info">
              {t('pos.totalAmount', { amount: cartTotal.total.toFixed(2) })}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleProcessPayment} variant="contained" disabled={isSalesLoading}>
            {isSalesLoading ? t('pos.processing', 'Processing...') : t('pos.completeSale', 'Complete Sale')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default POSPage

