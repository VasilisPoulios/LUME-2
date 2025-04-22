import { useState } from 'react';
import { Paper, InputBase, IconButton, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: '2px 12px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: 50,
  backgroundColor: alpha('#fff', 0.2),
  backdropFilter: 'blur(8px)',
  boxShadow: 'none',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  '&:hover': {
    backgroundColor: alpha('#fff', 0.25),
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.08)',
  },
  width: '100%',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  color: '#fff',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.8)',
      opacity: 1,
    },
  },
}));

const SearchBar = ({ 
  placeholder = 'What are you looking for?',
  value = '',
  onChange,
  onSubmit,
  maxWidth,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState(value);

  const handleChange = (e) => {
    setSearchValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(searchValue);
    }
  };

  return (
    <SearchContainer 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ maxWidth: maxWidth || '100%', ...props.sx }}
      {...props}
    >
      <StyledInputBase
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        fullWidth
        inputProps={{ 'aria-label': 'search' }}
      />
      <IconButton 
        type="submit" 
        aria-label="search"
        sx={{ color: 'white' }}
        edge="end"
      >
        <SearchIcon />
      </IconButton>
    </SearchContainer>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sx: PropTypes.object,
};

export default SearchBar; 