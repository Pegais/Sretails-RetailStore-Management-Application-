import { useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import EditIcon from '@mui/icons-material/Edit'
import useSmartStore from '../store/useSmartStore'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getChangeIcon = (changeType) => {
  switch (changeType) {
    case 'quantity_increase':
    case 'bill_upload':
      return <TrendingUpIcon />
    case 'quantity_decrease':
      return <TrendingDownIcon />
    case 'item_created':
      return <AddCircleIcon />
    case 'item_deleted':
      return <DeleteIcon />
    case 'item_updated':
      return <EditIcon />
    default:
      return <UploadFileIcon />
  }
}

const getChangeColor = (changeType) => {
  switch (changeType) {
    case 'quantity_increase':
    case 'item_created':
    case 'bill_upload':
      return 'success'
    case 'quantity_decrease':
      return 'warning'
    case 'item_deleted':
      return 'error'
    default:
      return 'info'
  }
}

const InventoryChangeLogs = ({ itemId = null, limit = 10 }) => {
  const changeLogs = useSmartStore((state) => state.changeLogs)
  const isChangeLogsLoading = useSmartStore((state) => state.isChangeLogsLoading)
  const changeLogsError = useSmartStore((state) => state.changeLogsError)
  const fetchChangeLogs = useSmartStore((state) => state.fetchChangeLogs)

  useEffect(() => {
    fetchChangeLogs(itemId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  const displayLogs = changeLogs.slice(0, limit)

  if (isChangeLogsLoading && changeLogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (changeLogsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {changeLogsError}
      </Alert>
    )
  }

  if (displayLogs.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No inventory changes recorded yet.
      </Alert>
    )
  }

  return (
    <List dense>
      {displayLogs.map((log, index) => (
        <Box key={log._id || index}>
          <ListItem
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${getChangeColor(log.changeType)}.light`, width: 36, height: 36 }}>
                {getChangeIcon(log.changeType)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {log.itemId?.itemName || 'Unknown Item'}
                  </Typography>
                  <Chip
                    label={log.changeType.replace(/_/g, ' ')}
                    size="small"
                    color={getChangeColor(log.changeType)}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </Stack>
              }
              secondary={
                <Box component="div" sx={{ mt: 0.5 }}>
                  {log.quantityChange !== undefined && log.quantityChange !== 0 && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Quantity: {log.oldQuantity} → {log.newQuantity} (
                      {log.quantityChange > 0 ? '+' : ''}
                      {log.quantityChange})
                    </Typography>
                  )}
                  {log.reason && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      {log.reason}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    {formatDate(log.createdAt)} • {log.changedBy?.name || 'System'}
                  </Typography>
                </Box>
              }
              secondaryTypographyProps={{ component: 'div' }}
            />
          </ListItem>
          {index < displayLogs.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  )
}

export default InventoryChangeLogs

