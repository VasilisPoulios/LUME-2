import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import { SectionHeader } from '../components/ui';
import { COLORS, SHADOWS, TRANSITIONS } from './ThemeConstants';

// Styled section container for consistent spacing and style
export const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(10),
  position: 'relative',
}));

// Enhanced section header with marketing appeal
export const EnhancedSectionHeader = styled(SectionHeader)(({ theme }) => ({
  '& .MuiTypography-h4': {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    position: 'relative',
    display: 'inline-block',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '60px',
      height: '3px',
      backgroundColor: COLORS.ORANGE_MAIN,
      bottom: '-8px',
      left: 0,
    },
  },
  '& .MuiTypography-subtitle1': {
    fontSize: '1.1rem',
    maxWidth: '700px',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    color: COLORS.SLATE,
  },
}));

// View all button for sections
export const ViewAllButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: 10,
  color: COLORS.ORANGE_MAIN,
  fontWeight: 600,
  '&:hover': {
    backgroundColor: 'transparent',
    color: COLORS.ORANGE_DARK,
  },
}));

export const mainContainerSx = {
  pt: 12, 
  pb: 8
};

export const loadingContainerSx = { 
  py: 8, 
  textAlign: 'center' 
};

export const errorContainerSx = { 
  py: 8, 
  textAlign: 'center' 
};

export const refreshButtonSx = { 
  mt: 4 
};

export const eventCardSx = {
  transform: 'scale(1)',
  transition: TRANSITIONS.CARD_HOVER,
  '&:hover': {
    transform: 'scale(1.03)',
  }
};

export const categoryCardSx = {
  transform: 'scale(1)',
  transition: TRANSITIONS.BUTTON_HOVER,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: SHADOWS.HOVER,
  }
};

export const emptyEventsSx = { 
  textAlign: 'center', 
  py: 4 
};

export const actionButtonWrapperSx = { 
  display: 'flex', 
  justifyContent: 'center', 
  mt: 5 
};

export const outlinedButtonSx = { 
  minWidth: 200 
};

export const containedButtonSx = { 
  minWidth: 200,
}; 