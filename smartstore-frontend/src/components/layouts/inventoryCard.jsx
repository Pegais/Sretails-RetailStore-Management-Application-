import { Card, CardContent, Typography, Chip, Stack, Box, Divider, Tooltip, Badge, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useTranslation } from 'react-i18next'

const roundToTwoDecimalPlaces = (num) => Math.round((num + Number.EPSILON) * 100) / 100

const InventoryItemCard = ({ item, onEdit, onDelete, onQuantityChange }) => {
  const { t } = useTranslation()
  const {
    itemName,
    brand,
    category,
    quantity,
    unit,
    specifications,
    price,
    tags,
    images,
    addedAt,
    status,
  } = item

  const daysInInventory = addedAt ? Math.floor((Date.now() - new Date(addedAt)) / 86400000) : '-'

  const statusPalette = {
    active: { label: 'In rotation', color: 'success' },
    'low-demand': { label: 'Slow mover', color: 'warning' },
    stale: { label: 'Stale', color: 'error' },
    archived: { label: 'Archived', color: 'default' },
  }

  const statusChip = statusPalette[status] || statusPalette.active

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: { xs: 2, sm: 3 },
        borderRadius: { xs: 2, sm: 3 },
        background: '#fff',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                color: '#333',
                textTransform: 'uppercase',
                fontSize: { xs: '0.95rem', sm: '1.25rem' },
                wordBreak: 'break-word',
              }}
            >
              {itemName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              {category || 'Uncategorized'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            {brand && (
              <Chip
                label={brand}
                variant="outlined"
                size="small"
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 },
                }}
              />
            )}
            <Badge
              color={statusChip.color}
              badgeContent={statusChip.label}
              sx={{
                '& .MuiBadge-badge': {
                  textTransform: 'capitalize',
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                },
              }}
            />
          </Stack>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#555',
            mt: 0.5,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            wordBreak: 'break-word',
          }}
        >
          {[specifications?.variant, specifications?.color, specifications?.material, specifications?.size]
            .filter(Boolean)
            .join(' • ') || 'No specifications'}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems="baseline" mt={1}>
          <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            ₹{price?.sellingPrice ?? price?.mrp ?? 0}
          </Typography>
          {price?.sellingPrice && price?.sellingPrice !== price?.mrp && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                ₹{price?.mrp}
              </Typography>
              <Typography variant="caption" color="success.main">
                Save ₹{roundToTwoDecimalPlaces(price.mrp - price.sellingPrice)}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Typography variant="body2" mt={1}>
          In Stock:{' '}
          <strong>
            {quantity} {unit}
          </strong>
        </Typography>

        {tags?.length > 0 && (
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {tags.slice(0, 4).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Tooltip title={t('inventory.daysInStock', { days: daysInInventory })}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              🕒 {t('inventory.daysInStock', { days: daysInInventory })}
            </Typography>
          </Tooltip>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {/* Quantity Controls */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => onQuantityChange && onQuantityChange(item._id, 'decrease', 1)}
                disabled={!onQuantityChange}
                sx={{ p: 0.5 }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onQuantityChange && onQuantityChange(item._id, 'increase', 1)}
                disabled={!onQuantityChange}
                sx={{ p: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>
            {/* Edit/Delete Buttons */}
            {onEdit && (
              <IconButton size="small" onClick={() => onEdit(item)} sx={{ p: 0.5 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton size="small" onClick={() => onDelete(item._id)} color="error" sx={{ p: 0.5 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default InventoryItemCard
