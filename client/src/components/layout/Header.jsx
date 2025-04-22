import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  MenuItem,
  Divider,
  useMediaQuery,
  useScrollTrigger,
  Slide
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { LumeButton } from '../ui';
import { useAuth } from '../../context/AuthContext';
import {
  LogoText,
  NavButton,
  appBarSx,
  toolbarSx,
  logoLinkSx,
  menuIconSx,
  signUpMenuItemSx,
  navBoxSx,
  navLinksBoxSx,
  dashboardLinkSx,
  logoutButtonSx,
  signUpButtonSx
} from '../../styles';

// Navigation links
const navLinks = [
  { name: 'Discover', path: '/discover' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

// Hide AppBar on scroll down
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [transparent, setTransparent] = useState(true);

  // Toggle header transparency based on scroll position
  useEffect(() => {
    const checkScroll = () => {
      const shouldBeTransparent = window.scrollY < 100;
      if (shouldBeTransparent !== transparent) {
        setTransparent(shouldBeTransparent);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [transparent]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseNavMenu();
  };

  // Only hide on scroll for pages that scroll, like home page
  const shouldHideOnScroll = location.pathname === '/' || location.pathname === '/search';

  // Apply transparency based on scroll and page location
  const transparentStyle = transparent && (location.pathname === '/' || location.pathname.startsWith('/events'));
  
  const headerStyle = {
    ...appBarSx,
    ...(transparentStyle ? {} : {
      background: theme.palette.background.paper,
      boxShadow: theme.shadows[3],
    }),
  };

  // Adjust text colors based on header background
  const textColor = transparentStyle ? '#fff' : theme.palette.text.primary;

  return (
    <>
      {shouldHideOnScroll ? (
        <HideOnScroll>
          <AppBar 
            position="fixed" 
            color="transparent" 
            elevation={0} 
            sx={headerStyle}
          >
            <HeaderContent 
              isMobile={isMobile}
              isAuthenticated={isAuthenticated}
              anchorElNav={anchorElNav}
              textColor={textColor}
              handleOpenNavMenu={handleOpenNavMenu}
              handleCloseNavMenu={handleCloseNavMenu}
              handleLogout={handleLogout}
              transparent={transparentStyle}
            />
          </AppBar>
        </HideOnScroll>
      ) : (
        <AppBar 
          position="fixed" 
          color="transparent" 
          elevation={0} 
          sx={headerStyle}
        >
          <HeaderContent 
            isMobile={isMobile}
            isAuthenticated={isAuthenticated}
            anchorElNav={anchorElNav}
            textColor={textColor}
            handleOpenNavMenu={handleOpenNavMenu}
            handleCloseNavMenu={handleCloseNavMenu}
            handleLogout={handleLogout}
            transparent={transparentStyle}
          />
        </AppBar>
      )}
      {/* Empty toolbar to prevent content from hiding behind fixed header */}
      <Toolbar sx={{ minHeight: { xs: '60px', sm: '64px' } }} />
    </>
  );
};

// Extracted HeaderContent for reuse
const HeaderContent = ({ 
  isMobile, 
  isAuthenticated, 
  anchorElNav, 
  textColor,
  handleOpenNavMenu, 
  handleCloseNavMenu, 
  handleLogout,
  transparent
}) => {
  return (
    <Container maxWidth="lg">
      <Toolbar disableGutters sx={toolbarSx}>
        {/* Logo - always visible */}
        <RouterLink to="/" style={{...logoLinkSx, color: textColor}}>
          <LogoText variant="h4" component="div">
            LUME
          </LogoText>
        </RouterLink>

        {/* Mobile menu icon */}
        {isMobile && (
          <IconButton
            size="large"
            aria-label="menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            sx={{...menuIconSx, color: textColor}}
            edge="end"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile menu dropdown */}
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
            '& .MuiPaper-root': {
              borderRadius: 2,
              mt: 1,
              width: 180,
            },
          }}
        >
          {/* Navigation links in mobile menu */}
          {navLinks.map((link) => (
            <MenuItem 
              key={link.name} 
              onClick={handleCloseNavMenu}
              component={RouterLink}
              to={link.path}
              sx={{ py: 1 }}
            >
              <Typography textAlign="center" fontWeight={500}>{link.name}</Typography>
            </MenuItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Auth buttons in mobile menu */}
          {isAuthenticated ? (
            <>
              <MenuItem 
                onClick={handleCloseNavMenu}
                component={RouterLink}
                to="/dashboard"
                sx={{ py: 1 }}
              >
                <Typography textAlign="center" fontWeight={500}>Dashboard</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                <Typography textAlign="center" fontWeight={500}>Logout</Typography>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem 
                onClick={handleCloseNavMenu}
                component={RouterLink}
                to="/login"
                sx={{ py: 1 }}
              >
                <Typography textAlign="center" fontWeight={500}>Login</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleCloseNavMenu}
                component={RouterLink}
                to="/register"
                sx={{...signUpMenuItemSx, py: 1}}
              >
                <Typography textAlign="center" fontWeight={600}>Sign Up</Typography>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Desktop navigation */}
        {!isMobile && (
          <Box sx={navBoxSx}>
            {/* Nav links */}
            <Box sx={navLinksBoxSx}>
              {navLinks.map((link) => (
                <NavButton
                  key={link.name}
                  component={RouterLink}
                  to={link.path}
                  sx={{ color: textColor }}
                >
                  {link.name}
                </NavButton>
              ))}
            </Box>

            {/* Auth buttons */}
            <Box sx={navBoxSx}>
              {isAuthenticated ? (
                <>
                  <NavButton
                    component={RouterLink}
                    to="/dashboard"
                    sx={{...dashboardLinkSx, color: textColor}}
                  >
                    Dashboard
                  </NavButton>
                  <LumeButton
                    variant="outlined"
                    onClick={handleLogout}
                    sx={{
                      ...logoutButtonSx,
                      color: textColor,
                      borderColor: textColor
                    }}
                  >
                    Logout
                  </LumeButton>
                </>
              ) : (
                <>
                  <NavButton
                    component={RouterLink}
                    to="/login"
                    sx={{...dashboardLinkSx, color: textColor}}
                  >
                    Login
                  </NavButton>
                  <LumeButton
                    component={RouterLink}
                    to="/register"
                    sx={signUpButtonSx}
                  >
                    Sign Up
                  </LumeButton>
                </>
              )}
            </Box>
          </Box>
        )}
      </Toolbar>
    </Container>
  );
};

export default Header; 