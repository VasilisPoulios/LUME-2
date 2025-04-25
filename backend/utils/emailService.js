const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email plain text content (optional)
 * @param {string} [options.from] - Sender email address (optional, defaults to env config)
 * @returns {Promise<Object>} Nodemailer send result
 */
exports.sendEmail = async (options) => {
  try {
    // Log environment mode
    logger.info(`Current NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Always log the email that would be sent
    logger.info('Email content:');
    logger.info(`To: ${options.to}`);
    logger.info(`Subject: ${options.subject}`);
    logger.info(`Content: ${options.text || options.html.substring(0, 100) + '...'}`);
    
    // Create a transporter - for testing we're using a console transport
    // In production, use a real SMTP service like Gmail, SendGrid, etc.
    if (process.env.NODE_ENV === 'production') {
      // Production transporter
      logger.info('Attempting to send real email (production mode)');
      
      // Log configuration (but hide the password)
      logger.info(`Email configuration: 
        host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}
        port: ${process.env.EMAIL_PORT || 587}
        secure: ${process.env.EMAIL_SECURE === 'true'}
        user: ${process.env.EMAIL_USER || 'aurorasession@gmail.com'}
        password: ${process.env.EMAIL_PASSWORD ? '[PROVIDED]' : '[NOT PROVIDED]'}
      `);
      
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || 'aurorasession@gmail.com',
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      // Verify the transporter configuration
      try {
        const verifyResult = await transporter.verify();
        logger.info(`Transporter verification result: ${verifyResult}`);
      } catch (verifyError) {
        logger.error('Failed to verify transporter:', verifyError);
        // Continue anyway to see the specific sending error
      }

      // Send email with the production transporter
      try {
        const result = await transporter.sendMail({
          from: options.from || `"LUME Events" <${process.env.EMAIL_USER || 'aurorasession@gmail.com'}>`,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html
        });

        logger.info(`Email sent to ${options.to}: ${result.messageId}`);
        return result;
      } catch (sendError) {
        logger.error('Failed to send email with specific error:', sendError);
        throw sendError;
      }
    } else {
      // Development/test - log the email to console instead of sending
      logger.info('Email would be sent in production (development mode)');
      
      // Create a pretend message ID for development
      return { messageId: `dev-${Date.now()}` };
    }
  } catch (error) {
    logger.error('Error in sendEmail function:', error);
    throw error;
  }
};








