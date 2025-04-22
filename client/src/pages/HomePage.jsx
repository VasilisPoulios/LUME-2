import { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Box, useTheme, IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getEvents, getFeaturedEvents, getHotEvents, getUnmissableEvents } from '../api/eventService';
import { useAuth } from '../context/AuthContext';
import { EventCard, CategoryCard, LumeButton, FeaturedCarousel } from '../components/ui';
import { HeroSection, CTASection } from '../components/sections';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Section,
  EnhancedSectionHeader,
  ViewAllButton,
  mainContainerSx,
  loadingContainerSx,
  errorContainerSx,
  refreshButtonSx,
  eventCardSx,
  categoryCardSx,
  emptyEventsSx,
  actionButtonWrapperSx,
  outlinedButtonSx,
  containedButtonSx,
  // Scrollable events styles
  scrollableContainerSx,
  leftScrollButtonSx,
  rightScrollButtonSx,
  eventCardItemSx,
  scrollContainerWrapperSx,
} from '../styles';
import { UI_CATEGORIES } from '../utils/categoryConfig';

const HomePage = () => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [hotEvents, setHotEvents] = useState([]);
  const [unmissableEvents, setUnmissableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Popular categories - use a subset of the unified categories
  const categories = UI_CATEGORIES
    .filter(cat => ['Music', 'Food & Drink', 'Arts', 'Sports'].includes(cat.title))
    .map(cat => ({
      title: cat.title,
      image: cat.image,
      count: 0, // Initialize with 0, can be updated later
      id: cat.id,
      backendCategory: cat.backendCategory
    }));

  useEffect(() => {
    const fetchAllEventData = async () => {
      try {
        setLoading(true);
        
        // Fetch regular events for the "Just Added" section
        const eventsResponse = await getEvents({ limit: 8, sort: '-createdAt' });
        
        // Fetch events marked as featured by admin
        const featuredResponse = await getFeaturedEvents();
        
        // Fetch events marked as hot by admin
        const hotResponse = await getHotEvents();
        
        // Fetch events marked as unmissable by admin
        const unmissableResponse = await getUnmissableEvents();
        
        // Check if responses are successful and update state
        if (eventsResponse.success && eventsResponse.data) {
          const eventsData = eventsResponse.data.data || [];
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } else {
          console.error('Invalid response for regular events:', eventsResponse);
        }
        
        if (featuredResponse.success && featuredResponse.data) {
          const featuredData = featuredResponse.data.data || [];
          setFeaturedEvents(Array.isArray(featuredData) ? featuredData : []);
        } else {
          console.error('Invalid response for featured events:', featuredResponse);
        }
        
        if (hotResponse.success && hotResponse.data) {
          const hotData = hotResponse.data.data || [];
          setHotEvents(Array.isArray(hotData) ? hotData : []);
        } else {
          console.error('Invalid response for hot events:', hotResponse);
        }
        
        if (unmissableResponse.success && unmissableResponse.data) {
          const unmissableData = unmissableResponse.data.data || [];
          setUnmissableEvents(Array.isArray(unmissableData) ? unmissableData : []);
        } else {
          console.error('Invalid response for unmissable events:', unmissableResponse);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchAllEventData();
  }, []);

  // Functions to scroll the container
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <>
        <HeroSection />
        <Container maxWidth="lg" sx={loadingContainerSx}>
          <Typography variant="h5" color="text.secondary">Loading amazing events just for you...</Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeroSection />
        <Container maxWidth="lg" sx={errorContainerSx}>
          <Typography variant="h5" color="error">{error}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>We're working on getting things back up. Please try again soon.</Typography>
          <LumeButton 
            variant="contained" 
            sx={refreshButtonSx}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </LumeButton>
        </Container>
      </>
    );
  }

  const handleCategoryClick = (category) => {
    console.log(`Category clicked: ${category}`);
    // Navigate to search page with category filter and scroll param
    navigate(`/discover?category=${encodeURIComponent(category)}&scroll=true`);
  };

  const handleEventClick = (eventId) => {
    console.log(`Event clicked: ${eventId}`);
    // Navigate to event details page
    navigate(`/events/${eventId}`);
  };

  return (
    <Box>
      {/* Hero Section - Full width */}
      <HeroSection />
      
      {/* Featured Carousel - Full width, right below hero */}
      {featuredEvents.length > 0 && (
        <Box sx={{ py: 0, mb: 4, mt: 2 }}>
          <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
            <FeaturedCarousel events={featuredEvents} interval={6000} />
          </Container>
        </Box>
      )}
      
      {/* Main Content - With Container */}
      <Container maxWidth="lg" sx={mainContainerSx}>
        {/* This week's unmissable events Section */}
        {unmissableEvents.length > 0 && (
          <Section>
            <EnhancedSectionHeader 
              title="This week's unmissable events" 
              subtitle="Handpicked by locals who know the island best"
              align="left"
            />
            <ViewAllButton 
              endIcon={<ArrowForwardIcon />}
              component={RouterLink}
              to="/discover?unmissable=true"
            >
              View All
            </ViewAllButton>
            
            <Box sx={scrollContainerWrapperSx}>
              <IconButton
                onClick={scrollLeft}
                size="small"
                sx={leftScrollButtonSx}
              >
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
              
              <Box 
                ref={scrollContainerRef}
                sx={scrollableContainerSx}
              >
                {unmissableEvents.map(event => (
                  <Box
                    key={event._id || event.id}
                    sx={eventCardItemSx}
                  >
                    <EventCard
                      image={event.image}
                      title={event.title}
                      date={event.startDateTime}
                      location={event.venue}
                      category={event.category}
                      price={event.price}
                      onClick={() => handleEventClick(event._id || event.id)}
                      sx={eventCardSx}
                    />
                  </Box>
                ))}
              </Box>
              
              <IconButton
                onClick={scrollRight}
                size="small"
                sx={rightScrollButtonSx}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          </Section>
        )}

        {/* Hot Events Section - Only show if there are hot events */}
        {hotEvents.length > 0 && (
          <Section>
            <EnhancedSectionHeader 
              title="🔥 Hot Right Now" 
              subtitle="These events are trending fast — before tickets vanish"
              align="left"
            />
            <ViewAllButton 
              endIcon={<ArrowForwardIcon />}
              component={RouterLink}
              to="/discover?hot=true"
            >
              View All
            </ViewAllButton>
            
            <Grid container spacing={3}>
              {hotEvents.map(event => (
                <Grid item xs={12} sm={6} md={3} key={event._id || event.id}>
                  <EventCard
                    image={event.image}
                    title={event.title}
                    date={event.startDateTime}
                    location={event.venue}
                    category={event.category}
                    price={event.price}
                    onClick={() => handleEventClick(event._id || event.id)}
                    sx={eventCardSx}
                    isHot={true}
                  />
                </Grid>
              ))}
            </Grid>
          </Section>
        )}

        {/* Categories Section */}
        <Section>
          <EnhancedSectionHeader 
            title="Browse by Category" 
            subtitle="Find the perfect events that match your interests and passions"
            align="left"
          />
          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <CategoryCard
                  title={category.title}
                  image={category.image}
                  count={category.count}
                  onClick={() => handleCategoryClick(category.id)}
                  sx={categoryCardSx}
                />
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Latest Events Section */}
        <Section>
          <EnhancedSectionHeader 
            title="Just Added" 
            subtitle="Be the first to discover and book these newly listed events"
            align="left"
          />
          <ViewAllButton 
            endIcon={<ArrowForwardIcon />}
            component={RouterLink}
            to="/discover"
          >
            View All
          </ViewAllButton>
          {events.length === 0 ? (
            <Typography variant="body1" sx={emptyEventsSx}>
              New events are coming soon! Check back later.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {events.map(event => (
                <Grid item xs={12} sm={6} md={3} key={event._id || event.id}>
                  <EventCard
                    image={event.image}
                    title={event.title}
                    date={event.startDateTime}
                    location={event.venue}
                    category={event.category}
                    price={event.price}
                    onClick={() => handleEventClick(event._id || event.id)}
                    sx={eventCardSx}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          <Box sx={actionButtonWrapperSx}>
            <LumeButton 
              variant="contained"
              component={RouterLink}
              to="/discover"
              sx={containedButtonSx}
            >
              Find More Events
            </LumeButton>
          </Box>
        </Section>
      </Container>
      
      {/* CTA Section - Full width, above Footer */}
      <CTASection />
    </Box>
  );
};

export default HomePage; 