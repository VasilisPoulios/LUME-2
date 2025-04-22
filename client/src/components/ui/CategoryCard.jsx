import { Card, CardMedia, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'transform 0.3s ease',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.shadows[2],
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme.shadows[6],
  },
  '&:hover .overlay': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  '&:hover .categoryTitle': {
    transform: 'translateY(-4px)',
  },
}));

const CardOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: theme.spacing(2),
  transition: 'background-color 0.3s ease',
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 700,
  textShadow: '0px 2px 4px rgba(0, 0, 0, 0.4)',
  transition: 'transform 0.3s ease',
  marginBottom: theme.spacing(1),
}));

const CategoryCount = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: 500,
  fontSize: '0.875rem',
}));

const CategoryCard = ({
  title,
  image,
  count,
  onClick,
  ...props
}) => {
  return (
    <StyledCard onClick={onClick} {...props}>
      <StyledCardMedia
        component="img"
        image={image || `https://source.unsplash.com/random/?${title.toLowerCase()}`}
        alt={title}
      />
      <CardOverlay className="overlay">
        <CategoryTitle variant="h5" component="h3" className="categoryTitle">
          {title}
        </CategoryTitle>
        {count !== undefined && (
          <CategoryCount>
            {count} {count === 1 ? 'Event' : 'Events'}
          </CategoryCount>
        )}
      </CardOverlay>
    </StyledCard>
  );
};

CategoryCard.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  count: PropTypes.number,
  onClick: PropTypes.func,
};

export default CategoryCard; 