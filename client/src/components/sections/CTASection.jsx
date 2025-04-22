import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { LumeButton } from '../ui';
import { COLORS } from '../../styles';

const CTAContainer = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.ORANGE_MAIN,
  padding: theme.spacing(8, 0),
  color: '#fff',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6, 0),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(5, 0),
  },
}));

const CTAHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
    marginBottom: theme.spacing(2),
  },
}));

const CTAText = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  maxWidth: '700px',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.95rem',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(0, 2),
  },
}));

const ButtonWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '220px',
    height: '70px',
    borderRadius: '50px',
    background: 'rgba(255, 255, 255, 0.15)',
    filter: 'blur(15px)',
    zIndex: 0,
  }
}));

const CTASection = ({ 
  heading = "Ready to create memories that last a lifetime?", 
  text = "Discover extraordinary events that will turn moments into memories. From breathtaking concerts to authentic local experiences, LUME is your gateway to the best events in Rhodes.",
  buttonText = "Start Your Journey",
  buttonLink = "/discover"
}) => {
  return (
    <CTAContainer>
      <Container maxWidth="lg">
        <CTAHeading variant="h3">
          {heading}
        </CTAHeading>
        <CTAText variant="body1">
          {text}
        </CTAText>
        <ButtonWrapper>
          <LumeButton
            variant="contained"
            component={RouterLink}
            to={buttonLink}
            size="large"
            sx={{
              backgroundColor: COLORS.ORANGE_DARK,
              color: '#FFFFFF',
              fontWeight: 700,
              padding: '14px 38px',
              fontSize: '1.1rem',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
              border: '3px solid rgba(255,255,255,0.9)',
              position: 'relative',
              zIndex: 1,
              letterSpacing: '0.5px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: COLORS.ORANGE_MAIN,
                color: '#FFFFFF',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            {buttonText}
          </LumeButton>
        </ButtonWrapper>
      </Container>
    </CTAContainer>
  );
};

export default CTASection; 