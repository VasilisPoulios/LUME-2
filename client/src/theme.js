import { createTheme } from '@mui/material/styles';
import { COLORS, SHADOWS, UI_ELEMENTS, TRANSITIONS } from './styles';

// Colors from the reference design with enhanced marketing appeal
const ORANGE_MAIN = '#FF5722';
const ORANGE_DARK = '#E64A19';
const ORANGE_LIGHT = '#FFAB91';

// Supporting colors for depth and hierarchy
const CHARCOAL = '#263238'; // Deep, rich dark color for text
const SLATE = '#607D8B';    // Subdued color for secondary text
const OFF_WHITE = '#F9F9F9'; // Subtle background color

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.ORANGE_MAIN,
      light: COLORS.ORANGE_LIGHT,
      dark: COLORS.ORANGE_DARK,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: COLORS.INFO, // Blue as a complementary color
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#FFFFFF',
    },
    error: {
      main: COLORS.ERROR,
    },
    warning: {
      main: COLORS.WARNING, // Warmer orange for warnings
    },
    info: {
      main: COLORS.INFO,
    },
    success: {
      main: COLORS.SUCCESS,
    },
    background: {
      default: COLORS.OFF_WHITE,
      paper: '#FFFFFF',
    },
    text: {
      primary: COLORS.CHARCOAL,
      secondary: COLORS.SLATE,
      disabled: '#BDBDBD',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      fontSize: '3rem',
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '0.01em',
    },
    h3: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.85rem',
    },
    h4: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      textTransform: 'none', // Avoid all-caps buttons
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    body1: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontSize: '0.9rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    caption: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontSize: '0.8rem',
      fontWeight: 400,
      color: COLORS.SLATE,
    },
    subtitle1: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: UI_ELEMENTS.CARD_RADIUS, // Using our consistent radius
  },
  shadows: [
    'none',
    SHADOWS.LIGHT,
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 6px 12px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 10px 20px rgba(0, 0, 0, 0.12)',
    '0px 12px 24px rgba(0, 0, 0, 0.14)',
    '0px 14px 28px rgba(0, 0, 0, 0.16)',
    '0px 16px 32px rgba(0, 0, 0, 0.18)',
    '0px 18px 36px rgba(0, 0, 0, 0.2)',
    '0px 20px 40px rgba(0, 0, 0, 0.22)',
    '0px 22px 44px rgba(0, 0, 0, 0.24)',
    '0px 24px 48px rgba(0, 0, 0, 0.26)',
    '0px 26px 52px rgba(0, 0, 0, 0.28)',
    '0px 28px 56px rgba(0, 0, 0, 0.3)',
    '0px 30px 60px rgba(0, 0, 0, 0.32)',
    '0px 32px 64px rgba(0, 0, 0, 0.34)',
    '0px 34px 68px rgba(0, 0, 0, 0.36)',
    '0px 36px 72px rgba(0, 0, 0, 0.38)',
    '0px 38px 76px rgba(0, 0, 0, 0.4)',
    '0px 40px 80px rgba(0, 0, 0, 0.42)',
    '0px 42px 84px rgba(0, 0, 0, 0.44)',
    '0px 44px 88px rgba(0, 0, 0, 0.46)',
    '0px 46px 92px rgba(0, 0, 0, 0.48)',
    '0px 48px 96px rgba(0, 0, 0, 0.5)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: UI_ELEMENTS.BUTTON_RADIUS,
          padding: '10px 24px',
          boxShadow: 'none',
          fontSize: '0.95rem',
          transition: TRANSITIONS.BUTTON_HOVER,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: SHADOWS.LIGHT,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: SHADOWS.BUTTON_HOVER,
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${COLORS.ORANGE_MAIN} 0%, ${COLORS.ORANGE_DARK} 100%)`,
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: UI_ELEMENTS.CARD_RADIUS,
          boxShadow: SHADOWS.LIGHT,
          overflow: 'hidden',
          transition: TRANSITIONS.CARD_HOVER,
          '&:hover': {
            boxShadow: SHADOWS.HOVER,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: UI_ELEMENTS.INPUT_RADIUS,
          '&.MuiOutlinedInput-root': {
            '& fieldset': {
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: COLORS.ORANGE_LIGHT,
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderColor: COLORS.ORANGE_MAIN,
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: SHADOWS.LIGHT,
        },
        elevation2: {
          boxShadow: SHADOWS.MEDIUM,
        },
      },
    },
  },
});

export default theme; 