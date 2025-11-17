import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

const normalizeUser = (user) => {
  if (!user) return null

  const storeObj =
    typeof user.store === 'object' && user.store !== null
      ? user.store
      : typeof user.storeId === 'object'
        ? user.storeId
        : null

  const storeId =
    user.storeId && typeof user.storeId === 'string'
      ? user.storeId
      : storeObj?._id || storeObj?.id || user.storeId

  return {
    ...user,
    storeId,
    store: storeObj || user.store, // Preserve store object for access
    storeName: user.storeName || storeObj?.name || user.store?.name,
    storeCode: user.storeCode || storeObj?.storeCode || user.store?.storeCode,
  }
}

const createAuthSlice = (set, get) => ({
  user: null,
  isAuthLoading: false,
  authError: null,
  /**
   * Ping /auth/me to hydrate session if JWT cookie exists.
   */
  fetchSession: async () => {
    try {
      set({ isAuthLoading: true, authError: null }, false, 'auth/fetchSession:start')
      const response = await axiosInstance.get('/auth/me')
      const normalizedUser = normalizeUser(response.data.user)
      set(
        {
          user: normalizedUser,
          isAuthLoading: false,
          authError: null,
        },
        false,
        'auth/fetchSession:success'
      )
      return normalizedUser
    } catch (error) {
      set(
        {
          user: null,
          isAuthLoading: false,
          authError: error.response?.data?.message || error.message,
        },
        false,
        'auth/fetchSession:error'
      )
      return null
    }
  },
  /**
   * Optional helper to set user after login flow (Google redirect, email login, etc.)
   */
  setUser: (user) => set({ user: normalizeUser(user), authError: null }, false, 'auth/setUser'),
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      // backend already cleared cookie or network hiccup; log and continue
      console.warn('Logout warning:', error.message)
    } finally {
      set({ user: null }, false, 'auth/logout')
    }
  },
})

const createUiSlice = (set) => ({
  globalToast: null,
  setGlobalToast: (toast) => set({ globalToast: toast }, false, 'ui/setGlobalToast'),
  clearGlobalToast: () => set({ globalToast: null }, false, 'ui/clearGlobalToast'),
})

const createInventorySlice = (set, get) => ({
  items: [],
  isInventoryLoading: false,
  inventoryError: null,
  lastFetchedAt: null,
  changeLogs: [],
  isChangeLogsLoading: false,
  changeLogsError: null,
  async fetchInventory(force = false) {
    const storeId = get().user?.storeId
    if (!storeId) {
      set(
        {
          inventoryError: 'Store context missing. Please relogin.',
          isInventoryLoading: false,
        },
        false,
        'inventory/fetch:no-store'
      )
      return []
    }

    if (!force && get().items.length && Date.now() - (get().lastFetchedAt || 0) < 60_000) {
      return get().items
    }
    set({ isInventoryLoading: true, inventoryError: null }, false, 'inventory/fetch:start')
    try {
      const response = await axiosInstance.get(`/api/inventory/store/${storeId}`)
      const sortedItems = response.data.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      )
      set(
        {
          items: sortedItems,
          isInventoryLoading: false,
          inventoryError: null,
          lastFetchedAt: Date.now(),
        },
        false,
        'inventory/fetch:success'
      )
      return sortedItems
    } catch (error) {
      set(
        {
          isInventoryLoading: false,
          inventoryError: error.response?.data?.message || error.message,
        },
        false,
        'inventory/fetch:error'
      )
      return []
    }
  },
  async updateInventoryItem(itemId, updates) {
    set({ inventoryError: null }, false, 'inventory/update:start')
    try {
      const response = await axiosInstance.put(`/api/inventory/${itemId}`, updates)
      const updatedItem = response.data.item
      set(
        (state) => ({
          items: state.items.map((item) => (item._id === itemId ? updatedItem : item)),
          inventoryError: null,
        }),
        false,
        'inventory/update:success'
      )
      return updatedItem
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message
      set({ inventoryError: errorMsg }, false, 'inventory/update:error')
      throw error
    }
  },
  async updateQuantity(itemId, action, amount, reason) {
    set({ inventoryError: null }, false, 'inventory/updateQuantity:start')
    try {
      const response = await axiosInstance.patch(`/api/inventory/${itemId}/quantity`, {
        action,
        amount,
        reason,
      })
      const updatedItem = response.data.item
      set(
        (state) => ({
          items: state.items.map((item) => (item._id === itemId ? updatedItem : item)),
          inventoryError: null,
        }),
        false,
        'inventory/updateQuantity:success'
      )
      return updatedItem
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message
      set({ inventoryError: errorMsg }, false, 'inventory/updateQuantity:error')
      throw error
    }
  },
  async deleteInventoryItem(itemId, reason) {
    set({ inventoryError: null }, false, 'inventory/delete:start')
    try {
      await axiosInstance.delete(`/api/inventory/${itemId}`, { data: { reason } })
      set(
        (state) => ({
          items: state.items.filter((item) => item._id !== itemId),
          inventoryError: null,
        }),
        false,
        'inventory/delete:success'
      )
      return true
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message
      set({ inventoryError: errorMsg }, false, 'inventory/delete:error')
      throw error
    }
  },
  async fetchChangeLogs(itemId = null) {
    const storeId = get().user?.storeId
    if (!storeId) return []
    set({ isChangeLogsLoading: true, changeLogsError: null }, false, 'inventory/fetchLogs:start')
    try {
      const params = itemId ? { itemId } : {}
      const response = await axiosInstance.get('/api/inventory/logs/changes', { params })
      set(
        {
          changeLogs: response.data.logs,
          isChangeLogsLoading: false,
          changeLogsError: null,
        },
        false,
        'inventory/fetchLogs:success'
      )
      return response.data.logs
    } catch (error) {
      set(
        {
          isChangeLogsLoading: false,
          changeLogsError: error.response?.data?.error || error.message,
        },
        false,
        'inventory/fetchLogs:error'
      )
      return []
    }
  },
})

