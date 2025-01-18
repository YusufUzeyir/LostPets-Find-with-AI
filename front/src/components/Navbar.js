import { AppBar, Toolbar, Button, Typography, Container, IconButton, Box, Menu, MenuItem, Badge, Avatar, ListItemIcon, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const ProfileMenu = ({ anchorEl, handleClose, handleLogout, navigate }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    onClick={handleClose}
  >
    <MenuItem onClick={() => navigate('/profile')}>
      <ListItemIcon>
        <PersonIcon fontSize="small" />
      </ListItemIcon>
      Profilim
    </MenuItem>
    <MenuItem onClick={() => navigate('/my-posts')}>
      <ListItemIcon>
        <PetsIcon fontSize="small" />
      </ListItemIcon>
      İlanlarım
    </MenuItem>
    <MenuItem onClick={handleLogout}>
      <ListItemIcon>
        <LogoutIcon fontSize="small" />
      </ListItemIcon>
      Çıkış Yap
    </MenuItem>
  </Menu>
);

const Navbar = ({ toggleColorMode, mode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/messages/unread/${user.user.email}`);
          const data = await response.json();
          setUnreadCount(data.unread_count);
        } catch (error) {
          console.error('Okunmamış mesaj sayısı alınamadı:', error);
        }
      }
    };

    fetchUnreadCount();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleMessagesClick = () => {
    navigate('/messages', { state: { showAll: true } });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <List>
        <ListItem>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menü
          </Typography>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        
        <ListItem button onClick={() => handleNavigation('/lost-pets')}>
          <ListItemText primary="Kayıp Hayvanlar" />
        </ListItem>
        
        <ListItem button onClick={() => handleNavigation('/found-pets')}>
          <ListItemText primary="Bulunan Hayvanlar" />
        </ListItem>
        
        <Divider sx={{ my: 1 }} />
        
        <ListItem button onClick={() => handleNavigation('/report-lost')}>
          <ListItemText 
            primary="Kayıp İlanı Ver" 
            primaryTypographyProps={{ color: 'secondary' }}
          />
        </ListItem>
        
        <ListItem button onClick={() => handleNavigation('/report-found')}>
          <ListItemText 
            primary="Buldum İlanı Ver"
            primaryTypographyProps={{ color: 'secondary' }}
          />
        </ListItem>

        {!user && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={() => handleNavigation('/login')}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Giriş Yap" />
            </ListItem>
            
            <ListItem button onClick={() => handleNavigation('/register')}>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Kayıt Ol" />
            </ListItem>
          </>
        )}

        {user && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profilim" />
            </ListItem>
            
            <ListItem button onClick={() => handleNavigation('/my-posts')}>
              <ListItemIcon>
                <PetsIcon />
              </ListItemIcon>
              <ListItemText primary="İlanlarım" />
            </ListItem>
            
            <ListItem button onClick={() => handleNavigation('/messages')}>
              <ListItemIcon>
                <Badge badgeContent={unreadCount} color="error">
                  <EmailIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Mesajlar" />
            </ListItem>
            
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Çıkış Yap" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" className="shadow-sm">
      <Container>
        <Toolbar sx={{ px: { xs: 0 }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PetsIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              Kayıp Dostlar
            </Typography>
          </Box>

          {/* Masaüstü Menü */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/lost-pets"
                sx={{ mx: 1 }}
              >
                Kayıp Hayvanlar
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/found-pets"
                sx={{ mx: 1 }}
              >
                Bulunan Hayvanlar
              </Button>

              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/report-lost"
                sx={{ mx: 1 }}
              >
                Kayıp İlanı Ver
              </Button>
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/report-found"
                sx={{ mx: 1 }}
              >
                Buldum İlanı Ver
              </Button>

              <IconButton
                sx={{ ml: 2 }}
                onClick={toggleColorMode}
                color="inherit"
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>

              {user ? (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleMessagesClick}
                    sx={{ ml: 2 }}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <EmailIcon />
                    </Badge>
                  </IconButton>

                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <IconButton
                      color="inherit"
                      onClick={handleMenu}
                    >
                      {user.user.profile_image ? (
                        <Avatar 
                          src={user.user.profile_image} 
                          sx={{ width: 32, height: 32 }}
                        />
                      ) : (
                        <AccountCircleIcon />
                      )}
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {user.user.adsoyad}
                    </Typography>
                  </Box>
                  <ProfileMenu
                    anchorEl={anchorEl}
                    handleClose={handleClose}
                    handleLogout={handleLogout}
                    navigate={navigate}
                  />
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    startIcon={<LoginIcon />}
                    sx={{ ml: 2 }}
                  >
                    Giriş Yap
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/register"
                    startIcon={<PersonAddIcon />}
                    sx={{ ml: 1 }}
                  >
                    Kayıt Ol
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobil Menü Butonu */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                onClick={toggleColorMode}
                color="inherit"
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          )}
        </Toolbar>

        {/* Mobil Drawer */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Daha iyi mobil performansı için
          }}
        >
          {drawer}
        </Drawer>
      </Container>
    </AppBar>
  );
};

export default Navbar; 