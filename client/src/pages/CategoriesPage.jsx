import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, useTheme, Chip, Stack } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getEvents } from '../api/eventService';
import { EventCard, LumeButton } from '../components/ui';
import {
  Section,
  EnhancedSectionHeader,
  mainContainerSx,
  loadingContainerSx,
  errorContainerSx,
  refreshButtonSx
} from '../styles';
import { useMediaQuery } from '@mui/material';
import { UI_CATEGORIES, getFrontendToBackendCategory } from '../utils/categoryConfig';

const CategoriesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [events, setEvents] = useState([]);

  // Use the categories from our unified config
  const categories = UI_CATEGORIES;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      
      try {
        // Get category from URL if present
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        
        if (categoryParam) {
          setActiveCategory(categoryParam);
        }
        
        // Find the selected category object
        const selectedCategory = categories.find(cat => cat.id === activeCategory);
        
        // Only include category parameter if a specific category is selected (not 'All')
        // and map to the correct backend category if needed
        const queryParams = activeCategory === 'All' 
          ? {} 
          : { category: selectedCategory?.backendCategory || activeCategory };
        
        // Fetch events based on active category
        const eventsResponse = await getEvents(queryParams);
        
        if (eventsResponse.success && eventsResponse.data) {
          setEvents(eventsResponse.data.data || []);
        } else {
          console.error('Failed to fetch events');
          setError('Failed to load events data');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [activeCategory, location.search, categories]);

  // When the component mounts or URL changes, set the active category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('All');
    }
  }, [location.search]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    
    // Update URL for shareable links
    if (categoryId === 'All') {
      navigate('/categories');
    } else {
      navigate(`/categories?category=${categoryId}`);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{...loadingContainerSx, pt: 8}}>
        <Typography variant="h5" color="text.secondary">Loading events...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{...errorContainerSx, pt: 8}}>
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
    );
  }

  // Get the current category - make sure we find the exact match by ID
  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          width: '100%',
          bgcolor: 'primary.light', 
          py: 6,
          backgroundImage: `linear-gradient(rgba(0, 38, 100, 0.8), rgba(0, 38, 100, 0.8)), url(${currentCategory.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            {currentCategory.emoji} {currentCategory.title}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {events.length} {events.length === 1 ? 'Event' : 'Events'} Available
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={mainContainerSx}>
        {/* Horizontal Scrollable Filter Chips */}
        <Box sx={{ mb: 4, mt: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            🎭 What's Your Vibe?
          </Typography>
          
          <Box sx={{ 
            overflowX: 'auto', 
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <Stack 
              direction="row" 
              spacing={1.5}
              sx={{ 
                pb: 1,
                minWidth: 'max-content'
              }}
            >
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={`${category.emoji} ${category.title}`}
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{ 
                    px: 1,
                    fontWeight: activeCategory === category.id ? 700 : 400,
                    color: activeCategory === category.id ? 'primary.main' : 'text.primary',
                    borderBottom: activeCategory === category.id ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: '16px 16px 2px 2px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 129, 0, 0.08)',
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
        
        {/* Events Grid */}
        <Section>
          <EnhancedSectionHeader 
            title={`${currentCategory.emoji} ${currentCategory.title} Events`}
            subtitle={`Browse all ${activeCategory === 'All' ? 'available' : currentCategory.title.toLowerCase()} events`}
            align="left"
          />
          
          {events.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 8 }}>
              <Typography variant="h5" color="text.secondary">
                No events found in this category
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Try selecting a different category or check back later for new events
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id || event.id}>
                  <EventCard
                    image={event.image}
                    title={event.title}
                    date={event.startDateTime}
                    location={event.venue}
                    category={event.category}
                    price={event.price}
                    onClick={() => handleEventClick(event._id || event.id)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Section>
      </Container>
    </Box>
  );
};

export default CategoriesPage; 