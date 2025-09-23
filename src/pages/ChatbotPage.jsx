import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AIChatbot from '../components/AIChatbot';

const ChatbotPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 120px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ height: '100%' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h4" gutterBottom>
            AI Health Assistant
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Ask questions about your health, appointments, medications, or get general medical information.
            Your conversation history is securely stored and your medical context is used to provide personalized responses.
          </Typography>
          
          <Paper 
            elevation={3} 
            sx={{ 
              flexGrow: 1, 
              borderRadius: 3, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <AIChatbot />
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default ChatbotPage;