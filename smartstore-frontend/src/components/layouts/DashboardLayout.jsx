import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, Drawer, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen((prev)=>!prev);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topbar */}
      <Box sx={{ position: 'fixed', width: '100%', zIndex: 1300 }}>
        <Topbar onDrawerToggle={handleDrawerToggle} />
      </Box>

      {/* Sidebar */}
      {!isMobile ? (
        <Box
          sx={{
            width: 200,
            position: 'fixed',
            top: 64,
            left: 0,
            bgcolor: '#f4f4f4',
            borderRight: '1px solid #ddd',
            height: 'calc(100vh - 64px)',
            zIndex: 1200,
          }}
        >
          <Sidebar />
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 240,
              background: 'linear-gradient(to left, #D1F0ED, #F0F8FA)',
              pt:'64px'
            },
          }}
        >
          <Sidebar onDrawerToggle={handleDrawerToggle} />
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '64px',
          marginLeft: isMobile ? 0 : '200px',
          padding: 2,
          flexGrow: 1,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;