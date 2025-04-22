import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Link } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

/**
 * A component that links to the appropriate dashboard based on user role
 * 
 * @param {Object} props - Component props
 * @param {string} [props.component='Link'] - The MUI component to use (Link or Button)
 * @param {Function} [props.onClick] - Optional click handler
 * @param {React.ReactNode} [props.children='Dashboard'] - Link text
 * @param {Object} [props.sx] - MUI styling object
 * @returns {React.ReactElement}
 */
const DashboardLink = ({ 
  component = 'Link', 
  onClick, 
  children = 'Dashboard',
  sx = {},
  ...props 
}) => {
  const { getDashboardRoute, isAuthenticated } = useAuth();
  
  // Get the appropriate path based on user role
  const dashboardPath = isAuthenticated ? getDashboardRoute() : '/login';
  
  // Component can be either a Link or Button
  const Component = component === 'Button' ? Button : Link;
  
  return (
    <Component
      component={RouterLink}
      to={dashboardPath}
      onClick={onClick}
      sx={sx}
      {...props}
    >
      {children}
    </Component>
  );
};

export default DashboardLink; 