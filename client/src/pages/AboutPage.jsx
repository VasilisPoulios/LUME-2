import React from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Avatar } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PublicIcon from '@mui/icons-material/Public';
import TargetIcon from '@mui/icons-material/GpsFixed';
import PeopleIcon from '@mui/icons-material/People';
import { Link as RouterLink } from 'react-router-dom';
import { COLORS } from '../styles';

const AboutPage = () => {
  // Define the sections with their content
  const sections = [
    {
      title: 'About LUME',
      content: [
        'Live. Unite. Meet. Explore.',
        'LUME is your guide to the vibrant event scene on the beautiful island of Rhodes. Whether you\'re a local looking for something new or a visitor eager to experience the real Rhodes, we\'re here to connect you with the best the island has to offer.',
        'We believe life is better when it\'s lived together — and unforgettable memories are only one RSVP away.'
      ],
      icon: <FavoriteIcon fontSize="large" />
    },
    {
      title: 'What We Do',
      content: [
        'Curate and showcase events from across Rhodes',
        'Help you discover hidden gems and headline acts',
        'Make it easy to RSVP, save, and plan your perfect outing',
        'Support local businesses, creators, and venues by helping them reach their audience'
      ],
      icon: <PublicIcon fontSize="large" />
    },
    {
      title: 'Our Mission',
      content: [
        'To bring people together through the power of shared experiences — no matter where they come from or what they\'re into.'
      ],
      icon: <TargetIcon fontSize="large" />
    },
    {
      title: 'Join the Movement',
      content: [
        'Thousands of locals and travelers already use LUME to find their next great memory. Are you ready?'
      ],
      icon: <PeopleIcon fontSize="large" />
    }
  ];

  return (
    <Box sx={{ py: 12, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: COLORS.SLATE,
              mb: 3
            }}
          >
            About Us
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              color: COLORS.SLATE_LIGHT,
              fontSize: '1.25rem',
              mb: 4
            }}
          >
            Bringing people together through incredible events and experiences on the island of Rhodes
          </Typography>
        </Box>

        {/* About Sections */}
        <Grid container spacing={6}>
          {sections.map((section, index) => (
            <Grid item xs={12} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 3,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  border: `1px solid ${COLORS.GRAY_LIGHT}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mr: 2,
                      bgcolor: COLORS.ORANGE_MAIN,
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(255, 128, 0, 0.2)'
                    }}
                  >
                    {section.icon}
                  </Avatar>
                  
                  <Typography 
                    variant="h4" 
                    component="h2"
                    sx={{ 
                      fontWeight: 700,
                      color: COLORS.ORANGE_MAIN,
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                
                <Box sx={{ ml: { xs: 0, sm: 7 } }}>
                  {section.content.map((paragraph, i) => (
                    <React.Fragment key={i}>
                      {/* First paragraph in each section is treated as a highlight */}
                      {i === 0 && section.title !== 'What We Do' ? (
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            mb: 3, 
                            fontWeight: 600,
                            color: COLORS.SLATE
                          }}
                        >
                          {paragraph}
                        </Typography>
                      ) : (
                        <Typography 
                          variant={section.title === 'What We Do' ? 'body1' : 'body1'} 
                          sx={{ 
                            mb: 2,
                            color: COLORS.SLATE,
                            fontSize: '1.125rem',
                            display: section.title === 'What We Do' ? 'flex' : 'block',
                            alignItems: section.title === 'What We Do' ? 'center' : 'flex-start',
                            '&:before': section.title === 'What We Do' ? {
                              content: '""',
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: COLORS.ORANGE_MAIN,
                              marginRight: '16px'
                            } : {}
                          }}
                        >
                          {paragraph}
                        </Typography>
                      )}
                    </React.Fragment>
                  ))}
                </Box>
                
                {section.title === 'Join the Movement' && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start',
                    mt: 4,
                    ml: { xs: 0, sm: 7 },
                    gap: 3
                  }}>
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/register"
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
                      Sign Up Now
                    </Button>
                    
                    <Button
                      variant="outlined"
                      component={RouterLink}
                      to="/discover"
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
                      Browse Events
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutPage; 