import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode.react';
import { getPaymentDetails } from '../api/paymentService';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  Download,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { COLORS } from '../styles';
import { formatImageUrl } from '../utils/helpers';

const TicketDetails = () => {
  const { ticketId: ticketCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tickets/${ticketCode}` } });
      return;
    }

    const fetchTicketData = async () => {
      try {
        setLoading(true);
        // Fetch ticket and event details using the ticket code
        const response = await getPaymentDetails(ticketCode);
        
        if (response.success) {
          // The /tickets/details/:code endpoint returns the ticket directly
          const ticketData = response.data;
          const eventData = ticketData.event;
          
          setTicket(ticketData);
          setEvent(eventData);
        } else {
          setError('Ticket not found');
        }
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        setError('Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketCode, isAuthenticated, navigate]);

  const handleDownloadTicket = () => {
    console.log('Download ticket clicked');
    
    // If the ticket has QR code data, use it directly
    if (ticket && ticket.qrCodeData) {
      console.log('Using ticket.qrCodeData directly');
      const downloadLink = document.createElement('a');
      downloadLink.href = ticket.qrCodeData;
      downloadLink.download = `ticket-${ticket.ticketCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return;
    }
    
    // If the QR code is an image element (server-generated)
    console.log('Looking for .ticket-qr-image element');
    const qrImage = document.querySelector('.ticket-qr-image');
    if (qrImage) {
      console.log('Found .ticket-qr-image element, using its src');
      const downloadLink = document.createElement('a');
      downloadLink.href = qrImage.src;
      downloadLink.download = `ticket-${ticket.ticketCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return;
    }
    
    // If the QR code is a canvas element (client-generated)
    console.log('Looking for #ticket-qr-code canvas element');
    const canvas = document.getElementById('ticket-qr-code');
    if (canvas) {
      console.log('Found canvas element, generating data URL');
      try {
        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        console.log('Created data URL from canvas');
        
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `ticket-${ticket.ticketCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        console.log('Download initiated');
      } catch (error) {
        console.error('Error generating download from canvas:', error);
        alert('Failed to download QR code. Please try again.');
      }
    } else {
      console.error('No QR element found to download');
      alert('Could not find QR code to download. Please try again.');
    }
  };

  // Render QR code based on available data
  const renderQRCode = () => {
    if (!ticket) return null;
    
    // If the server has already generated a QR code, use it
    if (ticket.qrCodeData) {
      console.log('Using server-generated QR code');
      return (
        <Box 
          component="img"
          src={ticket.qrCodeData}
          alt={`QR Code for ticket ${ticket.ticketCode}`}
          className="ticket-qr-image"
          sx={{ 
            width: 200, 
            height: 200,
            border: `1px solid ${COLORS.GRAY_LIGHT}`,
            padding: 1,
            borderRadius: 1
          }}
        />
      );
    }
    
    // Otherwise, generate one client-side
    console.log('Generating client-side QR code');
    return (
      <Box sx={{ 
        border: `1px solid ${COLORS.GRAY_LIGHT}`,
        padding: 2,
        borderRadius: 1,
        backgroundColor: 'white',
        display: 'inline-block'
      }}>
        <QRCode 
          id="ticket-qr-code"
          value={ticket.ticketCode}
          size={200}
          level="H"
          includeMargin={true}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: COLORS.ORANGE_MAIN }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading ticket details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tickets')}
          >
            Back to My Tickets
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!ticket || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="warning">
            No ticket information found
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tickets')}
            sx={{ mt: 2 }}
          >
            Back to My Tickets
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tickets')}
          sx={{ mb: 3 }}
        >
          Back to My Tickets
        </Button>
        
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            color: COLORS.SLATE,
          }}
        >
          Your Ticket
        </Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${COLORS.GRAY_LIGHT}`
        }}
      >
        <Grid container spacing={4}>
          {/* Event Details Section */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} md={3}>
                <Box
                  component="img"
                  src={event.image ? formatImageUrl(event.image) : '/placeholder-event.jpg'}
                  alt={event.title}
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    height: { xs: 140, sm: 180 },
                    objectFit: 'cover'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={8} md={9}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {event.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday fontSize="small" sx={{ mr: 1, color: COLORS.ORANGE_LIGHT }} />
                  <Typography variant="body1">
                    {dayjs(event.date).format('dddd, MMMM D, YYYY')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime fontSize="small" sx={{ mr:
                  1, color: COLORS.ORANGE_LIGHT }} />
                  <Typography variant="body1">
                    {event.time || 'Time TBD'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <LocationOn fontSize="small" sx={{ mr: 1, mt: 0.5, color: COLORS.ORANGE_LIGHT }} />
                  <Typography variant="body1">
                    {event.venue || 'Venue TBD'}, {event.address || event?.location?.address || 'Address TBD'}
                  </Typography>
                </Box>
                
                {event.category && (
                  <Chip 
                    label={event.category} 
                    size="small"
                    sx={{ 
                      mt: 1,
                      bgcolor: 'rgba(255, 128, 0, 0.1)',
                      color: COLORS.ORANGE_DARK,
                      fontWeight: 600
                    }}
                  />
                )}
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
          </Grid>
          
          {/* Ticket Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Ticket Information
            </Typography>
            
            <Card 
              elevation={0} 
              sx={{ 
                mb: 3, 
                border: `1px solid ${COLORS.GRAY_LIGHT}`,
                borderRadius: 2
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Ticket Code
                  </Typography>
                  <Chip 
                    label={ticket.status === 'active' ? 'Valid' : ticket.status} 
                    size="small"
                    color={ticket.status === 'active' ? 'success' : 'default'}
                    icon={ticket.status === 'active' ? <CheckCircle fontSize="small" /> : null}
                  />
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    p: 1,
                    mb: 2, 
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 1
                  }}
                >
                  {ticket.ticketCode}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ticket Type
                    </Typography>
                    <Typography variant="body1">
                      {ticket.ticketType || 'Standard'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography variant="body1">
                      {ticket.quantity || 1}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Purchase Date
                    </Typography>
                    <Typography variant="body1">
                      {dayjs(ticket.createdAt).format('MMM D, YYYY')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Issued To
                    </Typography>
                    <Typography variant="body1">
                      {user?.name || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* QR Code Section */}
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Entry QR Code
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {renderQRCode()}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Present this QR code at the event entrance for admission.
              {ticket.quantity > 1 && ` This ticket is valid for ${ticket.quantity} people.`}
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadTicket}
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
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                This QR code is valid for all {ticket.quantity} tickets.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TicketDetails; 