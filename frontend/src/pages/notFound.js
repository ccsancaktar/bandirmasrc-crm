import React from 'react';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h3">404 - Sayfa Bulunamadı</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/')}
        style={{ marginTop: '20px' }}
      >
        Ana Sayfaya Dön
      </Button>
    </div>
  );
};

export default NotFound;