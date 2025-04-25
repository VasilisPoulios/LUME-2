import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Link,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import { LogoText } from '../../styles';
import { DashboardLink } from '../ui';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isOrganizer, getDashboardRoute } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  // Get the appropriate dashboard path
  const dashboardPath = getDashboardRoute();

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - using LogoText component */}
          <RouterLink to="/">
            <LogoText
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              LUME
            </LogoText>
          </RouterLink>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Button component={RouterLink} to="/discover" color="inherit" sx={{ mx: 1 }}>
              Discover
            </Button>
            <Button component={RouterLink} to="/categories" color="inherit" sx={{ mx: 1 }}>
              Categories
            </Button>
            {user?.role === 'organizer' && (
              <Button component={RouterLink} to="/create-event" color="inherit" sx={{ mx: 1 }}>
                Create Event
              </Button>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1, justifyContent: 'flex-end' }}>
            <IconButton
              size="large"
              aria-controls="mobile-menu"
              aria-haspopup="true"
              onClick={handleMobileMenuToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="mobile-menu"
              anchorEl={mobileMenuOpen ? document.body : null}
              keepMounted
              open={Boolean(mobileMenuOpen)}
              onClose={() => setMobileMenuOpen(false)}
              PaperProps={{
                style: {
                  width: '100%',
                  maxWidth: '100%',
                  top: '56px',
                  left: 0
                }
              }}
            >
              <MenuItem component={RouterLink} to="/discover" onClick={() => setMobileMenuOpen(false)}>
                Discover
              </MenuItem>
              <MenuItem component={RouterLink} to="/categories" onClick={() => setMobileMenuOpen(false)}>
                Categories
              </MenuItem>
              {user?.role === 'organizer' && (
                <MenuItem component={RouterLink} to="/create-event" onClick={() => setMobileMenuOpen(false)}>
                  Create Event
                </MenuItem>
              )}
              {user ? (
                <>
                  <MenuItem onClick={() => setMobileMenuOpen(false)}>
                    <DashboardLink>
                      Dashboard
                    </DashboardLink>
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/tickets" onClick={() => setMobileMenuOpen(false)}>
                    My Tickets
                  </MenuItem>
                  <MenuItem onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    Logout
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem component={RouterLink} to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>

          {/* User Menu (Desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {user ? (
              <>
                <Button
                  onClick={handleMenu}
                  startIcon={
                    <Avatar
                      sx={{ width: 32, height: 32 }}
                      src={user.avatar || undefined}
                    >
                      {user.name?.charAt(0) || 'U'}
                    </Avatar>
                  }
                  color="inherit"
                >
                  {user.name || 'User'}
                </Button>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <DashboardLink>
                      Dashboard
                    </DashboardLink>
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/tickets" onClick={handleClose}>
                    My Tickets
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit" sx={{ ml: 1 }}>
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
