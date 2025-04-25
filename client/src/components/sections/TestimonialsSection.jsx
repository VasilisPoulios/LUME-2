import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Container, Card, CardContent, Rating, Avatar, useTheme, useMediaQuery } from '@mui/material';
import Slider from 'react-slick';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { COLORS } from '../../styles';

// Import Slick Carousel css
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TestimonialsSection = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const [viewPortEntered, setViewPortEntered] = useState(false);
  
  // Testimonial data
  const testimonials = [
    {
      name: "Marina Kostaras",
      role: "Local Resident",
      quote: "LUME has completely changed how I find things to do on weekends. Their event recommendations are always spot-on!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Theo Alexiou",
      role: "Tourist from Athens",
      quote: "Thanks to LUME, we discovered amazing local events that weren't in any guidebook. Made our vacation truly memorable!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Elena Papadopoulos",
      role: "Venue Owner",
      quote: "Since listing our events on LUME, we've seen a 40% increase in attendance. Their platform brings in exactly the right audience.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      name: "Nikolas Dimitriou",
      role: "Festival Organizer",
      quote: "LUME's platform made it incredibly easy to promote our festival and track RSVPs. We're definitely using it for all future events.",
      rating: 4,
      image: "https://randomuser.me/api/portraits/men/75.jpg"
    }
  ];
  
  // Business logos
  const businessLogos = [
    { name: "Rhodes Beach Club", icon: "🏖️" },
    { name: "Olive Garden Restaurant", icon: "🍽️" },
    { name: "Island Tours", icon: "🚢" },
    { name: "Old Town Gallery", icon: "🏛️" },
    { name: "Sunset Festival", icon: "🎭" }
  ];
  
  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isSmall ? 1 : 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: false,
    cssEase: "linear",
    arrows: !isSmall,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          arrows: false
        }
      }
    ]
  };

  // Handle visibility change for counter animation
  const handleVisibilityChange = (isVisible) => {
    if (isVisible) {
      setViewPortEntered(true);
    }
  };

  return (
    <Box sx={{ 
      py: 8, 
      bgcolor: 'rgba(255, 128, 0, 0.03)', 
      borderTop: `1px solid ${COLORS.GRAY_LIGHT}`,
      borderBottom: `1px solid ${COLORS.GRAY_LIGHT}`
    }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 6
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            background: 'rgba(255, 128, 0, 0.1)',
            px: 2,
            py: 0.5,
            borderRadius: 2
          }}>
            <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
            <Typography 
              variant="h6" 
              component="span"
              sx={{ 
                fontWeight: 700,
                color: COLORS.SLATE
              }}
            >
              4.9 from 200+ reviews
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{ 
              fontWeight: 700,
              mb: 1,
              color: COLORS.SLATE
            }}
          >
            People Love LUME
          </Typography>

          <Typography
            variant="subtitle1"
            align="center"
            sx={{ 
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              color: COLORS.SLATE_LIGHT
            }}
          >
            Join thousands of locals, tourists, and organizers using LUME to connect with the vibrant Rhodes community
          </Typography>
        </Box>

        {/* Testimonial Carousel */}
        <Box sx={{ mb: 6 }}>
          <Slider {...sliderSettings}>
            {testimonials.map((testimonial, index) => (
              <Box key={index} sx={{ px: 2 }}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    border: `1px solid ${COLORS.GRAY_LIGHT}`,
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <FormatQuoteIcon 
                      sx={{ 
                        position: 'absolute',
                        top: -15,
                        left: 20,
                        fontSize: 40,
                        color: COLORS.ORANGE_MAIN,
                        opacity: 0.5,
                        transform: 'scaleX(-1)'
                      }} 
                    />
                    
                    <Box sx={{ mb: 2 }}>
                      <Rating
                        value={testimonial.rating}
                        readOnly
                        precision={0.5}
                        icon={<StarIcon fontSize="inherit" />}
                        emptyIcon={<StarIcon fontSize="inherit" />}
                        sx={{ 
                          color: '#FFD700',
                          '& .MuiRating-iconEmpty': {
                            color: COLORS.GRAY_LIGHT
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      component="p"
                      sx={{ 
                        mb: 3,
                        fontStyle: 'italic',
                        minHeight: 80
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          component="p"
                          sx={{ fontWeight: 600 }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          component="p"
                          sx={{ color: COLORS.SLATE_LIGHT }}
                        >
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>

        {/* Business Logos */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          mb: 6,
          gap: { xs: 2, md: 4 }
        }}>
          {businessLogos.map((business, index) => (
            <Box 
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: 2
              }}
            >
              <Typography
                variant="h4"
                sx={{ 
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 1
                }}
              >
                {business.icon}
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  color: COLORS.SLATE_LIGHT,
                  fontWeight: 500
                }}
              >
                {business.name}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* RSVPs Counter */}
        <Box 
          sx={{ 
            textAlign: 'center',
            background: `linear-gradient(45deg, ${COLORS.ORANGE_LIGHT}, ${COLORS.ORANGE_MAIN})`,
            borderRadius: 2,
            p: { xs: 4, md: 6 },
            color: 'white',
            boxShadow: '0 6px 20px rgba(255, 128, 0, 0.2)'
          }}
        >
          <VisibilitySensor
            onChange={handleVisibilityChange}
            partialVisibility
            offset={{ bottom: 200 }}
          >
            {({ isVisible }) => (
              <Typography 
                variant="h3" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <Box component="span" sx={{ mr: 1 }}>Over</Box>
                <CountUp 
                  start={viewPortEntered ? 0 : null}
                  end={12000}
                  duration={2.5}
                  separator=","
                  redraw={false}
                  suffix="+"
                />
                <Box component="span" sx={{ ml: 1 }}>RSVPs this season</Box>
              </Typography>
            )}
          </VisibilitySensor>
          <Typography 
            variant="subtitle1"
            sx={{ 
              mt: 2,
              fontWeight: 500,
              opacity: 0.9
            }}
          >
            Join the fastest-growing event platform on Rhodes
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialsSection; 