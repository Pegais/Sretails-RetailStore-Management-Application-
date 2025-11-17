import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import useSmartStore from '../store/useSmartStore'
import { useTranslation } from 'react-i18next'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'success',
    pending: 'warning',
    processing: 'info',
    failed: 'error',
    manual_review_needed: 'warning',
    parsing_failed: 'error',
  }
  return colors[status] || 'default'
}

const getBillTypeIcon = (billType) => {
  switch (billType) {
    case 'image':
      return <DescriptionIcon />
    case 'excel':
      return <InsertDriveFileIcon />
    case 'pdf':
      return <PictureAsPdfIcon />
    default:
      return <InsertDriveFileIcon />
  }
}

const UploadedDocumentsPage = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  // Use individual selectors to avoid creating new objects on every render
  const allBills = useSmartStore((state) => state.allBills)
  const isBillsLoading = useSmartStore((state) => state.isBillsLoading)
  const billsError = useSmartStore((state) => state.billsError)
  const billsPagination = useSmartStore((state) => state.billsPagination)
  const fetchAllBills = useSmartStore((state) => state.fetchAllBills)

  const [selectedBill, setSelectedBill] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterBillType, setFilterBillType] = useState('')

  useEffect(() => {
    // Zustand functions are stable, so we can safely call fetchAllBills directly
    fetchAllBills({ page, limit: 20, status: filterStatus || undefined, billType: filterBillType || undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus, filterBillType])

  const handleViewBill = (bill) => {
    setSelectedBill(bill)
  }

  const handleCloseDialog = () => {
    setSelectedBill(null)
  }

  const handleDownload = (fileUrl, fileName) => {
    window.open(fileUrl, '_blank')
  }

  if (isBillsLoading && allBills.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: 'primary.main', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {t('documents.uploadedDocuments')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {t('documents.viewTrack')}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }} flexWrap="wrap">
          <Typography variant="body2" fontWeight={500}>
            {t('common.filter')}:
          </Typography>
          <Chip
            label={t('documents.allStatus')}
            onClick={() => setFilterStatus('')}
            color={filterStatus === '' ? 'primary' : 'default'}
            variant={filterStatus === '' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label={t('documents.completed')}
            onClick={() => setFilterStatus('completed')}
            color={filterStatus === 'completed' ? 'primary' : 'default'}
            variant={filterStatus === 'completed' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label={t('documents.pending')}
            onClick={() => setFilterStatus('pending')}
            color={filterStatus === 'pending' ? 'primary' : 'default'}
            variant={filterStatus === 'pending' ? 'filled' : 'outlined'}
            size="small"
          />
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={t('documents.allTypes')}
            onClick={() => setFilterBillType('')}
            color={filterBillType === '' ? 'primary' : 'default'}
            variant={filterBillType === '' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label={t('documents.images')}
            onClick={() => setFilterBillType('image')}
            color={filterBillType === 'image' ? 'primary' : 'default'}
            variant={filterBillType === 'image' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label={t('documents.excel')}
            onClick={() => setFilterBillType('excel')}
            color={filterBillType === 'excel' ? 'primary' : 'default'}
            variant={filterBillType === 'excel' ? 'filled' : 'outlined'}
            size="small"
          />
        </Stack>
      </Paper>

      {billsError && (
        <Alert severity="error" action={<IconButton onClick={() => fetchAllBills({ page })}>Retry</IconButton>}>
          {billsError}
        </Alert>
      )}

          {allBills.length === 0 && !isBillsLoading ? (
            <Alert severity="info">{t('documents.noDocumentsFound')}</Alert>
          ) : (
        <>
          {/* Grid View */}
          <ImageList
            cols={{ xs: 1, sm: 2, md: 3 }}
            gap={{ xs: 8, sm: 12, md: 16 }}
            sx={{ m: 0 }}
          >
            {allBills.map((bill) => (
              <ImageListItem key={bill._id} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {bill.billType === 'image' ? (
                  <Box
                    component="img"
                    src={bill.fileUrl}
                    alt={bill.originalFileName}
                    sx={{
                      width: '100%',
                      height: { xs: 200, sm: 250, md: 300 },
                      objectFit: 'cover',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.9 },
                    }}
                    onClick={() => handleViewBill(bill)}
                  />
                ) : (
                  <Paper
                    elevation={2}
                    sx={{
                      width: '100%',
                      height: { xs: 200, sm: 250, md: 300 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      cursor: 'pointer',
                      p: { xs: 2, sm: 3 },
                      '&:hover': { bgcolor: 'grey.200' },
                    }}
                    onClick={() => handleViewBill(bill)}
                  >
                    <Avatar sx={{ width: { xs: 48, sm: 56, md: 64 }, height: { xs: 48, sm: 56, md: 64 }, bgcolor: 'primary.main', mb: { xs: 1, sm: 2 } }}>
                      {getBillTypeIcon(bill.billType)}
                    </Avatar>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      textAlign="center"
                      px={2}
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word',
                      }}
                    >
                      {bill.originalFileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" mt={1} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      {t('documents.clickToView')}
                    </Typography>
                  </Paper>
                )}
                <ImageListItemBar
                  title={bill.originalFileName}
                  subtitle={
                    <Stack direction="row" spacing={1} mt={0.5}>
                      <Chip
                        label={bill.status}
                        size="small"
                        color={getStatusColor(bill.status)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {bill.itemsParsed} {t('documents.items')}
                      </Typography>
                    </Stack>
                  }
                  actionIcon={
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        sx={{ color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewBill(bill)
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        sx={{ color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(bill.fileUrl, bill.originalFileName)
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>

          {/* Pagination */}
          {billsPagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={billsPagination.totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Bill Detail Dialog */}
      <Dialog open={!!selectedBill} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('documents.billDetails')}</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Stack spacing={3}>
              {/* Bill Preview */}
              {selectedBill.billType === 'image' ? (
                <Box
                  component="img"
                  src={selectedBill.fileUrl}
                  alt={selectedBill.originalFileName}
                  sx={{ width: '100%', borderRadius: 2, maxHeight: '60vh', objectFit: 'contain' }}
                />
              ) : (
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    minHeight: 200,
                  }}
                >
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
                    {getBillTypeIcon(selectedBill.billType)}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedBill.originalFileName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {t('documents.downloadToView')}
                  </Typography>
                  <IconButton
                    onClick={() => handleDownload(selectedBill.fileUrl, selectedBill.originalFileName)}
                    sx={{ mt: 2 }}
                    color="primary"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Paper>
              )}

              {/* Bill Information */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('documents.fileName')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedBill.originalFileName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('inventory.status')}
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={selectedBill.status}
                      size="small"
                      color={getStatusColor(selectedBill.status)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('documents.dealerName')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedBill.dealerName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('documents.invoiceNumber')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedBill.invoiceNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('documents.totalAmount')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    ₹{selectedBill.totalAmount || '0'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('documents.itemsExtracted')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedBill.itemsParsed || 0} {t('documents.items')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('documents.uploadedAt')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(selectedBill.uploadedAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    {t('documents.processedAt')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(selectedBill.processedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

export default UploadedDocumentsPage

