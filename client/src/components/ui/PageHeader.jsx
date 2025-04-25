import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * PageHeader component that displays a title, optional subtitle, and optional background image
 * Used at the top of main content pages
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  backgroundImage = '/images/default-header.jpg',
  height = '300px',
  alignItems = 'center'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        position: 'relative',
        height: isMobile ? '250px' : height,
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems,
        justifyContent: 'center',
        mb: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
          zIndex: -1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))`,
          zIndex: -1
        }
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            color="white"
            fontWeight="bold"
            textAlign="center"
            sx={{ 
              textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography 
                variant="h5" 
                component="p" 
                color="white"
                textAlign="center"
                sx={{ 
                  mt: 2,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                {subtitle}
              </Typography>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  backgroundImage: PropTypes.string,
  height: PropTypes.string,
  alignItems: PropTypes.string
};

export default PageHeader; 