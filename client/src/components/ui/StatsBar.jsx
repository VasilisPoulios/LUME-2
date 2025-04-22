import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const StatsItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 1.5),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
}));

const StatsText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

const StatsBar = ({
  stats = [
    { icon: <EventIcon />, primary: '200+ Events', secondary: 'To choose from' },
    { icon: <UpdateIcon />, primary: 'Updated Daily', secondary: 'Latest events' },
    { icon: <LocationOnIcon />, primary: 'Island-wide', secondary: 'Events all over' },
  ],
  variant = 'default',
  ...props
}) => {
  // Different styling based on variant
  const isPaper = variant === 'paper';

  return (
    <Container component={isPaper ? Paper : 'div'} elevation={isPaper ? 1 : 0} {...props}>
      <Grid container sx={{ py: isPaper ? 2 : 0 }}>
        {stats.map((stat, index) => (
          <Grid key={index} sx={{ display: 'flex' }}>
            <StatsItem>
              <IconWrapper>
                {stat.icon}
              </IconWrapper>
              <StatsText>
                <Typography variant="subtitle1" fontWeight="600">
                  {stat.primary}
                </Typography>
                {stat.secondary && (
                  <Typography variant="body2" color="text.secondary">
                    {stat.secondary}
                  </Typography>
                )}
              </StatsText>
            </StatsItem>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

StatsBar.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      primary: PropTypes.string.isRequired,
      secondary: PropTypes.string,
    })
  ),
  variant: PropTypes.oneOf(['default', 'paper']),
};

export default StatsBar; 