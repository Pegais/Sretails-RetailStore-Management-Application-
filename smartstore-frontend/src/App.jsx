import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import LoginPage from './pages/LoginPage'
import GoogleRedirectHandler from './pages/GoogleRedirectHandler'
import DashboardLayout from './components/layouts/DashboardLayout'
import InventoryPage from './pages/InventoryPage'
import DashboardPage from './pages/DashboardPage'
import UploadedDocumentsPage from './pages/UploadedDocumentsPage'
import useSmartStore from './store/useSmartStore'

const FullScreenLoader = ({ message = 'Checking session...' }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
)

const ProtectedRoute = () => {
  const user = useSmartStore((state) => state.user)
  const isAuthLoading = useSmartStore((state) => state.isAuthLoading)

  if (isAuthLoading) {
    return <FullScreenLoader />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default function App() {
  const fetchSession = useSmartStore((state) => state.fetchSession)
  const isAuthLoading = useSmartStore((state) => state.isAuthLoading)
  const user = useSmartStore((state) => state.user)
  const hasFetchedSession = useRef(false)

  useEffect(() => {
    if (!hasFetchedSession.current) {
      fetchSession()
      hasFetchedSession.current = true
    }
  }, [fetchSession])

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/auth/google/redirect" element={<GoogleRedirectHandler />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="documents" element={<UploadedDocumentsPage />} />
        </Route>
      </Route>
      <Route path="*" element={isAuthLoading ? <FullScreenLoader /> : <Navigate to="/" replace />} />
    </Routes>
  )
}
