import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Button,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { 
  ExpandMore, 
  CalendarToday, 
  AccessTime, 
  Place, 
  Download,
  CheckCircle,
  PendingActions
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import dayjs from 'dayjs';
import { COLORS } from '../../styles';

// Empty state component
const EmptyState = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: 4,
      color: COLORS.SLATE_LIGHT
    }}
  >
    <Typography variant="body1" gutterBottom>
      You don't have any tickets yet.
    </Typography>
    <Typography variant="body2">
      Browse events and RSVP or purchase tickets to see them here.
    </Typography>
    <Button
      variant="contained"
      href="/"
      sx={{
        mt: 2,
        backgroundColor: COLORS.ORANGE_MAIN,
        '&:hover': { backgroundColor: COLORS.ORANGE_DARK }
      }}
    >
      Browse Events
    </Button>
  </Box>
);

const TicketsList = ({ tickets }) => {
  const [expanded, setExpanded] = useState(false);

  if (!tickets || tickets.length === 0) {
    return <EmptyState />;
  }

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Download QR code as PNG
  const downloadQR = (ticketId, eventTitle, qrCodeData) => {
    console.log('Downloading QR code for ticket:', ticketId);
    
    // If we have qrCodeData from the server, use it directly
    if (qrCodeData) {
      console.log('Using server-generated QR code data');
      const downloadLink = document.createElement('a');
      downloadLink.href = qrCodeData;
      downloadLink.download = `ticket-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return;
    }
    
    // Otherwise, try to get canvas element for client-generated QR
    console.log('Looking for canvas element:', `qr-code-${ticketId}`);
    const canvas = document.getElementById(`qr-code-${ticketId}`);
    if (canvas) {
      console.log('Found canvas element, converting to data URL');
      try {
        const pngUrl = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `ticket-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        console.log('Download initiated');
      } catch (error) {
        console.error('Error generating download from canvas:', error);
        alert('Failed to download QR code. Please try again.');
      }
    } else {
      console.error('QR code element not found');
      alert('Could not find QR code to download. Please try again.');
    }
  };

  // Handle QR code rendering
  const renderQRCode = (ticket) => {
    // If the server has already generated a QR code, use it
    if (ticket.qrCodeData) {
      console.log(`Using server QR for ticket ${ticket._id}`);
      return (
        <Box 
          component="img" 
          src={ticket.qrCodeData}
          alt={`QR Code for ticket ${ticket.ticketCode}`}
          id={`qr-code-img-${ticket._id}`}
          sx={{ 
            width: 180, 
            height: 180,
            border: `1px solid ${COLORS.GRAY_LIGHT}`,
            borderRadius: 2,
            padding: 1
          }}
        />
      );
    }
    
    // Otherwise, generate one client-side
    console.log(`Generating client QR for ticket ${ticket._id}`);
    return (
      <QRCode
        id={`qr-code-${ticket._id}`}
        value={ticket.ticketCode}
        size={180}
        level="H"
        includeMargin={true}
        renderAs="canvas"
      />
    );
  };

  return (
    <Box>
      {tickets.map((ticket) => (
        <Accordion 
          key={ticket._id}
          expanded={expanded === ticket._id}
          onChange={handleChange(ticket._id)}
          sx={{ 
            mb: 2,
            borderRadius: '8px !important',
            border: `1px solid ${COLORS.GRAY_LIGHT}`,
            '&:before': {
              display: 'none',
            },
            boxShadow: 'none',
            overflow: 'hidden'
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls={`ticket-${ticket._id}-content`}
            id={`ticket-${ticket._id}-header`}
            sx={{ 
              backgroundColor: 'rgba(249, 249, 249, 0.6)',
              '&:hover': {
                backgroundColor: 'rgba(249, 249, 249, 0.9)',
              }
            }}
          >
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {ticket.event?.title || 'Untitled Event'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 0.5 }}>
                    <CalendarToday fontSize="small" sx={{ mr: 0.5, color: COLORS.ORANGE_LIGHT }} />
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(ticket.event?.date).format('MMM D, YYYY')}
                    </Typography>
                  </Box>
                  
                  {ticket.event?.time && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 0.5 }}>
                      <AccessTime fontSize="small" sx={{ mr: 0.5, color: COLORS.ORANGE_LIGHT }} />
                      <Typography variant="body2" color="text.secondary">
                        {ticket.event.time}
                      </Typography>
                    </Box>
                  )}
                  
                  <Chip 
                    size="small" 
                    label={ticket.quantity > 1 ? `${ticket.quantity} tickets` : '1 ticket'} 
                    sx={{ 
                      height: 24,
                      mr: 1,
                      mb: 0.5,
                      backgroundColor: 'rgba(255, 128, 0, 0.1)',
                      color: COLORS.ORANGE_DARK,
                      fontWeight: 600
                    }} 
                  />
                  
                  <Chip 
                    size="small" 
                    label={ticket.used ? 'Used' : 'Active'} 
                    icon={ticket.used ? <CheckCircle fontSize="small" /> : <PendingActions fontSize="small" />}
                    sx={{ 
                      height: 24,
                      mb: 0.5,
                      backgroundColor: ticket.used ? 'rgba(76, 175, 80, 0.1)' : 'rgba(3, 169, 244, 0.1)',
                      color: ticket.used ? COLORS.GREEN : COLORS.BLUE,
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: 'inherit',
                      }
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails sx={{ py: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Event Details
                  </Typography>
                  
                  {ticket.event?.location && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Place fontSize="small" sx={{ mr: 1, mt: 0.3, color: COLORS.ORANGE_MAIN }} />
                      <Typography variant="body2">
                        {ticket.event.location.address}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2 }} gutterBottom>
                    Ticket Information
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Order Date: {dayjs(ticket.createdAt).format('MMMM D, YYYY')}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Order ID: {ticket._id}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Quantity: {ticket.quantity}
                  </Typography>
                  
                  {ticket.ticketType && (
                    <Typography variant="body2" gutterBottom>
                      Type: {ticket.ticketType}
                    </Typography>
                  )}
                  
                  {ticket.price && (
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Total Paid: ${(ticket.price * ticket.quantity).toFixed(2)}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Scan this QR code at the event
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      p: 3, 
                      border: `1px solid ${COLORS.GRAY_LIGHT}`,
                      borderRadius: 2,
                      backgroundColor: 'white',
                      mb: 2
                    }}
                  >
                    {renderQRCode(ticket)}
                  </Box>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => downloadQR(ticket._id, ticket.event?.title || 'Event', ticket.qrCodeData)}
                    sx={{
                      borderColor: COLORS.ORANGE_MAIN,
                      color: COLORS.ORANGE_MAIN,
                      '&:hover': {
                        borderColor: COLORS.ORANGE_DARK,
                        backgroundColor: 'rgba(255, 128, 0, 0.05)'
                      }
                    }}
                  >
                    Download QR Code
                  </Button>
                  
                  {ticket.quantity > 1 && (
                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: COLORS.SLATE }}>
                      This QR code is valid for all {ticket.quantity} tickets.
                    </Typography>
                  )}
                  
                  {ticket.ticketCode && (
                    <Box sx={{ mt: 3, width: '100%' }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Ticket Code
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          p: 1, 
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                          borderRadius: 1,
                          textAlign: 'center',
                          letterSpacing: '1px'
                        }}
                      >
                        {ticket.ticketCode}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default TicketsList; 