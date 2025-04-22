import React from 'react';
import { Card, Box, Typography, CardContent, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import moment from 'moment';
import { formatImageUrl, formatCurrency } from '../../utils/helpers';
import { COLORS } from '../../styles';

const EventCardSwiper = ({ event, getCategoryColor }) => {
  return (
    <Card
      sx={{
        width: '90vw',
        maxWidth: '400px',
        height: '65vh',
        maxHeight: '600px',
        position: 'relative',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundImage: `url(${formatImageUrl(event.image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.01)',
        },
      }}
    >
      {/* Gradient overlay at the bottom for better text readability */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)',
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Chip
            label="Featured"
            sx={{
              bgcolor: COLORS.ORANGE_MAIN,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </Box>
        
        <CardContent sx={{ p: 0, color: 'white' }}>
          <Typography variant="h5" component="h2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            {event.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: '1rem', mr: 1 }} />
            <Typography variant="body2">
              {moment(event.startDateTime).format('MMM DD, YYYY • h:mm A')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOnIcon sx={{ fontSize: '1rem', mr: 1 }} />
            <Typography variant="body2" noWrap>
              {event.venue}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip
              label={event.category}
              size="small"
              sx={{
                backgroundColor: getCategoryColor(event.category),
                color: 'white',
              }}
            />
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 'bold',
                color: event.price === 0 ? '#4caf50' : 'white'
              }}
            >
              {formatCurrency(event.price)}
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ mt: 2, opacity: 0.8, textAlign: 'center', fontStyle: 'italic' }}
          >
            Tap for details • Swipe right to save
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default EventCardSwiper; 