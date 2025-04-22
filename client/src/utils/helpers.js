// Format image URLs by adding the API base URL when needed
export const formatImageUrl = (imageUrl) => {
  // Cannot use window object during server-side rendering
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Debug log to help diagnose image loading issues
  console.debug('Formatting image URL:', { 
    original: imageUrl,
    mode: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_API_URL
  });
  
  // If no image is provided, use the default event image
  if (!imageUrl || imageUrl === '') {
    return `${baseUrl}/uploads/events/default-event.jpg`;
  }
  
  // If already a complete URL, return as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
    return imageUrl;
  }
  
  // Check for a common issue with event images - some might have the full backend path stored
  // This fixes paths like 'C:\path\to\backend\uploads\events\filename.jpg'
  if (imageUrl.includes('\\uploads\\')) {
    // Extract just the filename
    const parts = imageUrl.split('\\');
    const filename = parts[parts.length - 1];
    const result = `${baseUrl}/uploads/events/${filename}`;
    console.debug('Converted Windows path to URL:', result);
    return result;
  }
  
  // Check for paths that contain event file identifiers but might be missing proper formatting
  if (imageUrl.includes('event-') && !imageUrl.includes('/uploads/')) {
    // This is likely just a filename without the full path
    const result = `${baseUrl}/uploads/events/${imageUrl}`;
    console.debug('Added path prefix to event image filename:', result);
    return result;
  }
  
  // Handle the case for standard upload paths
  // In Vite dev server, static files from backend must be accessed through the API endpoint
  // Based on the vite.config.js proxy configuration
  if (imageUrl.startsWith('/uploads/') || imageUrl.includes('/uploads/')) {
    // Make sure the path starts with a slash
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const result = `${baseUrl}${normalizedPath}`;
    console.debug('Formatted image URL:', result);
    return result;
  }
  
  // For any other path format, assume it's a relative path to uploads/events
  console.debug('Assuming relative path to uploads/events:', imageUrl);
  return `${baseUrl}/uploads/events/${imageUrl}`;
};

/**
 * Format price for display
 * @param {number|string} price - The price to format
 * @param {string} currency - The currency symbol to use (defaults to €)
 * @returns {string} Formatted price with currency symbol
 */
export const formatPrice = (price) => {
  // Handle undefined or null price
  if (price === undefined || price === null) {
    return '0.00';
  }
  
  // Convert string to number if needed
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle NaN
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    return '0.00';
  }
  
  // If price appears to be in cents already (>= 100 and integer)
  if (Number.isInteger(numericPrice) && numericPrice >= 100) {
    return (numericPrice / 100).toFixed(2);
  }
  
  // Otherwise assume it's already in euros/dollars
  return numericPrice.toFixed(2);
};

/**
 * Format price with currency symbol
 * @param {number|string} price - The price to format
 * @param {string} currency - The currency symbol to use (defaults to €)
 * @returns {string} Formatted price with currency symbol
 */
export const formatCurrency = (price, currency = '€') => {
  if (price === 0) {
    return 'Free';
  }
  return `${currency}${formatPrice(price)}`;
};

/**
 * Format price for API requests (converts to cents)
 * @param {number|string} price - The price to format (in euros/dollars)
 * @returns {number} Price in cents for the API
 */
export const formatPriceForApi = (price) => {
  // Handle undefined or null price
  if (price === undefined || price === null) {
    return 0;
  }
  
  // Convert string to number if needed
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle NaN
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value for API:', price);
    return 0;
  }
  
  // If price appears to be in cents already (>= 100 and integer)
  if (Number.isInteger(numericPrice) && numericPrice >= 100) {
    return numericPrice;
  }
  
  // Otherwise assume it's in euros/dollars and convert to cents
  return Math.round(numericPrice * 100);
};

/**
 * Gets the color for a specific event category
 * @param {string} category - The event category
 * @returns {string} HEX color code for the category
 */
export const getCategoryColor = (category) => {
  // Import the category mappings directly to avoid circular dependencies
  const colorMap = {
    // Backend categories
    'Music': '#6a11cb',
    'Visual Arts': '#2575fc',
    'Performing Arts': '#fa8231',
    'Film': '#8854d0',
    'Lectures': '#20bf6b',
    'Fashion': '#eb3b5a',
    'Food': '#f7b731',
    'Sports': '#3867d6',
    'Technology': '#5758BB',
    'Health': '#2d98da',
    'Business': '#4b6584',
    'Lifestyle': '#fc5c65',
    'Community': '#4b6584',
    'Other': '#ff8100',
    
    // Frontend categories (for compatibility)
    'Food & Drink': '#f7b731',
    'Arts': '#2575fc',
    'Education': '#20bf6b',
    'Workshop': '#fc5c65',
    'Conference': '#4b6584',
    'Festival': '#6a11cb',
    'Performance': '#fa8231',
    'Exhibition': '#2575fc',
    'Networking': '#4b6584'
  };
  
  return colorMap[category] || '#ff8100'; // Default to orange if category not found
}; 