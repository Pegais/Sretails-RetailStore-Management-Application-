import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import RefreshIcon from '@mui/icons-material/Refresh'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import WarningIcon from '@mui/icons-material/Warning'
import HistoryIcon from '@mui/icons-material/History'
import useSmartStore from '../store/useSmartStore'
import InventoryChangeLogs from '../components/InventoryChangeLogs'

const TERMINAL_BILL_STATUSES = ['completed', 'failed', 'manual_review_needed', 'parsing_failed']

const StatCard = ({ label, value, helper, icon: Icon, color = 'primary', isLoading, error }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      borderRadius: { xs: 2, sm: 3 },
      border: '1px solid',
      borderColor: 'divider',
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(6px)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 2,
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: `${color}.light`,
          color: `${color}.main`,
          width: { xs: 40, sm: 44 },
          height: { xs: 40, sm: 44 },
        }}
      >
        <Icon fontSize={isLoading ? 'small' : 'medium'} />
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          {label}
        </Typography>
        {isLoading ? (
          <CircularProgress size={20} sx={{ mt: 0.5 }} />
        ) : error ? (
          <Typography variant="caption" color="error" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Error
          </Typography>
        ) : (
          <>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                lineHeight: 1.2,
                mt: 0.25,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
            {helper && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, display: 'block', mt: 0.25 }}
              >
                {helper}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Stack>
  </Paper>
)

