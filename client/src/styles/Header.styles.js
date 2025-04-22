import { styled } from '@mui/material/styles';
import { Typography, Button } from '@mui/material';
import { COLORS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from './ThemeConstants';

// Logo text with custom styling
export const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: TYPOGRAPHY.HEADING_FONT,
  fontWeight: 800,
  letterSpacing: 1.5,
  color: COLORS.ORANGE_MAIN,
  textShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  textDecoration: 'none',
  fontSize: '2rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}));

// Navigation button styling
export const NavButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  fontWeight: 500,
  fontSize: '1rem',
  padding: '6px 16px',
  '&:hover': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

export const appBarSx = { 
  backgroundColor: 'transparent', 
  boxShadow: 'none',
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)',
  zIndex: (theme) => theme.zIndex.drawer + 1,
  px: { xs: 0, sm: 2 }, // Less horizontal padding on mobile
};

export const toolbarSx = { 
  justifyContent: 'space-between',
  py: { xs: 0.75, sm: 1 }, // Less vertical padding on mobile
  minHeight: { xs: '60px', sm: '64px' }, // Slightly smaller height on mobile
};

export const logoLinkSx = { 
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  pl: { xs: 2, sm: 0 }, // Add padding on mobile when container padding is 0
};

export const menuIconSx = { 
  color: '#fff',
  mr: { xs: 1, sm: 0 }, // Add right margin on mobile
};

export const signUpMenuItemSx = { 
  color: COLORS.ORANGE_MAIN, 
  fontWeight: 'bold',
};

export const navBoxSx = { 
  display: 'flex', 
  alignItems: 'center',
};

export const navLinksBoxSx = { 
  mr: 3,
};

export const dashboardLinkSx = { 
  mr: 2,
};

export const logoutButtonSx = {
  color: '#fff',
  borderColor: '#fff',
  '&:hover': {
    borderColor: COLORS.ORANGE_MAIN,
    backgroundColor: 'rgba(255, 87, 34, 0.1)'
  },
};

export const signUpButtonSx = { 
  backgroundColor: COLORS.ORANGE_MAIN,
  color: '#fff',
  fontWeight: 600,
  px: 3,
  py: 1,
  '&:hover': {
    backgroundColor: COLORS.ORANGE_DARK,
    transform: 'translateY(-2px)',
    boxShadow: SHADOWS.BUTTON_HOVER,
  },
  transition: TRANSITIONS.BUTTON_HOVER
}; 