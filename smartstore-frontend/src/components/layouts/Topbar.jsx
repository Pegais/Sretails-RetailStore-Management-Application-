import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  InputBase,
  alpha,
  IconButton,
  useTheme,
  useMediaQuery,
  ClickAwayListener,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const Topbar = ({ onDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };

  const handleClickAway = () => {
    if (isMobile && searchOpen) {
      setSearchOpen(false);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(to left, #D1F0ED, #F0F8FA)',
        borderBottom: '1px solid #e0e0e0',
        zIndex: 1201,
        height: '64px',
        px: 2,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Left Section: Drawer & Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton onClick={onDrawerToggle} color="inherit" edge="start">
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' } }}
          >
            STORE
          </Typography>
        </Box>

        {/* Center Section: Search Box */}
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              justifyContent: isMobile ? 'flex-end' : 'center',
              maxWidth: isMobile ? 'none' : 600,
              mt: { xs: 1, sm: 0 },
            }}
          >
            {isMobile ? (
              searchOpen ? (
                <>
                  <Box
                    sx={{
                      flexGrow: 1,
                      backgroundColor: alpha('#ffffff', 0.8),
                      borderRadius: '24px',
                      px: 2,
                      py: 0.5,
                      boxShadow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <SearchIcon sx={{ color: 'gray', mr: 1 }} />
                    <InputBase
                      autoFocus
                      placeholder="Search inventory..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      fullWidth
                      sx={{ fontSize: '0.95rem' }}
                    />
                    <IconButton onClick={handleSearchToggle}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <IconButton onClick={handleSearchToggle}>
                  <SearchIcon />
                </IconButton>
              )
            ) : (
              <Box
                sx={{
                  backgroundColor: alpha('#ffffff', 0.8),
                  borderRadius: '24px',
                  px: 2,
                  py: 0.5,
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <SearchIcon sx={{ color: 'gray', mr: 1 }} />
                <InputBase
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  sx={{ fontSize: '0.95rem' }}
                />
              </Box>
            )}
          </Box>
        </ClickAwayListener>

        {/* Right Section: Owner Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Owner Name
          </Typography>
          <Avatar src="/user-avatar.png" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
