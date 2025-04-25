import { styled } from '@mui/material/styles';
import { Box, Typography, Container, alpha } from '@mui/material';
import { COLORS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from './ThemeConstants';

// Hero background container with fixed position and full coverage
export const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url("https://images.unsplash.com/photo-1504609813442-a8924e83f76e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed', // Makes the background fixed during scroll
  color: '#fff',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: alpha('#000', 0.7), // Darker overlay for better contrast
  },
  // Mobile devices don't handle fixed backgrounds well
  [theme.breakpoints.down('sm')]: {
    backgroundAttachment: 'scroll',
    // Adjust height for mobile to ensure content fits without scrolling within the hero
    minHeight: '100vh',
    height: 'auto',
  },
}));

// Main heading for LUME
export const MainHeading = styled(Typography)(({ theme }) => ({
  fontFamily: TYPOGRAPHY.HEADING_FONT,
  fontWeight: 700, // Updated to match LogoText
  fontSize: '6rem', // Larger size for more impact
  letterSpacing: '.2rem', // Updated to match LogoText
  color: '#fff', // White color for contrast against dark background
  textShadow: `0 0 30px ${alpha(COLORS.ORANGE_MAIN, 0.7)}`, // Orange glow for brand emphasis
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '4.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '3.2rem',
    letterSpacing: '0.1rem',
    marginTop: theme.spacing(6), // Account for fixed header
  },
  [theme.breakpoints.down('xs')]: {
    fontSize: '2.8rem',
  },
}));

// Subheading text
export const SubHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 600, // Increased weight for better hierarchy
  fontSize: '2.2rem', // Slightly larger
  marginBottom: theme.spacing(5),
  textShadow: '0 1px 3px rgba(0,0,0,0.3)', // Shadow for better readability
  [theme.breakpoints.down('md')]: {
    fontSize: '1.9rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(0, 2),
  },
}));

// Caption text for description
export const CaptionText = styled(Typography)(({ theme }) => ({
  maxWidth: '800px',
  textAlign: 'center',
  marginBottom: theme.spacing(5), // Increased spacing
  fontSize: '1.25rem', // Slightly larger for better readability
  lineHeight: 1.6, // Increased line height for better readability
  opacity: 0.95, // Slight transparency for visual hierarchy
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    padding: theme.spacing(0, 2),
    marginBottom: theme.spacing(3),
  },
}));

// Custom SearchBar wrapper to match reference image
export const SearchWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: '700px',
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(8), // Increased margin for better spacing
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '90%',
    marginBottom: theme.spacing(4),
  },
}));

// Stats wrapper
export const StatsWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '700px',
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
    overflowX: 'auto',
    justifyContent: 'flex-start',
    paddingBottom: theme.spacing(1), // Prevent cut-off shadows
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
    msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
    scrollbarWidth: 'none', // Hide scrollbar in Firefox
    '&::-webkit-scrollbar': { // Hide scrollbar in Chrome/Safari
      display: 'none'
    },
  },
}));

export const heroContainerSx = {
  position: 'relative', 
  zIndex: 1, 
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  px: { xs: 2, sm: 3, md: 4 },
  py: { xs: 4, sm: 6 },
};

export const searchBarSx = { 
  flexGrow: 1,
  boxShadow: 'none',
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  '.MuiInputBase-root': {
    height: { xs: '50px', sm: '55px' }, // Slightly smaller on mobile
    fontSize: { xs: '0.95rem', sm: '1.05rem' }, // Smaller text on mobile
    color: '#fff',
  },
  '.MuiInputBase-input::placeholder': {
    color: 'rgba(255, 255, 255, 0.8)',
    opacity: 1,
  },
  '.MuiIconButton-root': {
    color: '#fff', // White search icon
  }
};

export const discoverButtonSx = { 
  whiteSpace: 'nowrap',
  px: { xs: 3, sm: 4 }, // Narrower padding on mobile
  height: { xs: '50px', sm: '55px' }, // Match input height
  ml: { xs: 0, sm: 1 },
  mt: { xs: 1, sm: 0 },
  width: { xs: '100%', sm: 'auto' }, // Full width button on mobile
  backgroundColor: COLORS.ORANGE_MAIN, // Orange as CTA
  fontSize: { xs: '0.95rem', sm: '1.05rem' }, // Smaller text on mobile
  fontWeight: 600, // Bolder text
  '&:hover': {
    backgroundColor: COLORS.ORANGE_DARK, // Darker orange on hover
    transform: 'translateY(-2px)', // Slight lift effect
    boxShadow: SHADOWS.BUTTON_HOVER, // Stronger shadow
  },
  transition: TRANSITIONS.BUTTON_HOVER
};

export const statsBarSx = {
  backgroundColor: 'transparent',
  padding: '12px 24px',
  '& .MuiTypography-subtitle1': {
    fontWeight: 600, // Bolder text
    fontSize: { xs: '0.9rem', sm: '1rem' },
    color: '#fff', // White text
    whiteSpace: 'nowrap', // Prevent text wrapping on mobile
  },
  '& .MuiBox-root': {
    justifyContent: 'space-between',
    width: '100%',
  },
  '& .MuiSvgIcon-root': {
    color: '#fff', // White icons
    fontSize: { xs: '1.25rem', sm: '1.5rem' }, // Smaller icons on mobile
  },
  '& .MuiGrid-container': {
    justifyContent: { xs: 'flex-start', sm: 'center' },
    gap: { xs: 3, sm: 2 },
    flexWrap: 'nowrap', // Prevent wrapping on mobile
  },
  '& .MuiGrid-item': {
    display: 'flex',
    justifyContent: 'center',
  }
}; 