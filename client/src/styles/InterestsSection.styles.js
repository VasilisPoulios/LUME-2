import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { COLORS } from './ThemeConstants';

// Container for the interests section
export const InterestsSectionContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  padding: theme.spacing(8, 0),
  position: 'relative',
  marginBottom: theme.spacing(6),
}));

// Heading for the section with orange accent
export const InterestsHeading = styled(Typography)(({ theme }) => ({
  color: COLORS.ORANGE_MAIN,
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  textTransform: 'uppercase',
  letterSpacing: '1px',
}));

// Main title for the section
export const InterestsTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 700,
  marginBottom: theme.spacing(2),
}));

// Subtitle text
export const InterestsSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(6),
  maxWidth: '600px',
}));

// Card container styles
export const InterestCardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '280px',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    '& .overlay': {
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    '& .title': {
      transform: 'translateY(-5px)',
    },
    '& .subtitle': {
      opacity: 1,
      transform: 'translateY(0)',
    }
  },
}));

// Image styles
export const InterestCardImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

// Overlay styles
export const InterestCardOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '20px',
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
  transition: 'all 0.3s ease',
  className: 'overlay',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  height: '100%',
});

// Card title styles
export const InterestCardTitle = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.5rem',
  marginBottom: theme.spacing(1),
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  transition: 'transform 0.3s ease',
  className: 'title',
}));

// Card subtitle styles
export const InterestCardSubtitle = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontSize: '0.9rem',
  opacity: 0.8,
  transition: 'all 0.3s ease',
  opacity: 0,
  transform: 'translateY(10px)',
  className: 'subtitle',
  maxWidth: '90%',
})); 