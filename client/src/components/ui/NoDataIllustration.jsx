import React from 'react';
import { Box, SvgIcon } from '@mui/material';

const NoDataIllustration = ({ height = 200 }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <SvgIcon sx={{ fontSize: height, color: 'rgba(0, 0, 0, 0.1)' }} viewBox="0 0 24 24">
        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
        <path d="M12 17l4-4h-3V9h-2v4H8z" />
      </SvgIcon>
    </Box>
  );
};

export default NoDataIllustration; 