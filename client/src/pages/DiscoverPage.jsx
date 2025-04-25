import { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Box, useTheme, IconButton, Chip, Stack, Divider, Paper, Button, Card, CardActionArea, CardMedia, CardContent, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import ExploreIcon from '@mui/icons-material/Explore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { getEvents, searchEvents, getFeaturedEvents, getHotEvents, getUnmissableEvents } from '../api/eventService';
import { EventCard, CategoryCard, LumeButton, FeaturedCarousel, SearchBar } from '../components/ui';
import { Link as RouterLink } from 'react-router-dom';
import { formatImageUrl, formatCurrency, getCategoryColor } from '../utils/helpers';
import { UI_CATEGORIES, getFrontendToBackendCategory } from '../utils/categoryConfig';
import FeaturedSwipeDeck from '../components/discover/FeaturedSwipeDeck';
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
  scrollContainerWrapperSx
} from '../styles';
import { COLORS } from '../styles';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';
import moment from 'moment';

// Featured Event Showcase Component - Shows one event at a time with animations
const FeaturedEventShowcase = ({ featuredEvents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const currentEvent = featuredEvents[currentIndex];

  const navigateEvent = (newDirection) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setDirection(newDirection);
    
    let newIndex;
    if (newDirection === 'next') {
      newIndex = (currentIndex + 1) % featuredEvents.length;
    } else {
      newIndex = (currentIndex - 1 + featuredEvents.length) % featuredEvents.length;
    }
    
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 500);
  };

  if (!currentEvent) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <Button 
        onClick={() => navigateEvent('prev')}
        sx={{
          position: 'absolute',
          left: { xs: '5px', md: '15px' },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          minWidth: '40px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            backgroundColor: 'grey.200',
          }
        }}
      >
        <KeyboardArrowLeft />
      </Button>
      
      <Box 
        sx={{
          display: 'flex',
          width: '100%',
          transform: direction === 'next' 
            ? isAnimating ? 'translateX(-100%)' : 'translateX(0)' 
            : direction === 'prev' 
              ? isAnimating ? 'translateX(100%)' : 'translateX(0)'
              : 'translateX(0)',
          transition: 'transform 0.5s ease-in-out',
        }}
      >
        <Card
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            width: '100%',
            height: { xs: 'auto', md: '400px' },
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <CardActionArea 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${currentEvent._id}`);
            }}
            sx={{ 
              flex: { xs: '1', md: '1 0 55%' }, 
              position: 'relative',
              height: { xs: '200px', md: '100%' }
            }}
          >
            <CardMedia
              component="img"
              image={formatImageUrl(currentEvent.image)}
              alt={currentEvent.title}
              sx={{ 
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </CardActionArea>
          
          <Box 
            sx={{ 
              flex: { xs: '1', md: '1 0 45%' },
              display: 'flex',
              flexDirection: 'column',
              p: 3,
              height: '100%'
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="overline" 
                color="primary" 
                gutterBottom
                sx={{ fontSize: '0.75rem' }}
              >
                {moment(currentEvent.startDateTime).format('ddd, MMM D • h:mm A')}
              </Typography>
              
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  height: { xs: 'auto', md: '80px' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {currentEvent.title}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 3, md: 4 },
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word'
                }}
              >
                {currentEvent.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {currentEvent.venue}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label={currentEvent.category} 
                  size="small" 
                  sx={{ 
                    backgroundColor: getCategoryColor(currentEvent.category),
                    color: 'white',
                    mr: 1
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'text.primary' 
                  }}
                >
                  {formatCurrency(currentEvent.price)}
                </Typography>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${currentEvent._id}`);
                  }}
                  sx={{ 
                    mt: 'auto',
                    maxWidth: '100%',
                    textTransform: 'none'
                  }}
                >
                  View Details
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
      
      <Button 
        onClick={() => navigateEvent('next')}
        sx={{
          position: 'absolute',
          right: { xs: '5px', md: '15px' },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          minWidth: '40px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            backgroundColor: 'grey.200',
          }
        }}
      >
        <KeyboardArrowRight />
      </Button>
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 2 
        }}
      >
        {featuredEvents.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              mx: 0.5,
              backgroundColor: index === currentIndex ? 'primary.main' : 'grey.300',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: index === currentIndex ? 'primary.dark' : 'grey.400',
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// Hot Right Now Badge Component for EventCard
const HotBadge = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: { xs: '70px', md: '80px' },
      height: { xs: '70px', md: '80px' },
      background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0H100L0 100V0Z' fill='%23FF8100'/%3E%3Cpath d='M70 25L60 35L50 25L40 35L40 15' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      zIndex: 5
    }}
  />
);

