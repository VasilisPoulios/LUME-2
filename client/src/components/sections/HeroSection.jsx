import { Box, Typography, Container } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { SearchBar, LumeButton, StatsBar } from '../ui';
import { useNavigate } from 'react-router-dom';
import {
  HeroContainer,
  MainHeading,
  SubHeading,
  CaptionText,
  SearchWrapper,
  StatsWrapper,
  heroContainerSx,
  searchBarSx,
  discoverButtonSx,
  statsBarSx
} from '../../styles';

const HeroSection = () => {
  const navigate = useNavigate();
  
  const handleSearch = (searchTerm) => {
    if (searchTerm && searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      navigate(`/discover?q=${encodeURIComponent(searchTerm.trim())}&scroll=true`);
    } else {
      // If search is empty, just navigate to discover page
      navigate('/discover');
    }
  };
  
  const handleDiscoverClick = () => {
    navigate('/discover');
  };

  const statsItems = [
    { 
      icon: <EventIcon />, 
      primary: '200+ Events This Month', 
      secondary: '' 
    },
    { 
      icon: <UpdateIcon />, 
      primary: 'Updated Daily', 
      secondary: '' 
    },
    { 
      icon: <LocationOnIcon />, 
      primary: 'Island-wide Coverage', 
      secondary: '' 
    },
  ];

  return (
    <HeroContainer sx={{ pt: 8 }}>
      <Container 
        maxWidth="lg" 
        sx={heroContainerSx}
      >
        <MainHeading variant="h1">
          LUME
        </MainHeading>
        
        <SubHeading variant="h2">
          What will you discover in Rhodes today?
        </SubHeading>
        
        <CaptionText variant="body1">
          From hidden beach parties to cultural festivals, experience 
          the island's most vibrant events
        </CaptionText>
        
        <SearchWrapper>
          <SearchBar 
            placeholder="Search for events, venues, or categories..." 
            onSubmit={handleSearch}
            sx={searchBarSx}
          />
          <LumeButton 
            variant="contained"
            sx={discoverButtonSx}
            onClick={handleDiscoverClick}
          >
            Discover Now
          </LumeButton>
        </SearchWrapper>
        
        <StatsWrapper>
          <StatsBar 
            stats={statsItems} 
            sx={statsBarSx}
          />
        </StatsWrapper>
      </Container>
    </HeroContainer>
  );
};

export default HeroSection; 