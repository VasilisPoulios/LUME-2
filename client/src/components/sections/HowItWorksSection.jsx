import { Box, Typography, Container, Grid, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { COLORS } from '../../styles';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <SearchIcon fontSize="large" />,
      title: 'Browse Events',
      description: 'Discover amazing events happening around Rhodes. Filter by category, date, or location to find the perfect experience.'
    },
    {
      icon: <ConfirmationNumberIcon fontSize="large" />,
      title: 'RSVP or Buy Tickets',
      description: 'Reserve your spot for free events or purchase tickets securely for paid ones. All confirmations are sent directly to your email.'
    },
    {
      icon: <CelebrationIcon fontSize="large" />,
      title: 'Show Up and Enjoy',
      description: 'Just bring your ticket (digital or printed) to the event. Check in with your QR code and enjoy your experience!'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'rgba(255, 128, 0, 0.05)' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 3,
            color: COLORS.SLATE
          }}
        >
          How It Works
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ 
            mb: 6,
            maxWidth: '700px',
            mx: 'auto',
            color: COLORS.SLATE_LIGHT
          }}
        >
          From discovery to attendance, enjoy a seamless experience with LUME
        </Typography>

        <Grid 
          container 
          spacing={4} 
          justifyContent="center"
        >
          {steps.map((step, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={index}
              sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: COLORS.ORANGE_MAIN,
                  width: 80,
                  height: 80,
                  mb: 2,
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }}
              >
                {step.icon}
              </Avatar>
              
              <Typography 
                variant="h6" 
                component="h3"
                sx={{ 
                  fontWeight: 600,
                  mb: 1.5,
                  color: COLORS.SLATE
                }}
              >
                {step.title}
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{ 
                  color: COLORS.SLATE_LIGHT,
                  maxWidth: '300px'
                }}
              >
                {step.description}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorksSection; 