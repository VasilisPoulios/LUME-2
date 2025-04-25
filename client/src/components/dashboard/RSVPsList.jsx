import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Avatar,
  Button,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Event, LocationOn, CalendarToday, Person, Person as PersonIcon, Close, ConfirmationNumber } from '@mui/icons-material';
import { COLORS } from '../../styles';
import dayjs from 'dayjs';
import { formatImageUrl } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const RSVPsList = ({ rsvps, loading, error }) => {
  const [selectedRSVP, setSelectedRSVP] = useState(null);
  
  const handleOpenRSVP = (rsvp) => {
    setSelectedRSVP(rsvp);
  };
  
  const handleCloseRSVP = () => {
    setSelectedRSVP(null);
  };
  
  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" height={30} width="80%" />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            bgcolor: 'rgba(211, 47, 47, 0.05)', 
            border: '1px solid rgba(211, 47, 47, 0.1)',
            borderRadius: 2
          }}
        >
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!rsvps || rsvps.length === 0) {
    return (
      <Box>
        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
          You haven't RSVPed to any events yet. Browse our free events and RSVP to get started!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/events"
            sx={{ 
              bgcolor: COLORS.ORANGE_MAIN,
              '&:hover': { bgcolor: COLORS.ORANGE_DARK }
            }}
          >
            Browse Events
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {rsvps.map((rsvp) => {
          const event = rsvp.event;
          if (!event) return null;
          
          const eventDate = event.startDateTime 
            ? dayjs(event.startDateTime).format('MMMM D, YYYY • h:mm A')
            : 'Date not available';
          
          const eventLocation = event.venue || 'Location not available';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={rsvp._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  '&:hover': { 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenRSVP(rsvp)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={formatImageUrl(event.image)}
                  alt={event.title}
                  sx={{ objectFit: 'cover' }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5
                  }}
                >
                  <Typography variant="caption" fontWeight={500} color={COLORS.ORANGE_DARK}>
                    {rsvp.quantity} {rsvp.quantity === 1 ? 'guest' : 'guests'}
                  </Typography>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="h6" 
                    component="h3"
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.3,
                      height: '2.6rem'
                    }}
                  >
                    {event.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday fontSize="small" sx={{ color: COLORS.ORANGE_MAIN, mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {eventDate}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn fontSize="small" sx={{ color: COLORS.ORANGE_MAIN, mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {eventLocation}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ color: COLORS.ORANGE_MAIN, mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      RSVPed on {dayjs(rsvp.createdAt).format('MMM D, YYYY')}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button 
                    size="small"
                    component={Link}
                    to={`/events/${event._id}`}
                    sx={{ 
                      color: COLORS.ORANGE_MAIN,
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(255,129,0,0.05)'
                      }
                    }}
                  >
                    View Event
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {/* RSVP Details Dialog */}
      <Dialog 
        open={!!selectedRSVP} 
        onClose={handleCloseRSVP}
        maxWidth="sm"
        fullWidth
      >
        {selectedRSVP && selectedRSVP.event && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              bgcolor: COLORS.ORANGE_LIGHT,
              py: 2
            }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                RSVP Confirmation
              </Typography>
              <IconButton onClick={handleCloseRSVP} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedRSVP.event.title}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <CalendarToday sx={{ color: COLORS.ORANGE_MAIN, mr: 1.5 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedRSVP.event.startDateTime 
                            ? dayjs(selectedRSVP.event.startDateTime).format('dddd, MMMM D, YYYY')
                            : 'Date not available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedRSVP.event.startDateTime 
                            ? dayjs(selectedRSVP.event.startDateTime).format('h:mm A')
                            : ''}
                          {selectedRSVP.event.endDateTime 
                            ? ` - ${dayjs(selectedRSVP.event.endDateTime).format('h:mm A')}`
                            : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <LocationOn sx={{ color: COLORS.ORANGE_MAIN, mr: 1.5 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedRSVP.event.venue || 'Location not available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedRSVP.event.address || ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Person sx={{ color: COLORS.ORANGE_MAIN, mr: 1.5 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Reservation Details
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Name:</strong> {selectedRSVP.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Email:</strong> {selectedRSVP.email}
                      </Typography>
                      {selectedRSVP.phone && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Phone:</strong> {selectedRSVP.phone}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Number of Guests:</strong> {selectedRSVP.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Reserved on:</strong> {dayjs(selectedRSVP.createdAt).format('MMMM D, YYYY')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: COLORS.ORANGE_LIGHT,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ConfirmationNumber sx={{ color: COLORS.ORANGE_MAIN, mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Confirmation ID
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      RSVP-{selectedRSVP._id.substring(0, 8).toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Show this to the event organizer when you arrive
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={handleCloseRSVP} sx={{ color: COLORS.SLATE }}>
                Close
              </Button>
              <Button 
                component={Link}
                to={`/events/${selectedRSVP.event._id}`}
                variant="contained"
                sx={{ 
                  bgcolor: COLORS.ORANGE_MAIN,
                  '&:hover': { bgcolor: COLORS.ORANGE_DARK }
                }}
              >
                View Event
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RSVPsList;