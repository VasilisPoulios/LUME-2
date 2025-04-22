import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4800',
    },
    secondary: {
      main: '#141414',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme; 