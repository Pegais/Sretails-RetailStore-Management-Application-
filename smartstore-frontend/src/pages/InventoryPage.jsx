import { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Stack,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Chip,
  Paper,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import InventoryItemCard from '../components/layouts/inventoryCard'
import useSmartStore from '../store/useSmartStore'
import { useTranslation } from 'react-i18next'
import QuickAddModal from '../components/QuickAddModal'

const InventorySkeleton = () => (
  <Stack spacing={2} sx={{ mb: 3 }}>
    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
  </Stack>
)

const InventoryPage = () => {
  const { t } = useTranslation()
  const items = useSmartStore((state) => state.items)
  const isInventoryLoading = useSmartStore((state) => state.isInventoryLoading)
  const inventoryError = useSmartStore((state) => state.inventoryError)
  const fetchInventory = useSmartStore((state) => state.fetchInventory)
  const updateInventoryItem = useSmartStore((state) => state.updateInventoryItem)
  const updateQuantity = useSmartStore((state) => state.updateQuantity)
  const deleteInventoryItem = useSmartStore((state) => state.deleteInventoryItem)
  const user = useSmartStore((state) => state.user)
  const storeId = user?.storeId

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [filter, setFilter] = useState('all') // 'all', 'low-stock', 'slow-mover', 'stale', 'active'
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => {
    if (storeId) {
      fetchInventory()
    }
  }, [fetchInventory, storeId])

  // Keyboard shortcut handler (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setQuickAddOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleRetry = () => {
    fetchInventory(true)
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setEditForm({
      itemName: item.itemName || '',
      brand: item.brand || '',
      category: item.category || '',
      quantity: item.quantity || 0,
      unit: item.unit || 'pcs',
      price: {
        mrp: item.price?.mrp || 0,
        sellingPrice: item.price?.sellingPrice || 0,
        ownerDealPrice: item.price?.ownerDealPrice || 0,
      },
      status: item.status || 'active',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      await updateInventoryItem(selectedItem._id, { ...editForm, reason: 'Manual edit' })
      setSnackbar({ open: true, message: t('inventory.itemUpdated'), severity: 'success' })
      setEditDialogOpen(false)
      fetchInventory(true)
    } catch (error) {
      setSnackbar({ open: true, message: error.message || t('inventory.updateFailed', 'Failed to update item'), severity: 'error' })
    }
  }

  const handleDelete = (itemId) => {
    setSelectedItem(items.find((i) => i._id === itemId))
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteInventoryItem(selectedItem._id, 'Manual deletion')
      setSnackbar({ open: true, message: t('inventory.itemDeleted'), severity: 'success' })
      setDeleteDialogOpen(false)
      fetchInventory(true)
    } catch (error) {
      setSnackbar({ open: true, message: error.message || t('inventory.deleteFailed', 'Failed to delete item'), severity: 'error' })
    }
  }

  const handleQuantityChange = async (itemId, action, amount) => {
    try {
      await updateQuantity(itemId, action, amount, `Quantity ${action} by ${amount}`)
      setSnackbar({ open: true, message: t('inventory.quantityUpdated', { action }), severity: 'success' })
      fetchInventory(true)
    } catch (error) {
      setSnackbar({ open: true, message: error.message || t('inventory.quantityUpdateFailed', 'Failed to update quantity'), severity: 'error' })
    }
  }

  // Filter items based on selected filter
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items

    switch (filter) {
      case 'low-stock':
        return items.filter((item) => (Number(item.quantity) || 0) <= 10)
      case 'slow-mover':
        return items.filter((item) => item.status === 'low-demand')
      case 'stale':
        return items.filter((item) => item.status === 'stale')
      case 'active':
        return items.filter((item) => item.status === 'active')
      default:
        return items
    }
  }, [items, filter])

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {t('inventory.myInventory')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {isInventoryLoading
              ? t('inventory.refreshingItems')
              : storeId
                ? `${filteredItems.length} ${t('inventory.of')} ${items.length} ${t('inventory.skus')}${filter !== 'all' ? ` (${t(`inventory.${filter.replace('-', '')}`)})` : ''} • ${t('inventory.updatedJustNow')}`
                : t('inventory.waitingForStoreContext')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setQuickAddOpen(true)}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {t('inventory.quickAdd', 'Quick Add')}
          </Button>
          <Chip
            label="Ctrl+K"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          />
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
          <FilterListIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {t('common.filter')}:
          </Typography>
          <Chip
            label={t('inventory.allItems')}
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            variant={filter === 'all' ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          />
          <Chip
            label={t('inventory.lowStock')}
            onClick={() => setFilter('low-stock')}
            color={filter === 'low-stock' ? 'warning' : 'default'}
            variant={filter === 'low-stock' ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          />
          <Chip
            label={t('inventory.slowMover')}
            onClick={() => setFilter('slow-mover')}
            color={filter === 'slow-mover' ? 'warning' : 'default'}
            variant={filter === 'slow-mover' ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          />
          <Chip
            label={t('inventory.stale')}
            onClick={() => setFilter('stale')}
            color={filter === 'stale' ? 'error' : 'default'}
            variant={filter === 'stale' ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          />
          <Chip
            label={t('inventory.active')}
            onClick={() => setFilter('active')}
            color={filter === 'active' ? 'success' : 'default'}
            variant={filter === 'active' ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          />
        </Stack>
      </Paper>

      {inventoryError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Typography
              variant="body2"
              component="button"
              onClick={handleRetry}
              sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'underline', background: 'none', border: 0 }}
            >
              Retry
            </Typography>
          }
        >
          {inventoryError}
        </Alert>
      )}

      {isInventoryLoading && !items.length ? (
        <>
          <InventorySkeleton />
          <InventorySkeleton />
        </>
      ) : filteredItems.length ? (
        filteredItems.map((item) => (
          <InventoryItemCard
            key={item._id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onQuantityChange={handleQuantityChange}
          />
        ))
      ) : storeId ? (
        <Alert severity="info">
          {filter !== 'all'
            ? t('inventory.noItemsForFilter', { filter: t(`inventory.${filter.replace('-', '')}`) })
            : t('inventory.noItemsFound')}
        </Alert>
      ) : (
        <Alert severity="warning">Store context missing. Please relogin.</Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('inventory.editInventoryItem')}</Typography>
            <IconButton onClick={() => setEditDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('inventory.itemName')}
              value={editForm.itemName || ''}
              onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label={t('inventory.brand')}
              value={editForm.brand || ''}
              onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('inventory.category')}
              value={editForm.category || ''}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('inventory.quantity')}
                type="number"
                value={editForm.quantity || 0}
                onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) || 0 })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>{t('inventory.unit')}</InputLabel>
                <Select
                  value={editForm.unit || 'pcs'}
                  label={t('inventory.unit')}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                >
                  <MenuItem value="pcs">Pcs</MenuItem>
                  <MenuItem value="kg">Kg</MenuItem>
                  <MenuItem value="litres">Litres</MenuItem>
                  <MenuItem value="boxes">Boxes</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('inventory.mrp')}
                type="number"
                value={editForm.price?.mrp || 0}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    price: { ...editForm.price, mrp: Number(e.target.value) || 0 },
                  })
                }
                fullWidth
              />
              <TextField
                label={t('inventory.sellingPrice')}
                type="number"
                value={editForm.price?.sellingPrice || 0}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    price: { ...editForm.price, sellingPrice: Number(e.target.value) || 0 },
                  })
                }
                fullWidth
              />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>{t('inventory.status')}</InputLabel>
              <Select
                value={editForm.status || 'active'}
                label={t('inventory.status')}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <MenuItem value="active">{t('inventory.active')}</MenuItem>
                <MenuItem value="low-demand">{t('inventory.slowMover')}</MenuItem>
                <MenuItem value="stale">{t('inventory.stale')}</MenuItem>
                <MenuItem value="archived">{t('inventory.archived', 'Archived')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            {t('inventory.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('inventory.deleteItem')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('inventory.confirmDelete', { itemName: selectedItem?.itemName })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Add Modal */}
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={() => {
          setSnackbar({ open: true, message: t('inventory.itemAdded', 'Item added successfully'), severity: 'success' })
        }}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  )
}

export default InventoryPage