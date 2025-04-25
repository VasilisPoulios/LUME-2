/**
 * Utility functions for ticket management
 */

const crypto = require('crypto');
const qrcode = require('qrcode');

/**
 * Generates a random ticket code consisting of uppercase letters and numbers
 * Format: XXXX-XXXX-XXXX (where X is a letter or number)
 * @returns {string} The generated ticket code
 */
const generateTicketCode = () => {
  return crypto.randomBytes(5).toString('hex').toUpperCase();
};

/**
 * Generate a QR code for a ticket
 * @param {string} ticketId - The ticket ID
 * @param {string} ticketCode - The ticket code
 * @param {string} eventId - The event ID
 * @returns {Promise<string>} A base64 encoded QR code image
 */
const generateTicketQR = async (ticketId, ticketCode, eventId) => {
  // Use only the ticket code for the QR code - much simpler to scan and validate
  const qrData = ticketCode;
  
  console.log(`Generating QR code for ticket: ${ticketId} with code: ${ticketCode}`);

  // Generate QR code as base64 string
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = {
  generateTicketCode,
  generateTicketQR
}; 