const createPaymentSlice = (set, get) => ({
  dailySummary: null,
  paymentAnalytics: [],
  isPaymentsLoading: false,
  paymentsError: null,
  async fetchDailySales(date) {
    try {
      set({ isPaymentsLoading: true, paymentsError: null }, false, 'payments/daily:start')
      const response = await axiosInstance.get('/dealer/payment/daily', {
        params: { date },
      })
      set(
        {
          dailySummary: response.data,
          isPaymentsLoading: false,
        },
        false,
        'payments/daily:success'
      )
      return response.data
    } catch (error) {
      set(
        {
          isPaymentsLoading: false,
          paymentsError: error.response?.data?.message || error.message,
        },
        false,
        'payments/daily:error'
      )
      return null
    }
  },
  async fetchPaymentAnalytics(range) {
    try {
      const { startDate, endDate } = range
      const response = await axiosInstance.get('/dealer/payment/analytics', {
        params: { startDate, endDate },
      })
      set(
        {
          paymentAnalytics: response.data.analytics || [],
        },
        false,
        'payments/analytics:success'
      )
      return response.data.analytics || []
    } catch (error) {
      set(
        {
          paymentsError: error.response?.data?.message || error.message,
        },
        false,
        'payments/analytics:error'
      )
      return []
    }
  },
})

const TERMINAL_BILL_STATUSES = ['completed', 'failed', 'manual_review_needed', 'parsing_failed']

const createDealerBillSlice = (set, get) => ({
  uploads: [],
  isUploadingBill: false,
  uploadError: null,
  allBills: [],
  isBillsLoading: false,
  billsError: null,
  billsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  async uploadDealerBill(file) {
    const formData = new FormData()
    formData.append('bill', file)
    set({ isUploadingBill: true, uploadError: null }, false, 'dealer/upload:start')
    try {
      const response = await axiosInstance.post('/dealer/bill/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploadEntry = {
        id: response.data.billId || `${Date.now()}-${Math.random()}`,
        fileName: file.name,
        mode: response.data.mode || (file.type.includes('image') ? 'image' : 'excel'),
        status: response.data.status || 'completed',
        itemsCreated: response.data.itemsCreated || 0,
        createdAt: new Date().toISOString(),
        message: response.data.message,
      }
      set(
        {
          uploads: [uploadEntry, ...get().uploads].slice(0, 5),
          isUploadingBill: false,
        },
        false,
        'dealer/upload:success'
      )
      if (response.data.billId && !TERMINAL_BILL_STATUSES.includes(uploadEntry.status)) {
        get().pollBillStatus(response.data.billId, 0)
      }
      return uploadEntry
    } catch (error) {
      set(
        {
          uploadError: error.response?.data?.message || error.message,
          isUploadingBill: false,
        },
        false,
        'dealer/upload:error'
      )
      throw error
    }
  },
  async pollBillStatus(billId, attempt = 0) {
    try {
      const response = await axiosInstance.get(`/dealer/bill/status/${billId}`)
      const uploads = get().uploads.map((upload) =>
        upload.id === billId
          ? {
              ...upload,
              status: response.data.status,
              itemsCreated: response.data.itemsExtracted ?? upload.itemsCreated,
              dealerName: response.data.dealerName || upload.dealerName,
              processedAt: response.data.processedAt,
            }
          : upload
      )
      set({ uploads }, false, 'dealer/status:update')

      if (!TERMINAL_BILL_STATUSES.includes(response.data.status) && attempt < 6) {
        setTimeout(() => get().pollBillStatus(billId, attempt + 1), 4000)
      }
    } catch (error) {
      console.warn('Failed to poll bill status', error.message)
    }
  },
  async refreshBillStatus(billId) {
    return get().pollBillStatus(billId, 0)
  },
  async fetchAllBills({ page = 1, limit = 20, status, billType } = {}) {
    const storeId = get().user?.storeId
    if (!storeId) {
      set({ billsError: 'Store context missing', isBillsLoading: false }, false, 'bills/fetch:no-store')
      return []
    }
    set({ isBillsLoading: true, billsError: null }, false, 'bills/fetch:start')
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (status) params.append('status', status)
      if (billType) params.append('billType', billType)

      const response = await axiosInstance.get(`/dealer/bill/all?${params.toString()}`)
      set(
        {
          allBills: response.data.bills,
          billsPagination: {
            page: response.data.page,
            limit: response.data.limit,
            total: response.data.total,
            totalPages: response.data.totalPages,
          },
          isBillsLoading: false,
          billsError: null,
        },
        false,
        'bills/fetch:success'
      )
      return response.data.bills
    } catch (error) {
      set(
        {
          isBillsLoading: false,
          billsError: error.response?.data?.error || error.message,
        },
        false,
        'bills/fetch:error'
      )
      return []
    }
  },
})

const useSmartStore = create(
  devtools(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createInventorySlice(set, get),
      ...createPaymentSlice(set, get),
      ...createDealerBillSlice(set, get),
      ...createUiSlice(set, get),
    }),
    { name: 'SmartStore' }
  )
)

export default useSmartStore

