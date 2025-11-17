import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import GoogleRedirectHandler from './pages/GoogleRedirectHandler'
import DashboardLayout from './components/layouts/DashboardLayout'
import InventoryPage from './pages/InventoryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth/google/redirect" element={<GoogleRedirectHandler />} />
      <Route path='/dashboard' element={<DashboardLayout/>}/>
      <Route path="/dashboard/inventory" element={<DashboardLayout><InventoryPage /></DashboardLayout>} />
    </Routes>
  )
}