// Hot Event Card - Extends EventCard with hot badge
const HotEventCard = ({ event }) => {
  return (
    <EventCard 
      event={event} 
      displayPriceInEuros={true}
    />
  );
};

const DiscoverPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [hotEvents, setHotEvents] = useState([]); 
  const [unmissableEvents, setUnmissableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef(null);
  const searchResultsRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const eventsPerSlide = isMobile ? 1 : 3; // Show 3 cards on big screens, 1 on mobile
  
  // Pagination state for "Explore More Events" section
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalEvents, setTotalEvents] = useState(0);
  const [exploreEvents, setExploreEvents] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const exploreContainerRef = useRef(null);

  // Use the categories from our unified config including counts
  const categories = UI_CATEGORIES.map(category => ({
    ...category,
    count: 0, // Initialize count to 0, could be updated with actual counts if needed
    title: category.title,
    image: category.image
  }));

  // Illustrations for discover banner
  const illustrations = [
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop', // Concert/festival
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1470&auto=format&fit=crop', // People dancing
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1470&auto=format&fit=crop', // Food event
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      
      // Get the query parameters from the URL
      const params = new URLSearchParams(location.search);
      const searchQuery = params.get('q');
      const categoryFilter = params.get('category');
      
      try {
        let response;
        
        // Check if we're searching
        if (searchQuery) {
          setSearchQuery(searchQuery);
          response = await searchEvents(searchQuery);
        } 
        // Check if we're filtering by category
        else if (categoryFilter) {
          setActiveCategory(categoryFilter);
          // Find the selected category object
          const selectedCategory = categories.find(cat => cat.id === categoryFilter);
          
          // Use the backend category name from our mapping
          const backendCategory = selectedCategory?.backendCategory || categoryFilter;
          
          response = await getEvents({ category: backendCategory });
        }
        // Check if we're filtering for featured events
        else if (params.has('featured')) {
          response = await getFeaturedEvents(12);
        }
        // Check if we're filtering for hot events
        else if (params.has('hot')) {
          response = await getHotEvents(12);
        }
        // Check if we're filtering for unmissable events
        else if (params.has('unmissable')) {
          response = await getUnmissableEvents(12);
        }
        // Default: Get all events
        else {
          response = await getEvents();
        }
        
        if (response.success && response.data) {
          const eventsData = response.data.data || [];
          if (Array.isArray(eventsData)) {
            setEvents(eventsData);
          } else {
            console.error('Invalid data format:', eventsData);
            setError('The server returned invalid data');
          }
        } else {
          console.error('Request failed:', response);
          setError('Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to fetch all types of special events
    const fetchSpecialEvents = async () => {
      try {
        console.log('Fetching special events...');
        
        // Get featured events
        const featuredResponse = await getFeaturedEvents();
        console.log('Featured response:', featuredResponse);
        
        if (featuredResponse.success && featuredResponse.data) {
          const featuredData = featuredResponse.data.data || [];
          console.log('Featured data:', featuredData);
          
          if (Array.isArray(featuredData) && featuredData.length > 0) {
            setFeaturedEvents(featuredData);
            console.log(`${featuredData.length} featured events loaded successfully`);
          } else {
            console.log('No featured events found or invalid data format');
          }
        }
        
        // Get hot events
        const hotResponse = await getHotEvents();
        console.log('Hot response:', hotResponse);
        
        if (hotResponse.success && hotResponse.data) {
          const hotData = hotResponse.data.data || [];
          console.log('Hot data:', hotData);
          
          if (Array.isArray(hotData) && hotData.length > 0) {
            setHotEvents(hotData);
            console.log(`${hotData.length} hot events loaded successfully`);
          } else {
            console.log('No hot events found or invalid data format');
          }
        }
        
        // Get unmissable events
        const unmissableResponse = await getUnmissableEvents();
        console.log('Unmissable response:', unmissableResponse);
        
        if (unmissableResponse.success && unmissableResponse.data) {
          const unmissableData = unmissableResponse.data.data || [];
          console.log('Unmissable data:', unmissableData, 'Total length:', unmissableData.length);
          
          if (Array.isArray(unmissableData) && unmissableData.length > 0) {
            setUnmissableEvents(unmissableData);
            console.log(`${unmissableData.length} unmissable events loaded successfully`);
          } else {
            console.log('No unmissable events found or invalid data format');
          }
        }
      } catch (error) {
        console.error('Error fetching special events:', error);
        // Don't set the main error state, as we still have the main events
      }
    };

    // First fetch the main events based on URL parameters
    fetchEvents();
    
    // Then fetch all special events for their respective sections
    fetchSpecialEvents();
  }, [location.search]);

  // Simple carousel navigation
  const nextSlide = () => {
    const maxSlide = Math.ceil(unmissableEvents.length / eventsPerSlide) - 1;
    if (currentSlide < maxSlide) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    const maxSlide = Math.ceil(unmissableEvents.length / eventsPerSlide) - 1;
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      setCurrentSlide(maxSlide);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  
  console.log('Unmissable events:', unmissableEvents.length);
  console.log('Events per slide:', eventsPerSlide);
  console.log('Current slide:', currentSlide);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Update URL and navigate to category-filtered view
    navigate(`/discover?category=${category}`);
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };
  
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setLoading(true);
    
    try {
      // Update URL for shareable links, but don't navigate away
      const newUrl = `/discover?q=${encodeURIComponent(query)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
      // Call the search API
      const response = await searchEvents(query);
      
      if (response.success && response.data) {
        const searchResults = response.data.data || [];
        // Update the events list with search results
        setEvents(Array.isArray(searchResults) ? searchResults : []);
        
        // Reset category filter when searching
        setActiveCategory('All');
        
        // Scroll to search results after state update
        setTimeout(() => {
          if (searchResultsRef.current) {
            searchResultsRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      } else {
        console.error('Search failed:', response);
        setError('Failed to search events');
      }
    } catch (err) {
      console.error('Error during search:', err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  // Function to load more events for the "Explore More Events" section
  const loadMoreEvents = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    
    try {
      const response = await getEvents({
        page: page + 1,
        limit: pageSize,
        sort: '-createdAt'
      });
      
      if (response.success && response.data) {
        const newEvents = response.data.data || [];
        if (newEvents.length === 0) {
          setHasMore(false);
        } else {
          setExploreEvents(prev => [...prev, ...newEvents]);
          setPage(prev => prev + 1);
          setTotalEvents(response.data.count || 0);
        }
      } else {
        console.error('Failed to fetch more events:', response);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching more events:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load of explore events
  useEffect(() => {
    const fetchExploreEvents = async () => {
      try {
        const response = await getEvents({
          page: 1,
          limit: pageSize,
          sort: '-createdAt'
        });
        
        if (response.success && response.data) {
          setExploreEvents(response.data.data || []);
          setTotalEvents(response.data.count || 0);
          setHasMore((response.data.data || []).length < (response.data.count || 0));
        } else {
          console.error('Failed to fetch explore events:', response);
        }
      } catch (err) {
        console.error('Error fetching explore events:', err);
      }
    };
    
    fetchExploreEvents();
  }, [pageSize]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{...loadingContainerSx, pt: 8}}>
        <Typography variant="h5" color="text.secondary">Loading amazing events just for you...</Typography>
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

  // Filter events by active category if not "All"
  const filteredEvents = activeCategory === 'All' 
    ? events 
    : events.filter(event => {
        // Get the selected UI category
        const selectedCategory = categories.find(cat => cat.id === activeCategory);
        
        // If there's no match or no backend category, just filter by ID
        if (!selectedCategory || !selectedCategory.backendCategory) {
          return event.category === activeCategory;
        }
        
        // Otherwise, filter by the backend category name
        return event.category === selectedCategory.backendCategory;
      });

  return (
    <Box>
      {/* Hero Banner with search bar and background */}
      <Box
        sx={{
          width: '100%',
          bgcolor: 'primary.light', 
          py: 6,
          backgroundImage: `linear-gradient(rgba(0, 38, 100, 0.8), rgba(0, 38, 100, 0.8)), url(${illustrations[0]})`,
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
            Discover Amazing Events
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, opacity: 0.9 }}>
            Find unique experiences that match your interests
          </Typography>
          
          <Box sx={{ mb: 3, maxWidth: '700px', mx: 'auto' }}>
            <SearchBar onSearch={handleSearch} />
          </Box>
          
          <Stack 
            direction="row" 
            spacing={1} 
            justifyContent="center" 
            flexWrap="wrap"
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ mr: 1, my: 1 }}>
              Popular searches:
            </Typography>
            {['Music Festival', 'Food Tasting', 'Art Exhibition', 'Beach Party'].map((term, index) => (
              <Chip 
                key={index}
                label={term}
                onClick={() => handleSearch(term)}
                sx={{ 
                  my: 1,
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  }
                }}
              />
            ))}
          </Stack>
          
          <Typography variant="body2" sx={{ fontWeight: 500, opacity: 0.8 }}>
            Trusted by 10,000+ event-goers across the island
          </Typography>
        </Container>
      </Box>

      {/* Featured Swipe Deck - Interactive Tinder-style carousel */}
      <FeaturedSwipeDeck />

      {/* Hot Events Showcase Section - Only show if there are hot events */}
      {hotEvents.length > 0 && (
        <Box sx={{ py: 6, bgcolor: 'rgba(255, 129, 0, 0.05)', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <EnhancedSectionHeader 
              title="🔥 Hot Right Now" 
              subtitle="These events are trending fast, Grab a ticket before they vanish"
              align="left"
            />
            <FeaturedEventShowcase featuredEvents={hotEvents} />
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
              subtitle={`Handpicked by locals who know the island best (${unmissableEvents.length} events)`}
              align="left"
            />
            <ViewAllButton 
              endIcon={<ArrowForwardIcon />}
              component={RouterLink}
              to="/discover?unmissable=true"
            >
              View All
            </ViewAllButton>
            
            <Box sx={{
              position: 'relative',
              width: '100%',
              mt: 1
            }}>
              {/* Carousel container */}
              <Box sx={{ 
                position: 'relative', 
                overflow: 'hidden',
                borderRadius: 1,
                mx: { xs: 3, md: 5 },
                my: 2
              }}>
                <Box sx={{ 
                  display: 'flex',
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: 'transform 0.5s ease-in-out',
                  width: '100%'
                }}>
                  {Array.from({ length: Math.ceil(unmissableEvents.length / eventsPerSlide) }).map((_, slideIndex) => (
                    <Box 
                      key={`slide-${slideIndex}`}
                      sx={{ 
                        minWidth: '100%',
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'center'
                      }}
                    >
                      {unmissableEvents
                        .slice(slideIndex * eventsPerSlide, (slideIndex + 1) * eventsPerSlide)
                        .map((event, idx) => (
                          <Box 
                            key={`event-${event._id || idx}`}
                            sx={{ 
                              flex: 1,
                              maxWidth: `${100 / eventsPerSlide}%`
                            }}
                          >
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
                          </Box>
                        ))}
                    </Box>
                  ))}
                </Box>

                {/* Navigation buttons */}
                <IconButton
                  onClick={prevSlide}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { backgroundColor: 'grey.200' },
                    zIndex: 2
                  }}
                >
                  <KeyboardArrowLeft />
                </IconButton>

                <IconButton
                  onClick={nextSlide}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { backgroundColor: 'grey.200' },
                    zIndex: 2
                  }}
                >
                  <KeyboardArrowRight />
                </IconButton>
              </Box>

              {/* Slide indicators */}
              {Math.ceil(unmissableEvents.length / eventsPerSlide) > 1 && (
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 1
                }}>
                  {Array.from({ length: Math.ceil(unmissableEvents.length / eventsPerSlide) }).map((_, index) => (
                    <Box
                      key={`indicator-${index}`}
                      onClick={() => goToSlide(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: index === currentSlide ? 'primary.main' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Section>
        )}

        {/* All Events / Search Results Section */}
        <Section ref={searchResultsRef}>
          <EnhancedSectionHeader 
            title={searchQuery ? `Search results for "${searchQuery}"` : "All Events"} 
            subtitle="Explore all upcoming events"
            align="left"
          />
          
          {filteredEvents.length === 0 ? (
            <Typography variant="body1" sx={emptyEventsSx}>
              No events found. Try selecting a different category or search term.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredEvents.map(event => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={event._id || event.id}>
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
              Explore More Events
            </LumeButton>
          </Box>
        </Section>
      </Container>

      {/* Explore More Events Section - Full width with different background */}
      <Box sx={{ 
        bgcolor: 'rgba(0, 38, 100, 0.03)', 
        py: 6, 
        borderTop: '1px solid rgba(0, 38, 100, 0.1)',
        pb: 8
      }}>
        <Container maxWidth="lg" ref={exploreContainerRef}>
          <EnhancedSectionHeader 
            title="🧾 Explore More Events" 
            subtitle="Discover events that match your interests"
            align="left"
          />
          
          <Grid container spacing={3}>
            {exploreEvents.map((event, index) => (
              <Grid 
                item 
                xs={12} 
                sm={isTablet ? 6 : 4} 
                md={4} 
                key={event._id || event.id}
                sx={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: `fadeSlideIn 0.5s ease forwards ${index * 0.1}s`,
                  '@keyframes fadeSlideIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(20px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardActionArea onClick={() => handleEventClick(event._id || event.id)}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={formatImageUrl(event.image)}
                        alt={event.title}
                      />
                      <Chip 
                        label={event.category} 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          left: 12,
                          backgroundColor: getCategoryColor(event.category),
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }} 
                      />
                    </Box>
                  </CardActionArea>
                  
                  <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3,
                        height: '2.6em'
                      }}
                    >
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                      <Box component="span" sx={{ 
                        fontSize: '0.8rem', 
                        px: 1, 
                        py: 0.3, 
                        bgcolor: 'rgba(255,129,0,0.1)', 
                        color: 'primary.main',
                        borderRadius: 1,
                        mr: 1,
                        fontWeight: 500
                      }}>
                        {moment(event.startDateTime).format('MMM D')}
                      </Box>
                      <Typography variant="body2" noWrap>
                        {moment(event.startDateTime).format('h:mm A')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {event.venue}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      mt: 'auto', 
                      pt: 1, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      borderTop: '1px solid', 
                      borderColor: 'divider' 
                    }}>
                      <Button 
                        startIcon={<BookmarkBorderIcon />} 
                        size="small" 
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add save functionality here
                          console.log('Save event:', event._id);
                        }}
                      >
                        Save
                      </Button>
                      
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event._id || event.id}`);
                        }}
                        sx={{ minWidth: 75 }}
                      >
                        {event.price > 0 ? 'Buy' : 'RSVP'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={loadMoreEvents}
                disabled={loadingMore}
                sx={{ 
                  px: 4, 
                  py: 1,
                  borderRadius: 8,
                  '&:hover': {
                    backgroundColor: 'rgba(255,129,0,0.08)'
                  }
                }}
              >
                {loadingMore ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Load More Events'
                )}
              </Button>
            </Box>
          )}
          
          {!hasMore && exploreEvents.length > 0 && (
            <Typography 
              variant="body2" 
              align="center" 
              color="text.secondary"
              sx={{ mt: 4 }}
            >
              You've reached the end of the list.
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default DiscoverPage; 