// Colors for consistent use across style files
export const COLORS = {
  // Primary brand colors
  ORANGE_MAIN: '#FF5722',
  ORANGE_DARK: '#E64A19',
  ORANGE_LIGHT: '#FFAB91',
  
  // Supporting colors
  CHARCOAL: '#263238',  // Deep, rich dark color for text
  SLATE: '#607D8B',     // Subdued color for secondary text
  OFF_WHITE: '#F9F9F9', // Subtle background color
  
  // UI feedback colors
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
};

// Shared transitions
export const TRANSITIONS = {
  BUTTON_HOVER: 'all 0.3s ease',
  CARD_HOVER: 'transform 0.3s ease, box-shadow 0.3s ease',
  LAYOUT_TRANSITION: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Typography
export const TYPOGRAPHY = {
  HEADING_FONT: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
  BODY_FONT: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
};

// Breakpoint values for easier reference (matching MUI defaults)
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536,
};

// Screen-specific styles
export const SCREENS = {
  MOBILE: `@media (max-width: ${BREAKPOINTS.SM - 1}px)`,
  TABLET: `@media (min-width: ${BREAKPOINTS.SM}px) and (max-width: ${BREAKPOINTS.MD - 1}px)`,
  DESKTOP: `@media (min-width: ${BREAKPOINTS.MD}px)`,
};

// Z-index stack management
export const Z_INDEX = {
  HEADER: 1100,
  MODAL: 1300,
  POPOVER: 1200,
  TOOLTIP: 1400,
};

// Common UI element styles 
export const UI_ELEMENTS = {
  BUTTON_RADIUS: '50px',
  CARD_RADIUS: '16px',
  INPUT_RADIUS: '50px',
  CONTAINER_PADDING: {
    xs: '16px',
    sm: '24px',
    md: '32px',
  },
  SPACING_UNIT: 8, // Base spacing unit in pixels
};

// Shadows
export const SHADOWS = {
  LIGHT: '0 2px 8px rgba(0, 0, 0, 0.05)',
  MEDIUM: '0 4px 12px rgba(0, 0, 0, 0.06)',
  HOVER: '0 8px 24px rgba(0, 0, 0, 0.09)',
  BUTTON_HOVER: '0 6px 15px rgba(255, 87, 34, 0.4)',
  MOBILE_HEADER: '0 2px 10px rgba(0, 0, 0, 0.1)',
}; 