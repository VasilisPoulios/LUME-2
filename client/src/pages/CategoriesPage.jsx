import { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Box, useTheme, Chip, Stack, Avatar } from '@mui/material';
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

// Import Material-UI icons
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PaletteIcon from '@mui/icons-material/Palette';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import MovieIcon from '@mui/icons-material/Movie';
import TheatersIcon from '@mui/icons-material/Theaters';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Map icon names to components
const iconMap = {
  Search: SearchIcon,
  MusicNote: MusicNoteIcon,
  Restaurant: RestaurantIcon,
  Palette: PaletteIcon,
  SportsSoccer: SportsSoccerIcon,
  Computer: ComputerIcon,
  People: PeopleIcon,
  School: SchoolIcon,
  Movie: MovieIcon,
  Theaters: TheatersIcon,
  MoreHoriz: MoreHorizIcon
};

const CategoriesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [events, setEvents] = useState([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Create a ref for the scrollable container
  const scrollContainerRef = useRef(null);

  // Use the categories from our unified config
  const categories = UI_CATEGORIES;

  // Function to handle scrolling the categories
  const scrollCategories = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position to determine arrow visibility
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // Subtract a small buffer
    }
  };

  // Add scroll event listener to the container
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      // Check on resize
      window.addEventListener('resize', handleScroll);
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [loading]); // Only run when loading state changes, ensuring the container exists

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

  // Get icon component for a category
  const getCategoryIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || MoreHorizIcon;
    return <IconComponent />;
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
  const CurrentCategoryIcon = iconMap[currentCategory.icon] || MoreHorizIcon;

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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <CurrentCategoryIcon sx={{ fontSize: { xs: '2rem', md: '3rem' }, mr: 2 }} />
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              {currentCategory.title}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {events.length} {events.length === 1 ? 'Event' : 'Events'} Available
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={mainContainerSx}>
        {/* Horizontal Scrollable Filter Chips */}
        <Box sx={{ mb: 4, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TheaterComedyIcon sx={{ fontSize: '2rem', mr: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              What's Your Vibe?
            </Typography>
          </Box>
          
          {/* Category Scrolling Container with Navigation Arrows */}
          <Box 
            sx={{ 
              position: 'relative',
              width: '100%'
            }}
          >
            {/* Left scroll arrow */}
            {showLeftArrow && (
              <Box
                onClick={() => scrollCategories('left')}
                sx={{
                  position: 'absolute',
                  left: -16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </Box>
            )}
            
            {/* Scrollable container */}
            <Box 
              ref={scrollContainerRef}
              sx={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                position: 'relative',
                px: 1,
                // Add fade effect on the right to indicate more content
                '&::after': showRightArrow ? {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '40px',
                  background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))',
                  pointerEvents: 'none'
                } : {}
              }}
            >
              <Stack 
                direction="row" 
                spacing={1.5}
                sx={{ 
                  pb: 1,
                  minWidth: 'max-content',
                  py: 0.5 // Add some vertical padding
                }}
              >
                {categories.map((category) => {
                  const CategoryIcon = iconMap[category.icon] || MoreHorizIcon;
                  return (
                    <Chip
                      key={category.id}
                      icon={<CategoryIcon />}
                      label={category.title}
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
                  );
                })}
              </Stack>
            </Box>
            
            {/* Right scroll arrow */}
            {showRightArrow && (
              <Box
                onClick={() => scrollCategories('right')}
                sx={{
                  position: 'absolute',
                  right: -16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Events Grid */}
        <Section>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CurrentCategoryIcon sx={{ mr: 1.5 }} />
            <EnhancedSectionHeader 
              title={`${currentCategory.title} Events`}
              subtitle={`Browse all ${activeCategory === 'All' ? 'available' : currentCategory.title.toLowerCase()} events`}
              align="left"
            />
          </Box>
          
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