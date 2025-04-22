import { useNavigate } from 'react-router-dom';
import { 
  InterestCardContainer,
  InterestCardImage,
  InterestCardOverlay,
  InterestCardTitle,
  InterestCardSubtitle 
} from '../../styles';

const InterestCard = ({ image, title, subtitle, category }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/discover?category=${encodeURIComponent(category || title)}`);
  };

  return (
    <InterestCardContainer onClick={handleCardClick}>
      <InterestCardImage 
        src={image} 
        alt={title} 
      />
      <InterestCardOverlay className="overlay">
        <InterestCardTitle variant="h5" className="title">
          {title}
        </InterestCardTitle>
        <InterestCardSubtitle variant="body2" className="subtitle">
          {subtitle}
        </InterestCardSubtitle>
      </InterestCardOverlay>
    </InterestCardContainer>
  );
};

export default InterestCard; 