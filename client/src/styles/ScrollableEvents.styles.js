import { SHADOWS } from './ThemeConstants';

// Scrollable container for horizontal event lists
export const scrollableContainerSx = {
  display: 'flex',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none', // For Firefox
  msOverflowStyle: 'none', // For Internet Explorer and Edge
  '&::-webkit-scrollbar': {
    display: 'none' // For Chrome, Safari, and Opera
  },
  pb: 2,
  position: 'relative',
  scrollBehavior: 'smooth',
  gap: 3,
};

// Base styles for scroll navigation buttons
export const scrollButtonSx = {
  position: 'absolute',
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  boxShadow: 2,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
};

// Left scroll button positioning
export const leftScrollButtonSx = {
  ...scrollButtonSx,
  left: -20,
  top: '50%',
  transform: 'translateY(-50%)',
};

// Right scroll button positioning
export const rightScrollButtonSx = {
  ...scrollButtonSx,
  right: -20,
  top: '50%',
  transform: 'translateY(-50%)',
};

// Individual card item in scrollable container
export const eventCardItemSx = {
  minWidth: 'calc(33.333% - 16px)',
  flex: '0 0 auto',
};

// Container for the scrollable section with relative positioning for scroll buttons
export const scrollContainerWrapperSx = {
  position: 'relative'
}; 