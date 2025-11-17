import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useSmartStore from '../../store/useSmartStore';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '../LanguageToggle';
import { useTranslation } from 'react-i18next';

const Topbar = ({ onDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useSmartStore((state) => state.user);
  const logout = useSmartStore((state) => state.logout);

  // Get store name from user object - check multiple possible locations
  // Priority: storeName (normalized) > store.name > 'Store'
  const storeName = user?.storeName || user?.store?.name || t('topbar.store');
  
  // Get owner name
  const ownerName = user?.name || t('topbar.owner');

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
        {/* Left Section: Drawer & Store Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton onClick={onDrawerToggle} color="inherit" edge="start">
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, fontWeight: 600 }}
          >
            {storeName}
          </Typography>
        </Box>

        {/* Center Section: Empty for now - can add features later */}
        <Box sx={{ flex: 1 }} />

        {/* Right Section: Language Toggle, Owner Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1.5 },
          }}
        >
          {/* Language Toggle */}
          <LanguageToggle />
          
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            {ownerName}
          </Typography>
          <Avatar 
            sx={{ 
              width: { xs: 32, sm: 36 }, 
              height: { xs: 32, sm: 36 },
              bgcolor: 'primary.main',
            }}
          >
            {ownerName.charAt(0).toUpperCase()}
          </Avatar>
          <Button
            size="small"
            variant="outlined"
            onClick={async () => {
              await logout();
              navigate('/', { replace: true });
            }}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 60, sm: 80 },
              px: { xs: 1, sm: 2 },
            }}
          >
            {t('common.logout')}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
