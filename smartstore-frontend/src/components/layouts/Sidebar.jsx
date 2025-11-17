import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InventoryIcon from '@mui/icons-material/Inventory'
import PeopleIcon from '@mui/icons-material/People'
import DescriptionIcon from '@mui/icons-material/Description'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Sidebar = ({ onNavigate }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { label: t('sidebar.overview'), path: '/dashboard', icon: DashboardIcon },
    { label: t('sidebar.pos'), path: '/dashboard/pos', icon: PointOfSaleIcon },
    { label: t('sidebar.inventory'), path: '/dashboard/inventory', icon: InventoryIcon },
    { label: t('sidebar.uploadedDocuments'), path: '/dashboard/documents', icon: DescriptionIcon },
    { label: t('sidebar.staffRoles'), path: '/dashboard/staff', icon: PeopleIcon, disabled: true },
  ]

  const handleClick = (path, disabled) => {
    if (disabled) return
    navigate(path)
    if (onNavigate) onNavigate()
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, textTransform: 'uppercase' }}>
        Navigation
      </Typography>
      <List disablePadding>
        {menuItems.map(({ label, path, icon: Icon, disabled }) => {
          const selected =
            path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(path)

          return (
            <ListItemButton
              key={label}
              selected={selected}
              disabled={disabled}
              onClick={() => handleClick(path, disabled)}
              sx={{
                mt: 1,
                borderRadius: 2,
                mx: 1,
                py: 1.2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontWeight: selected ? 600 : 500, fontSize: '0.95rem' }}
                primary={label}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}

export default Sidebar
