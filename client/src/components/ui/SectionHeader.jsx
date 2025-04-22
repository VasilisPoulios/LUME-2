import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const HeaderContainer = styled(Box)(({ theme, align }) => ({
  marginBottom: theme.spacing(4),
  textAlign: align || 'left',
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '40px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  maxWidth: '800px',
  margin: align => align === 'center' ? '0 auto' : '0',
}));

const SectionHeader = ({
  title,
  subtitle,
  align = 'left',
  ...props
}) => {
  return (
    <HeaderContainer align={align} {...props}>
      <Title 
        variant="h5" 
        component="h2"
        sx={{
          '&::after': {
            left: align === 'center' ? 'calc(50% - 20px)' : 0,
          },
        }}
      >
        {title}
      </Title>
      {subtitle && (
        <Subtitle variant="body1" align={align}>
          {subtitle}
        </Subtitle>
      )}
    </HeaderContainer>
  );
};

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right']),
};

export default SectionHeader; 