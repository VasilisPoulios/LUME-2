/**
 * Utility functions for ticket management
 */

/**
 * Generates a random ticket code consisting of uppercase letters and numbers
 * Format: XXXX-XXXX-XXXX (where X is a letter or number)
 * @returns {string} The generated ticket code
 */
const generateTicketCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar-looking characters like I, O, 1, 0
  let code = '';
  
  // Generate 3 groups of 4 characters
  for (let group = 0; group < 3; group++) {
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    
    // Add hyphen between groups, but not after the last group
    if (group < 2) {
      code += '-';
    }
  }
  
  return code;
};

module.exports = {
  generateTicketCode
}; 