import { Box, Typography, Container, Grid, Paper, Avatar, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import StoreIcon from '@mui/icons-material/Store';
import { Link as RouterLink } from 'react-router-dom';
import { COLORS } from '../../styles';

const WhoIsLumeForSection = () => {
  const userTypes = [
    {
      title: 'Locals',
      description: 'Find something fun on your night off.',
      icon: <HomeIcon fontSize="large" />
    },
    {
      title: 'Tourists',
      description: 'Experience Rhodes like you live here.',
      icon: <FlightIcon fontSize="large" />
    },
    {
      title: 'Organizers',
      description: 'Fill your venue with RSVPs and buzz.',
      icon: <StoreIcon fontSize="large" />
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'white' }}>
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
          Who's LUME For?
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
          LUME brings people together, no matter who you are
        </Typography>

        <Grid 
          container 
          spacing={4} 
          justifyContent="center"
        >
          {userTypes.map((type, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={index}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  border: `1px solid ${COLORS.GRAY_LIGHT}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    bgcolor: COLORS.ORANGE_MAIN,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(255, 128, 0, 0.2)'
                  }}
                >
                  {type.icon}
                </Avatar>
                
                <Typography 
                  variant="h5" 
                  component="h3"
                  sx={{ 
                    fontWeight: 600,
                    mb: 2,
                    color: COLORS.SLATE
                  }}
                >
                  {type.title}
                </Typography>
                
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: COLORS.SLATE_LIGHT,
                    mb: 3
                  }}
                >
                  {type.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: 6,
          gap: 3,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/discover"
            sx={{
              bgcolor: COLORS.ORANGE_MAIN,
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: COLORS.ORANGE_DARK
              }
            }}
          >
            Explore Events
          </Button>
          
          <Button
            variant="outlined"
            component={RouterLink}
            to="/register?role=organizer"
            sx={{
              borderColor: COLORS.ORANGE_MAIN,
              color: COLORS.ORANGE_MAIN,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                borderColor: COLORS.ORANGE_DARK,
                color: COLORS.ORANGE_DARK,
                bgcolor: 'rgba(255, 128, 0, 0.05)'
              }
            }}
          >
            List Your Event
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default WhoIsLumeForSection; 