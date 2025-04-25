import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import Header from './Header';
import Layout from './Layout';
import LandingHeader from './LandingHeader';

const LayoutComponent = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default LayoutComponent;

// Export all layout components
export {
  Header,
  Footer,
  Layout,
  LandingHeader
}; 