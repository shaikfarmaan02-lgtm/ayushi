import React from 'react';
import { Container, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FeatureDescription from '../components/FeatureDescription';

const Features = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mb: 4 }}
        >
          Back to Home
        </Button>
      </Box>
      <FeatureDescription />
    </Container>
  );
};

export default Features;