import { useState, useEffect, useCallback } from 'react';
import { Typography, Box, IconButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';
import { LumeButton } from './';
import {
  CarouselContainer,
  SlideContainer,
  Slide,
  SlideImage,
  SlideContent,
  DotsContainer,
  Dot,
  NavArrow,
  FeatureBadge,
  EventTitle,
  EventMeta,
  EventDescription,
  CTAContainer
} from '../../styles';

const FeaturedCarousel = ({ events = [], interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Go to next slide with animation
  const nextSlide = useCallback(() => {
    if (isAnimating || events.length <= 1) return;
    
    setIsAnimating(true);
    setAnimatingIndex(currentIndex);
    
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
      setAnimatingIndex(null);
      setIsAnimating(false);
    }, 1000); // Match the animation duration
  }, [currentIndex, events.length, isAnimating]);

  // Go to previous slide with animation
  const prevSlide = useCallback(() => {
    if (isAnimating || events.length <= 1) return;
    
    setIsAnimating(true);
    setAnimatingIndex(currentIndex);
    
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? events.length - 1 : prevIndex - 1
      );
      setAnimatingIndex(null);
      setIsAnimating(false);
    }, 1000);
  }, [currentIndex, events.length, isAnimating]);

  // Go to specific slide
  const goToSlide = (index) => {
    if (index === currentIndex || isAnimating) return;
    
    setIsAnimating(true);
    setAnimatingIndex(currentIndex);
    
    setTimeout(() => {
      setCurrentIndex(index);
      setAnimatingIndex(null);
      setIsAnimating(false);
    }, 1000);
  };

  // Auto-cycle through slides
  useEffect(() => {
    const autoChangeTimer = setInterval(() => {
      nextSlide();
    }, interval);
    
    return () => clearInterval(autoChangeTimer);
  }, [interval, nextSlide]);

  // Handle click on an event
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Date TBA';
    }
  };

  // If there are no events, don't render the carousel
  if (!events || events.length === 0) return null;

  return (
    <CarouselContainer>
      <SlideContainer>
        {events.map((event, index) => (
          <Slide 
            key={event._id || event.id || index}
            data-active={index === currentIndex}
            data-fade-in={index === currentIndex && animatingIndex !== null}
            data-fade-out={index === animatingIndex}
          >
            <SlideImage 
              src={event.image || `https://source.unsplash.com/random/1200x600/?event,${event.category || 'festival'}`} 
              alt={event.title}
            />
            <FeatureBadge>Featured</FeatureBadge>
            <SlideContent>
              <EventTitle component={Typography} variant="h3">
                {event.title}
              </EventTitle>
              
              <EventMeta>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                  <CalendarTodayIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">
                    {formatDate(event.startDateTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">
                    {event.venue || 'Location TBA'}
                  </Typography>
                </Box>
              </EventMeta>
              
              <EventDescription component={Typography} variant="body1">
                {event.description?.substring(0, 150) || 
                 'Join us for this amazing event. More details will be provided soon!'}
                {event.description?.length > 150 ? '...' : ''}
              </EventDescription>
              
              <CTAContainer>
                <LumeButton 
                  variant="contained"
                  onClick={() => handleEventClick(event._id || event.id)}
                  sx={{ 
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                  }}
                >
                  View Details
                </LumeButton>
              </CTAContainer>
            </SlideContent>
          </Slide>
        ))}
      </SlideContainer>
      
      {/* Navigation arrows */}
      <NavArrow 
        component={IconButton}
        onClick={prevSlide}
        direction="left"
      >
        <KeyboardArrowLeftIcon sx={{ color: 'white' }} />
      </NavArrow>
      
      <NavArrow 
        component={IconButton}
        onClick={nextSlide}
        direction="right"
      >
        <KeyboardArrowRightIcon sx={{ color: 'white' }} />
      </NavArrow>
      
      {/* Dots navigation */}
      <DotsContainer>
        {events.map((_, index) => (
          <Dot 
            key={index} 
            data-active={index === currentIndex}
            onClick={() => goToSlide(index)}
          />
        ))}
      </DotsContainer>
    </CarouselContainer>
  );
};

export default FeaturedCarousel; 