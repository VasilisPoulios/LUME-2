

// Base categories from the backend Event schema
const BASE_CATEGORIES = [
  'Music',
  'Visual Arts',
  'Performing Arts',
  'Film',
  'Lectures',
  'Fashion',
  'Food',
  'Sports',
  'Technology',
  'Health',
  'Business',
  'Lifestyle',
  'Community',
  'Other'
];

// Mapping for compatibility with existing data 
// Maps frontend-specific category names to their backend equivalents
const CATEGORY_MAPPING = {
  // Direct mappings (same name in frontend and backend)
  'Music': 'Music',
  'Technology': 'Technology', 
  'Business': 'Business',
  'Sports': 'Sports',
  'Other': 'Other',
  
  // Frontend to backend mappings
  'Arts': 'Visual Arts',
  'Food & Drink': 'Food',
  'Education': 'Lectures',
  'Community': 'Community',
  'Workshop': 'Lifestyle',
  'Conference': 'Business',
  'Festival': 'Music',
  'Performance': 'Performing Arts',
  'Exhibition': 'Visual Arts',
  'Networking': 'Business'
};

// Categories with emoji and display configuration for UI components
const UI_CATEGORIES = [
  { 
    id: 'All', 
    title: 'All Categories', 
    emoji: '🔍',
    backendCategory: null, // Special case
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop'
  },
  { 
    id: 'Music', 
    title: 'Music', 
    emoji: '🎵',
    backendCategory: 'Music',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1740&auto=format&fit=crop'
  },
  { 
    id: 'Food & Drink', 
    title: 'Food & Drink', 
    emoji: '🍽️',
    backendCategory: 'Food',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop'
  },
  { 
    id: 'Arts', 
    title: 'Arts', 
    emoji: '🎨',
    backendCategory: 'Visual Arts',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2080&auto=format&fit=crop'
  },
  { 
    id: 'Sports', 
    title: 'Sports', 
    emoji: '⚽',
    backendCategory: 'Sports',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1740&auto=format&fit=crop'
  },
  { 
    id: 'Technology', 
    title: 'Technology', 
    emoji: '💻',
    backendCategory: 'Technology',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1740&auto=format&fit=crop'
  },
  { 
    id: 'Community', 
    title: 'Community', 
    emoji: '🤝',
    backendCategory: 'Community',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1740&auto=format&fit=crop'
  },
  { 
    id: 'Lectures', 
    title: 'Education', 
    emoji: '📚',
    backendCategory: 'Lectures',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1374&auto=format&fit=crop'
  },
  { 
    id: 'Film', 
    title: 'Film', 
    emoji: '🎬',
    backendCategory: 'Film',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1740&auto=format&fit=crop'
  },
  { 
    id: 'Performing Arts', 
    title: 'Performance', 
    emoji: '🎭',
    backendCategory: 'Performing Arts',
    image: 'https://images.unsplash.com/photo-1527394015636-afeb66ba5874?q=80&w=1740&auto=format&fit=crop'
  }
];

/**
 * Convert a frontend category to its backend equivalent
 * @param {string} frontendCategory - The category used in the frontend
 * @returns {string} The corresponding backend category
 */
const getFrontendToBackendCategory = (frontendCategory) => {
  if (!frontendCategory) return 'Other';
  return CATEGORY_MAPPING[frontendCategory] || 'Other';
};

/**
 * Get UI display information for a backend category
 * @param {string} backendCategory - The category from the backend
 * @returns {Object} UI display information including title, emoji, etc.
 */
const getUICategoryInfo = (backendCategory) => {
  if (!backendCategory) return UI_CATEGORIES[0]; // All categories
  
  // Find direct match first
  const directMatch = UI_CATEGORIES.find(cat => cat.backendCategory === backendCategory);
  if (directMatch) return directMatch;
  
  // If no direct match, try to find by reversed mapping
  const frontendCategory = Object.keys(CATEGORY_MAPPING).find(
    key => CATEGORY_MAPPING[key] === backendCategory
  );
  
  if (frontendCategory) {
    const mappedCategory = UI_CATEGORIES.find(cat => cat.id === frontendCategory);
    if (mappedCategory) return mappedCategory;
  }
  
  // Default to "Other" category
  return {
    id: 'Other',
    title: 'Other',
    emoji: '📌',
    backendCategory: 'Other',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop'
  };
};

export {
  BASE_CATEGORIES,
  CATEGORY_MAPPING,
  UI_CATEGORIES,
  getFrontendToBackendCategory,
  getUICategoryInfo
}; 