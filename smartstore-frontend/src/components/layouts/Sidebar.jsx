import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <List>
        <ListItemButton onClick={() => handleClick('/dashboard')}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton selected={location.pathname.includes('/dashboard/inventory')} onClick={() => handleClick('/dashboard/inventory')}>
          <ListItemIcon><InventoryIcon /></ListItemIcon>
          <ListItemText primary="Inventory" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Staff & Roles" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;