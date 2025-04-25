import { useState, useEffect } from 'react';
import { Container, Typography, Box, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LumeButton } from '../components/ui';
import { HeroSection, CTASection, HowItWorksSection, WhoIsLumeForSection, TestimonialsSection } from '../components/sections';
import LandingHeader from '../components/layout/LandingHeader';
import {
  mainContainerSx,
  loadingContainerSx,
  errorContainerSx,
  refreshButtonSx,
} from '../styles';

const HomePage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Add scroll-padding-top to account for sticky header when using anchor links
  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = '80px';
    
    return () => {
      document.documentElement.style.scrollPaddingTop = '0';
    };
  }, []);

  if (loading) {
    return (
      <>
        <LandingHeader />
        <HeroSection />
        <Container maxWidth="lg" sx={loadingContainerSx}>
          <Typography variant="h5" color="text.secondary">Loading amazing events just for you...</Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <LandingHeader />
        <HeroSection />
        <Container maxWidth="lg" sx={errorContainerSx}>
          <Typography variant="h5" color="error">{error}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>We're working on getting things back up. Please try again soon.</Typography>
          <LumeButton 
            variant="contained" 
            sx={refreshButtonSx}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </LumeButton>
        </Container>
      </>
    );
  }

  return (
    <Box>
      {/* Sticky Header specific to the landing page */}
      <LandingHeader />
      
      {/* Hero Section - Full width */}
      <HeroSection />
      
      {/* How It Works Section - Full width */}
      <Box id="how-it-works">
        <HowItWorksSection />
      </Box>
      
      {/* Who's LUME For Section - Full width */}
      <WhoIsLumeForSection />
      
      {/* Testimonials Section - Full width */}
      <TestimonialsSection />
      
      {/* CTA Section - Full width, above Footer */}
      <CTASection />
    </Box>
  );
};

export default HomePage; 