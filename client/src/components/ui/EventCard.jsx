import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PropTypes from 'prop-types';
import { formatImageUrl, formatCurrency } from '../../utils/helpers';
import { useState, useEffect } from 'react';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  fontWeight: 500,
  fontSize: '0.75rem',
}));

const EventCard = ({
  image,
  title,
  date,
  location,
  category,
  price,
  onClick,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    // Format the image URL when the component mounts or image prop changes
    try {
      const formattedUrl = formatImageUrl(image);
      setImageUrl(formattedUrl);
      console.debug('EventCard image processing:', { 
        original: image, 
        formatted: formattedUrl,
        title: title
      });
    } catch (err) {
      console.error('Error formatting image URL:', err);
      setImageError(true);
    }
  }, [image, title]);
  
  // Format date if it's a valid date object or string
  const formattedDate = date 
    ? (typeof date === 'string' 
        ? format(new Date(date), 'MMM dd, yyyy') 
        : format(date, 'MMM dd, yyyy'))
    : null;

  // Format price using the utility function
  const formattedPrice = price !== undefined 
    ? formatCurrency(price)
    : null;
  
  // Fallback image URL in case the primary image fails to load
  const fallbackImageUrl = formatImageUrl('/uploads/events/default-event.jpg');

  // Handler for image loading errors
  const handleImageError = () => {
    console.warn('Image failed to load:', { imageUrl, title });
    setImageError(true);
  };

  return (
    <StyledCard onClick={onClick} {...props}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={imageError ? fallbackImageUrl : imageUrl}
          alt={title}
          onError={handleImageError}
          sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
        />
        {category && (
          <CategoryChip 
            label={category} 
            size="small" 
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          noWrap 
          sx={{ 
            mb: 1, 
            fontWeight: 600,
            fontSize: '1.1rem',
          }}
        >
          {title}
        </Typography>
        
        {formattedDate && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 1 }}
          >
            {formattedDate}
          </Typography>
        )}
        
        {location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
          </Box>
        )}
        
        {formattedPrice && (
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 1.5, 
              fontWeight: 'bold',
              color: price === 0 ? 'success.main' : 'text.primary'
            }}
          >
            {formattedPrice}
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
};

EventCard.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  location: PropTypes.string,
  category: PropTypes.string,
  price: PropTypes.number,
  onClick: PropTypes.func,
};

export default EventCard; 