import API from './index';

/**
 * Send a contact form message to the server
 * @param {Object} formData - The contact form data
 * @param {string} formData.name - The sender's name
 * @param {string} formData.email - The sender's email address
 * @param {string} formData.subject - The message subject
 * @param {string} formData.message - The message content
 * @returns {Promise<Object>} - The response from the server
 */
export const sendContactMessage = async (formData) => {
  try {
    const response = await API.post('/contact', formData);
    return response.data;
  } catch (error) {
    console.error('Error sending contact message:', error);
    throw error;
  }
}; 