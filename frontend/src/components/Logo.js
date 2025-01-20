import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo = ({ size = 'medium' }) => {
  const sizes = {
    small: {
      height: '40px',
      fontSize: '1.8rem'
    },
    medium: {
      height: '120px',
      fontSize: '3rem'
    },
    large: {
      height: '160px',
      fontSize: '3.5rem'
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 2,
      padding: 2,
      backgroundColor: 'transparent'
    }}>
      <img 
        src="/logo.png" 
        alt="ActiveYou Logo" 
        style={{ 
          height: sizes[size].height,
          objectFit: 'contain',
          filter: 'brightness(1.2) contrast(1.1)',
          maxWidth: '100%',
          marginBottom: '15px'
        }}
      />
      <Typography 
        variant="h1" 
        sx={{ 
          fontSize: sizes[size].fontSize,
          fontWeight: 'bold',
          color: '#DEB887', // Burlywood color
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '2px'
        }}
      >
        ActiveYou
      </Typography>
    </Box>
  );
};

export default Logo; 