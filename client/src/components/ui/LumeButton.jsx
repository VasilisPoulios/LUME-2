import React from 'react';
import { Button, styled } from '@mui/material';
import { COLORS, SHADOWS, TRANSITIONS } from '../../styles';
import PropTypes from 'prop-types';

// Styled button with pill shape
const StyledButton = styled(Button)(({ theme, size }) => ({
  fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
  fontWeight: 600,
  letterSpacing: '0.02em',
  borderRadius: '50px',
  boxShadow: 'none',
  transition: TRANSITIONS.BUTTON_HOVER,
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: SHADOWS.LIGHT,
  },
  
  // Size variations
  ...(size === 'small' && {
    padding: '6px 16px',
    fontSize: '0.875rem',
  }),
  
  ...(size === 'medium' && {
    padding: '10px 24px',
    fontSize: '0.95rem',
  }),
  
  ...(size === 'large' && {
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: 700,
  }),
  
  // Variants
  '&.MuiButton-contained': {
    boxShadow: SHADOWS.LIGHT,
    '&:hover': {
      boxShadow: SHADOWS.BUTTON_HOVER,
    },
  },
  
  '&.MuiButton-containedPrimary': {
    background: `linear-gradient(135deg, ${COLORS.ORANGE_MAIN} 0%, ${COLORS.ORANGE_DARK} 100%)`,
  },
  
  '&.MuiButton-outlined': {
    borderWidth: '2px',
    '&:hover': {
      borderWidth: '2px',
    },
  },
}));

const LumeButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  disabled = false,
  onClick,
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

LumeButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default LumeButton; 