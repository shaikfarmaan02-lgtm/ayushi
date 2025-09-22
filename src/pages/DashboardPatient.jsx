import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, Container, Typography, Grid, Card, CardContent, 
  Button, Tabs, Tab, Paper, Divider, Avatar, Chip,
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { 
  CalendarMonth, VideoCall, MedicalServices, 
  Notifications, AccessTime, Add, MoreVert, Analytics,
  Person, Medication
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import ChatBotAyushi from '../components/ChatBotAyushi';
import PrescriptionAnalytics from '../components/PrescriptionAnalytics';
import AnimatedCard from '../components/AnimatedCard';

// Mock data for appointments
const MOCK_APPOINTMENTS = [
  { 
    id: 1, 
    doctorName: 'Dr. Sarah Johnson', 
    specialty: 'Cardiologist',
    date: '2023-06-15', 
    time: '10:00 AM', 
    status: 'upcoming',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  { 
    id: 2, 
    doctorName: 'Dr. Michael Chen', 
    specialty: 'Dermatologist',
    date: '2023-06-20', 
    time: '2:30 PM', 
    status: 'upcoming',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  { 
    id: 3, 
    doctorName: 'Dr. Emily Rodriguez', 
    specialty: 'General Physician',
    date: '2023-05-30', 
    time: '11:15 AM', 
    status: 'completed',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  }
];

// Mock data for prescriptions
const MOCK_PRESCRIPTIONS = [
  {
    id: 101,
    doctorName: 'Dr. Emily Rodriguez',
    date: '2023-05-30',
    medications: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: 'For pain' }
    ],
    status: 'active'
  }
];

function DashboardPatient() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);
  const user = useSelector(state => state.auth.user);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar 
              sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
              alt={user?.name || 'Patient'}
              src={user?.avatar}
            >
              {user?.name?.charAt(0) || 'P'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, {user?.name || 'Patient'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your health is our priority. How can we help you today?
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              component={Link}
              to="/book-appointment"
            >
              Book Appointment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <CalendarMonth sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" align="center" gutterBottom>Appointments</Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
              Schedule or manage your appointments
            </Typography>
            <Button variant="outlined" size="small" component={Link} to="/book-appointment">
              Book Now
            </Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <VideoCall sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" align="center" gutterBottom>Video Consult</Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
              Connect with your doctor virtually
            </Typography>
            <Button variant="outlined" size="small" component={Link} to="/video-consultations">
              Join Call
            </Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <MedicalServices sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" align="center" gutterBottom>Prescriptions</Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
              View and manage your prescriptions
            </Typography>
            <Button variant="outlined" size="small" component={Link} to="/prescriptions">
              View All
            </Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 2,
              bgcolor: 'secondary.light',
              cursor: 'pointer'
            }}
            onClick={toggleChatbot}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main', mb: 1 }}>A</Avatar>
            <Typography variant="h6" align="center" gutterBottom>Ayushi Bot</Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
              Get medication guidance and reminders
            </Typography>
            <Button variant="contained" color="secondary" size="small" onClick={toggleChatbot}>
              Ask Ayushi
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Appointments" 
            icon={<CalendarMonth />} 
            iconPosition="start"
          />
          <Tab label="Prescriptions" icon={<Medication />} iconPosition="start" />
          <Tab label="Medical Records" icon={<MedicalServices />} iconPosition="start" />
          <Tab label="Prescription Analytics" icon={<Analytics />} iconPosition="start" />

        {/* Upcoming Appointments Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Your Appointments</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<Add />}
                component={Link}
                to="/book-appointment"
              >
                New Appointment
              </Button>
            </Box>
            <List>
              {MOCK_APPOINTMENTS.filter(apt => apt.status === 'upcoming').map((appointment) => (
                <Paper key={appointment.id} elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={appointment.avatar} alt={appointment.doctorName} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="span" fontWeight="bold">
                          {appointment.doctorName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {appointment.specialty}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <CalendarMonth fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                              {new Date(appointment.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.time}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        startIcon={<VideoCall />}
                        sx={{ mr: 1 }}
                        component={Link}
                        to={`/video-consultation/${appointment.id}`}
                      >
                        Join
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        size="small" 
                        onClick={() => navigate(`/video-consultation/${appointment.id}`)}
                        sx={{ mr: 1 }}
                      >
                        Join Video Call
                      </Button>
                      <IconButton edge="end">
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              ))}
              {MOCK_APPOINTMENTS.filter(apt => apt.status === 'upcoming').length === 0 && (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No upcoming appointments. Book a consultation with a doctor.
                </Typography>
              )}
            </List>
          </Box>
        )}

        {/* Prescriptions Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Active Prescriptions</Typography>
            {MOCK_PRESCRIPTIONS.map((prescription) => (
              <Paper key={prescription.id} elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {prescription.doctorName}
                  </Typography>
                  <Chip 
                    label="Active" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Prescribed on: {new Date(prescription.date).toLocaleDateString()}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                  Medications:
                </Typography>
                <List dense>
                  {prescription.medications.map((med, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={`${med.name} - ${med.dosage}`}
                        secondary={`${med.frequency}, ${med.duration}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button 
                    size="small" 
                    onClick={toggleChatbot}
                    sx={{ mr: 1 }}
                  >
                    Ask Ayushi
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    component={Link}
                    to={`/prescriptions/${prescription.id}`}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            ))}
            {MOCK_PRESCRIPTIONS.length === 0 && (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No active prescriptions found.
              </Typography>
            )}
          </Box>
        )}

        {/* Medical Records Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Your Medical Records</Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No medical records available. Upload your medical documents for better care.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                component={Link}
                to="/upload-records"
              >
                Upload Records
              </Button>
            </Box>
          </Box>
        )}

        {/* Prescription Analytics Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <PrescriptionAnalytics />
          </Box>
        )}
      </Paper>

      {/* Ayushi Chatbot */}
      {showChatbot && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 350,
            height: 500,
            zIndex: 1000,
            boxShadow: 10,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <ChatBotAyushi onClose={toggleChatbot} />
        </Box>
      )}

      {/* SOS Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          color="error"
          size="large"
          sx={{ 
            borderRadius: '50%', 
            width: 64, 
            height: 64, 
            fontWeight: 'bold',
            boxShadow: 3
          }}
        >
          SOS
        </Button>
      </Box>
    </Container>
  );
}

export default DashboardPatient;