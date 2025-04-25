import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  MenuItem,
  Button,
  useMediaQuery,
  useScrollTrigger,
  Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { LumeButton, DashboardLink } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { LogoText } from '../../styles';

// Create the sticky header with shadow on scroll
function ElevationScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    sx: {
      backgroundColor: trigger ? 'background.paper' : 'transparent',
      transition: '0.3s',
      backdropFilter: trigger ? 'blur(8px)' : 'none',
    }
  });
}

const LandingHeader = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <ElevationScroll>
      <AppBar 
        position="fixed" 
        color="transparent" 
        elevation={0}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <LogoText
              variant="h4"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex' },
                textDecoration: 'none',
              }}
            >
              LUME
            </LogoText>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              <Button
                component={RouterLink}
                to="/discover"
                sx={{ color: 'text.primary', fontWeight: 500 }}
              >
                Discover Events
              </Button>
              
              <Button
                component={RouterLink}
                to="/about"
                sx={{ color: 'text.primary', fontWeight: 500 }}
              >
                About
              </Button>
              
              <Link
                href="#how-it-works"
                sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'none' }}
              >
                How It Works
              </Link>
              
              <Button
                component={RouterLink}
                to="/register?role=organizer"
                sx={{ color: 'text.primary', fontWeight: 500 }}
              >
                Become an Organizer
              </Button>
              
              {isAuthenticated ? (
                <DashboardLink
                  component="Button"
                  variant="outlined"
                  sx={{ ml: 1 }}
                >
                  Dashboard
                </DashboardLink>
              ) : (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                  >
                    Log In
                  </Button>
                  <LumeButton
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                  >
                    Sign Up
                  </LumeButton>
                </Box>
              )}
            </Box>

            {/* Mobile Navigation */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/discover">
                  <Typography textAlign="center">Discover Events</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/about">
                  <Typography textAlign="center">About</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu} component="a" href="#how-it-works">
                  <Typography textAlign="center">How It Works</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/register?role=organizer">
                  <Typography textAlign="center">Become an Organizer</Typography>
                </MenuItem>
                
                {isAuthenticated ? (
                  <MenuItem onClick={handleCloseNavMenu}>
                    <DashboardLink>
                      <Typography textAlign="center">Dashboard</Typography>
                    </DashboardLink>
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/login">
                      <Typography textAlign="center">Log In</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleCloseNavMenu} component={RouterLink} to="/register">
                      <Typography textAlign="center">Sign Up</Typography>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

export default LandingHeader;
