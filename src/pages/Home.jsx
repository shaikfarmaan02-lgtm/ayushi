import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import MedicationIcon from '@mui/icons-material/Medication';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const features = [
    {
      title: "Virtual Consultations",
      description: "Connect with doctors through high-definition video calls from the comfort of your home.",
      icon: <VideocamIcon fontSize="large" color="primary" />,
      link: "/login"
    },
    {
      title: "AI Pharmacist Assistant",
      description: "Get instant answers about medications, side effects, and dosage information.",
      icon: <SmartToyIcon fontSize="large" color="primary" />,
      link: "/login"
    },
    {
      title: "E-Prescriptions",
      description: "Receive and manage digital prescriptions securely without paper hassles.",
      icon: <MedicationIcon fontSize="large" color="primary" />,
      link: "/login"
    },
    {
      title: "Easy Scheduling",
      description: "Book, reschedule, or cancel appointments with just a few clicks.",
      icon: <CalendarMonthIcon fontSize="large" color="primary" />,
      link: "/login"
    },
    {
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security and encryption.",
      icon: <SecurityIcon fontSize="large" color="primary" />,
      link: "/login"
    },
    {
      title: "24/7 Availability",
      description: "Access healthcare services anytime, anywhere with our always-on platform.",
      icon: <AccessTimeIcon fontSize="large" color="primary" />,
      link: "/login"
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{
          position: 'relative',
          backgroundColor: 'primary.main',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3 }}>
                <Typography 
                  component="h1" 
                  variant="h2" 
                  color="inherit" 
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  Ayushi
                </Typography>
                <Typography 
                  variant="h5" 
                  color="inherit" 
                  paragraph
                  sx={{ mb: 4 }}
                >
                  AI-Powered Online Medical System for virtual consultations and prescription management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    component={Link}
                    to="/register"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="large"
                    component={Link}
                    to="/login"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="large"
                    component={Link}
                    to="/features"
                  >
                    View Features
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  display: { xs: 'none', md: 'block' },
                  p: 3,
                  textAlign: 'center'
                }}
              >
                {/* Placeholder for hero image */}
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 350, 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h4" color="white">
                    Virtual Healthcare
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Our Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Ayushi combines cutting-edge technology with healthcare expertise to provide a seamless telemedicine experience.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" align="center">
                    {feature.title}
                  </Typography>
                  <Typography align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    to={feature.link}
                  >
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h1" color="primary" sx={{ mb: 2 }}>1</Typography>
                <Typography variant="h5" gutterBottom>Register & Login</Typography>
                <Typography>
                  Create your account as a patient, doctor, or pharmacist and log in to access your personalized dashboard.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h1" color="primary" sx={{ mb: 2 }}>2</Typography>
                <Typography variant="h5" gutterBottom>Book Appointments</Typography>
                <Typography>
                  Schedule virtual consultations with healthcare providers based on their availability.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h1" color="primary" sx={{ mb: 2 }}>3</Typography>
                <Typography variant="h5" gutterBottom>Consult & Get Care</Typography>
                <Typography>
                  Connect through video calls, receive e-prescriptions, and get medication guidance from our AI Pharmacist.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          bgcolor: 'secondary.main', 
          color: 'white', 
          py: 6,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Ready to experience the future of healthcare?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Join thousands of patients and healthcare providers on Ayushi today.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component={Link}
            to="/register"
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;