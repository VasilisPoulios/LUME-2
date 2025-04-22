import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const ThemeTest = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Theme Test Page
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Buttons
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button variant="contained">Contained</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Typography
        </Typography>
        <Typography variant="h1" gutterBottom>h1. Heading</Typography>
        <Typography variant="h2" gutterBottom>h2. Heading</Typography>
        <Typography variant="h3" gutterBottom>h3. Heading</Typography>
        <Typography variant="h4" gutterBottom>h4. Heading</Typography>
        <Typography variant="h5" gutterBottom>h5. Heading</Typography>
        <Typography variant="h6" gutterBottom>h6. Heading</Typography>
        <Typography variant="body1" gutterBottom>
          body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
          unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
          unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ThemeTest; 