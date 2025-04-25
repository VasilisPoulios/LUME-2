const Contact = require('../models/Contact');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/emailService');

/**
 * Submit a contact form message
 * @route POST /api/contact
 * @access Public
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    
    // Create a new contact message record in the database
    const contactMessage = await Contact.create({
      name,
      email,
      subject,
      message,
      status: 'new'
    });
    
    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'aurorasession@gmail.com',
        subject: `New Contact Form Message: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      });
      
      logger.info(`Contact form notification email sent to admin`);
    } catch (emailError) {
      // Log the error but don't fail the request
      logger.error('Failed to send contact form notification email:', emailError);
    }
    
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: contactMessage._id
      }
    });
  } catch (error) {
    logger.error('Error in submitContactForm:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all contact messages (admin only)
 * @route GET /api/contact
 * @access Private/Admin
 */
exports.getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const contactMessages = await Contact.paginate(query, options);
    
    return res.status(200).json({
      success: true,
      data: contactMessages
    });
  } catch (error) {
    logger.error('Error in getContactMessages:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching contact messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update contact message status (admin only)
 * @route PATCH /api/contact/:id
 * @access Private/Admin
 */
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['new', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      data: updatedContact
    });
  } catch (error) {
    logger.error('Error in updateContactStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating contact status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 