const isoToday = () => new Date().toISOString().slice(0, 10)
const isoDaysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const DashboardPage = () => {
  const theme = useTheme()
  const fetchInventory = useSmartStore((s) => s.fetchInventory)
  const items = useSmartStore((s) => s.items)
  const isInventoryLoading = useSmartStore((s) => s.isInventoryLoading)

  const fetchDailySales = useSmartStore((s) => s.fetchDailySales)
  const fetchPaymentAnalytics = useSmartStore((s) => s.fetchPaymentAnalytics)
  const dailySummary = useSmartStore((s) => s.dailySummary)
  const paymentAnalytics = useSmartStore((s) => s.paymentAnalytics)
  const paymentsError = useSmartStore((s) => s.paymentsError)

  const uploadDealerBill = useSmartStore((s) => s.uploadDealerBill)
  const uploads = useSmartStore((s) => s.uploads)
  const isUploadingBill = useSmartStore((s) => s.isUploadingBill)
  const uploadError = useSmartStore((s) => s.uploadError)
  const refreshBillStatus = useSmartStore((s) => s.refreshBillStatus)

  const [selectedDate] = useState(isoToday)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  useEffect(() => {
    fetchDailySales(selectedDate)
    fetchPaymentAnalytics({ startDate: isoDaysAgo(7), endDate: new Date().toISOString() })
  }, [fetchDailySales, fetchPaymentAnalytics, selectedDate])

  const lowStockItems = useMemo(() => {
    // Filter low stock items
    const filtered = items.filter((item) => (Number(item.quantity) || 0) <= 10)
    
    // Deduplicate by itemName - keep only the one with lowest quantity
    const itemMap = new Map()
    filtered.forEach((item) => {
      const key = (item.itemName || '').toLowerCase().trim()
      const existing = itemMap.get(key)
      const currentQty = Number(item.quantity) || 0
      
      if (!existing || currentQty < (Number(existing.quantity) || 0)) {
        itemMap.set(key, item)
      }
    })
    
    // Convert back to array, sort by quantity, and take top 4
    return Array.from(itemMap.values())
      .sort((a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0))
      .slice(0, 4)
  }, [items])

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${dailySummary?.summary?.totalSales?.toLocaleString() || 0}`,
      helper: `${dailySummary?.summary?.transactionCount || 0} transactions`,
      icon: MonetizationOnIcon,
      color: 'success',
    },
    {
      label: 'Cash vs Digital',
      value: `${dailySummary?.summary?.cash || 0} / ₹${
        (dailySummary?.summary?.upi || 0) + (dailySummary?.summary?.card || 0)
      }`,
      helper: 'Cash / Digital split',
      icon: TrendingUpIcon,
      color: 'primary',
    },
    {
      label: 'Inventory Items',
      value: items.length,
      helper: `${lowStockItems.length} low-stock SKUs`,
      icon: Inventory2Icon,
      color: 'secondary',
    },
    {
      label: 'Uploads in queue',
      value: uploads.filter((u) => !TERMINAL_BILL_STATUSES.includes(u.status)).length,
      helper: 'Dealer bills processing',
      icon: WarningIcon,
      color: 'warning',
    },
  ]

  const salesByChannel = useMemo(() => {
    const palette = {
      cash: '#66bb6a',
      upi: '#42a5f5',
      card: '#ffa726',
      credit: '#ab47bc',
    }
    return paymentAnalytics.map((entry) => ({
      channel: entry._id.toUpperCase(),
      value: entry.totalAmount,
      count: entry.count,
      color: palette[entry._id] || theme.palette.primary.main,
    }))
  }, [paymentAnalytics, theme.palette.primary.main])

  const handleFiles = async (files) => {
    const file = files?.[0]
    if (!file) return
    await uploadDealerBill(file)
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setDragActive(false)
    await handleFiles(event.dataTransfer.files)
  }

  const handleDrag = (event) => {
    event.preventDefault()
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const guidance = [
    {
      title: 'Snap & upload (AI)',
      formats: '.jpg / .jpeg / .png',
      description: 'Uploads to S3, runs OCR + GPT, auto-creates items when complete.',
    },
    {
      title: 'Dealer Excel',
      formats: '.xls / .xlsx',
      description: 'Sheet 1 dealer metadata, Sheet 2 items. Parsed instantly and stored on S3.',
    },
  ]

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      <Box
        sx={{
          borderRadius: { xs: 2, sm: 4 },
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}25)`,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            Welcome back
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Today&apos;s live snapshot
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Track revenue, stock health, and dealer uploads as they happen.
          </Typography>
        </Stack>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 4 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Payments today
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDate}
                </Typography>
              </Box>
              {paymentsError && <Chip label={paymentsError} color="error" size="small" />}
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 1, sm: 2 }, height: { xs: 180, sm: 220 }, overflowX: 'auto', pb: 1 }}>
              {salesByChannel.length ? (
                salesByChannel.map((channel) => (
                  <Box key={channel.channel} sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        height: `${Math.min(channel.value / 1000, 1) * 100 + 15}%`,
                        minHeight: 24,
                        borderRadius: 2,
                        background: channel.color,
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <Typography variant="body2" textAlign="center" mt={1}>
                      {channel.channel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                      ₹{channel.value?.toLocaleString()} ({channel.count})
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No payment data yet.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 4 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Low stock alerts
            </Typography>
            {isInventoryLoading && <LinearProgress />}
            <Stack spacing={2} mt={2}>
              {lowStockItems.length ? (
                lowStockItems.map((item) => (
                  <Box
                    key={item._id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: theme.palette.error.light + '12',
                      border: `1px dashed ${theme.palette.error.light}`,
                    }}
                  >
                    <Typography fontWeight={600}>{item.itemName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only {item.quantity} {item.unit} left
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No items under the low-stock threshold.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Dealer Bill Upload Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 4 },
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Stack spacing={{ xs: 2, sm: 3 }}>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                    Dealer Bill Upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Upload JPEG bills for AI processing or Excel files for instant parsing. Both are stored securely in S3.
                  </Typography>
                </Box>
                <Chip label="Beta" color="primary" variant="outlined" size="small" sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }} />
              </Box>

          {/* Upload Guidance Cards */}
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {guidance.map((section) => (
              <Grid item xs={12} md={6} key={section.title}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    height: '100%',
                    borderRadius: { xs: 2, sm: 3 },
                    background:
                      section.title === 'Snap & upload (AI)'
                        ? 'linear-gradient(135deg, rgba(66,165,245,0.08), rgba(25,118,210,0.12))'
                        : 'linear-gradient(135deg, rgba(102,187,106,0.08), rgba(46,125,50,0.12))',
                    border:
                      section.title === 'Snap & upload (AI)'
                        ? '1px solid rgba(66,165,245,0.3)'
                        : '1px solid rgba(102,187,106,0.3)',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography fontWeight={600} color="primary">
                        {section.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formats: {section.formats}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {section.description}
                    </Typography>
                    <Divider />
                    <Stack spacing={0.5}>
                      {section.title === 'Snap & upload (AI)' ? (
                        <>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            • Use bright, top-down photos of bills
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            • Processing takes 30–60 seconds in background
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            • Status and extracted items appear below
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            • Sheet 1: Dealer metadata (name, GSTIN, invoice details)
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            • Sheet 2: Inventory line items (name, quantity, price, etc.)
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            • Items are added to inventory immediately after parsing
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Drag & Drop Upload Area */}
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: { xs: 2, sm: 3 },
              textAlign: 'center',
              border: dragActive ? `2px dashed ${theme.palette.primary.main}` : `2px dashed ${theme.palette.divider}`,
              backgroundColor: dragActive ? theme.palette.action.hover : 'transparent',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
              minHeight: { xs: 120, sm: 160 },
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.xls,.xlsx"
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                zIndex: 1,
              }}
              onChange={(event) => {
                handleFiles(event.target.files)
                event.target.value = ''
              }}
            />
            {isUploadingBill ? (
              <Stack alignItems="center" spacing={2}>
                <LinearProgress sx={{ width: '100%', maxWidth: 300 }} />
                <Typography variant="body2" color="text.secondary">
                  Uploading and processing...
                </Typography>
              </Stack>
            ) : (
              <Stack alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
                <CloudUploadIcon
                  sx={{
                    fontSize: { xs: 36, sm: 48 },
                    color: dragActive ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.2s ease',
                  }}
                />
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Drag & drop your bill here
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  or{' '}
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ textTransform: 'none', fontSize: { xs: '0.8rem', sm: '0.875rem' }, minHeight: { xs: 32, sm: 36 } }}
                  >
                    browse files
                  </Button>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Supported: JPEG, PNG, XLS, XLSX
                </Typography>
              </Stack>
            )}
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                Upload failed: {uploadError}
              </Alert>
            )}
          </Paper>

          {/* Recent Uploads List */}
          <Divider sx={{ my: 1 }} />
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Recent Bill Uploads
              </Typography>
              {isUploadingBill && <Chip label="Uploading…" size="small" color="primary" />}
            </Stack>
            {uploads.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No recent uploads. Drop a bill above to get started.
              </Typography>
            ) : (
              <List dense>
                {uploads.map((upload) => (
                  <ListItem
                    key={upload.id}
                    secondaryAction={
                      !TERMINAL_BILL_STATUSES.includes(upload.status) && (
                        <IconButton edge="end" onClick={() => refreshBillStatus(upload.id)} size="small">
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      )
                    }
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: upload.status === 'completed' ? 'success.light' + '15' : 'transparent',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar variant="rounded" sx={{ bgcolor: upload.mode === 'image' ? 'primary.light' : 'success.light' }}>
                        <InsertDriveFileIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={upload.fileName}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                          <Chip
                            label={upload.status.toUpperCase()}
                            size="small"
                            color={
                              upload.status === 'completed'
                                ? 'success'
                                : upload.status === 'failed' || upload.status === 'parsing_failed'
                                ? 'error'
                                : 'warning'
                            }
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            • {upload.itemsCreated || 0} items
                          </Typography>
                          {upload.mode && (
                            <Typography variant="caption" color="text.secondary">
                              • {upload.mode === 'image' ? 'AI Processing' : 'Excel Parse'}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
              </Box>
            </Stack>
          </Paper>

          {/* Inventory Change Logs Section */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: { xs: 2, sm: 4 },
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <HistoryIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                    Recent Inventory Changes
                  </Typography>
                </Stack>
                <InventoryChangeLogs limit={5} />
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: { xs: 2, sm: 4 },
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Inventory Analytics
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'primary.light' + '15',
                      border: '1px solid',
                      borderColor: 'primary.light',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Items
                    </Typography>
                    <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {items.length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'success.light' + '15',
                      border: '1px solid',
                      borderColor: 'success.light',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Active Items
                    </Typography>
                    <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {items.filter((i) => i.status === 'active').length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'warning.light' + '15',
                      border: '1px solid',
                      borderColor: 'warning.light',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Low Stock Items
                    </Typography>
                    <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {lowStockItems.length}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )
    }

    export default DashboardPage
