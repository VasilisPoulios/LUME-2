import React from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Paper, Box } from '@mui/material';

/**
 * Placeholder component for pages that haven't been created yet
 */
const PlaceholderPage = ({ title }) => (
  <Container maxWidth="md" sx={{ pt: 10, pb: 5 }}>
    <Paper elevation={3} sx={{ padding: '40px 20px', textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ my: 4 }}>
        <Typography variant="body1">
          This page is coming soon! We're working hard to make it available.
        </Typography>
      </Box>
    </Paper>
  </Container>
);

PlaceholderPage.propTypes = {
  title: PropTypes.string.isRequired
};

export default PlaceholderPage; 