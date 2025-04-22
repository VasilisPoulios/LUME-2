import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';
import { COLORS, SHADOWS } from './ThemeConstants';

// Container for the entire carousel
export const CarouselContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(8),
  borderRadius: theme.shape.borderRadius,
  boxShadow: SHADOWS.MEDIUM,
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(5),
    borderRadius: 0, // Full width on mobile
  },
}));

// Slide container
export const SlideContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  height: '400px',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    height: '350px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '300px',
    borderRadius: 0, // Full width on mobile
  },
}));

// Slide that fades in/out
export const Slide = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  opacity: 0,
  transition: 'opacity 1s ease-in-out',
  '&[data-active="true"]': {
    opacity: 1,
  },
  '&[data-fade-in="true"]': {
    animation: 'fadeIn 1s forwards',
  },
  '&[data-fade-out="true"]': {
    animation: 'fadeOut 1s forwards',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1,
    },
    '100%': {
      opacity: 0,
    },
  },
}));

// Image for the slide
export const SlideImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// Content overlay
export const SlideContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
  padding: theme.spacing(6, 4, 4),
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  height: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 2, 3),
  },
}));

// Carousel dots navigation
export const DotsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  zIndex: 2,
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(1),
    gap: theme.spacing(0.7),
  },
}));

// Individual dot
export const Dot = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&[data-active="true"]': {
    backgroundColor: COLORS.ORANGE_MAIN,
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  '&[data-active="true"]:hover': {
    backgroundColor: COLORS.ORANGE_MAIN,
  },
  [theme.breakpoints.down('sm')]: {
    width: 10,
    height: 10,
  },
}));

// Navigation arrows
export const NavArrow = styled(Box)(({ theme, direction }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  ...(direction === 'left' ? { left: theme.spacing(2) } : { right: theme.spacing(2) }),
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  [theme.breakpoints.down('sm')]: {
    width: 35,
    height: 35,
    ...(direction === 'left' ? { left: theme.spacing(1) } : { right: theme.spacing(1) }),
  },
}));

// Feature badge
export const FeatureBadge = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: COLORS.ORANGE_MAIN,
  color: '#fff',
  padding: theme.spacing(0.5, 2),
  borderRadius: 20,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  zIndex: 2,
  boxShadow: SHADOWS.MEDIUM,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    padding: theme.spacing(0.3, 1.5),
    top: theme.spacing(1.5),
    left: theme.spacing(1.5),
  },
}));

// Event title
export const EventTitle = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
    marginBottom: theme.spacing(0.5),
  },
}));

// Event metadata
export const EventMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(1.5),
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(0.5),
  },
}));

// Event description
export const EventDescription = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  maxWidth: '60%',
  marginBottom: theme.spacing(3),
  opacity: 0.9,
  [theme.breakpoints.down('md')]: {
    maxWidth: '80%',
    marginBottom: theme.spacing(2),
    fontSize: '0.95rem',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    marginBottom: theme.spacing(1.5),
    fontSize: '0.9rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

// Call-to-action button container
export const CTAContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
    width: '100%',
    '& .MuiButton-root': {
      fontSize: '0.85rem',
      padding: '6px 12px',
    },
  },
})); 