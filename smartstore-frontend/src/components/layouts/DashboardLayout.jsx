import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const drawerWidth = 260

const DashboardLayout = () => {
  const theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev)
  }

  const drawerContent = (
    <Box sx={{ px: 2, py: 3 }}>
      <Sidebar onNavigate={isMdDown ? handleDrawerToggle : undefined} />
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Topbar onDrawerToggle={handleDrawerToggle} />

      <Box sx={{ display: 'flex' }}>
        <Box
          component="nav"
          sx={{
            width: { md: drawerWidth },
            flexShrink: { md: 0 },
          }}
        >
          {isMdDown ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  background: 'linear-gradient(180deg, #D1F0ED, #F0F8FA)',
                },
              }}
            >
              {drawerContent}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              open
              sx={{
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(180deg, #D1F0ED, #F0F8FA)',
                  mt: '64px',
                  height: 'calc(100vh - 64px)',
                },
              }}
            >
              {drawerContent}
            </Drawer>
          )}
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            mt: '64px',
            px: { xs: 2, md: 4 },
            pb: 4,
          }}
        >
          <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout
