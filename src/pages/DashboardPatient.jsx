import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, Container, Typography, Grid, Card, CardContent, 
  Button, Tabs, Tab, Paper, Divider, Avatar, Chip,
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  IconButton, TextField, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Alert, Snackbar, Switch, FormControlLabel,
  CircularProgress, LinearProgress
} from '@mui/material';
import { 
  CalendarMonth, VideoCall, MedicalServices, 
  Notifications, AccessTime, Add, MoreVert, Analytics,
  Person, Medication, CloudUpload, CloudDownload, Delete,
  Favorite, MonitorHeart, LocalHospital, EmergencyShare,
  Settings, DarkMode, Phone, Sms, Email
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { supabase } from '../services/supabase';
import ChatBotAyushi from '../components/ChatBotAyushi';
import PrescriptionAnalytics from '../components/PrescriptionAnalytics';
import AnimatedCard from '../components/AnimatedCard';

// Register Chart.js components
Chart.register(...registerables);

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
  const fileInputRef = useRef(null);
  
  // Health Locker States
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Health Analytics States
  const [healthData, setHealthData] = useState({
    bloodPressure: [
      { date: '2023-01-01', systolic: 120, diastolic: 80 },
      { date: '2023-02-01', systolic: 118, diastolic: 78 },
      { date: '2023-03-01', systolic: 122, diastolic: 82 },
      { date: '2023-04-01', systolic: 119, diastolic: 79 },
      { date: '2023-05-01', systolic: 121, diastolic: 81 },
    ],
    bloodSugar: [
      { date: '2023-01-01', value: 95 },
      { date: '2023-02-01', value: 98 },
      { date: '2023-03-01', value: 92 },
      { date: '2023-04-01', value: 97 },
      { date: '2023-05-01', value: 94 },
    ],
    weight: [
      { date: '2023-01-01', value: 70 },
      { date: '2023-02-01', value: 69.5 },
      { date: '2023-03-01', value: 69 },
      { date: '2023-04-01', value: 68.5 },
      { date: '2023-05-01', value: 68 },
    ]
  });
  
  // Emergency SOS States
  const [sosContacts, setSosContacts] = useState([
    { id: 1, name: 'Emergency Contact 1', phone: '+1234567890', type: 'call' },
    { id: 2, name: 'Emergency Contact 2', phone: '+0987654321', type: 'sms' }
  ]);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'call' });
  const [sosTriggered, setSosTriggered] = useState(false);
  
  // Settings States
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };
  
  // Health Locker Functions
  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      setUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('health_documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Save file reference in database
      const { error: dbError } = await supabase
        .from('patient_files')
        .insert({
          patient_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_at: new Date()
        });
        
      if (dbError) throw dbError;
      
      // Update files list
      setFiles(prev => [...prev, {
        id: Date.now(),
        name: file.name,
        path: filePath,
        type: file.type,
        size: file.size,
        uploaded_at: new Date()
      }]);
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleDownloadFile = async (filePath, fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('health_documents')
        .download(filePath);
        
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const handleDeleteFile = async (filePath, fileId) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('health_documents')
        .remove([filePath]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('patient_files')
        .delete()
        .match({ file_path: filePath });
        
      if (dbError) throw dbError;
      
      // Update state
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  // Emergency SOS Functions
  const handleSosDialogOpen = () => {
    setSosDialogOpen(true);
  };
  
  const handleSosDialogClose = () => {
    setSosDialogOpen(false);
    setNewContact({ name: '', phone: '', type: 'call' });
  };
  
  const handleAddSosContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    
    try {
      // Add to database
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          patient_id: user.id,
          name: newContact.name,
          phone: newContact.phone,
          contact_type: newContact.type
        })
        .select();
        
      if (error) throw error;
      
      // Update state
      setSosContacts(prev => [...prev, {
        id: data[0].id,
        name: newContact.name,
        phone: newContact.phone,
        type: newContact.type
      }]);
      
      handleSosDialogClose();
    } catch (error) {
      console.error('Error adding SOS contact:', error);
    }
  };
  
  const triggerSOS = async () => {
    setSosTriggered(true);
    
    // In a real app, this would trigger API calls to send SMS/make calls
    // For demo purposes, we'll just simulate the process
    setTimeout(() => {
      setSosTriggered(false);
    }, 3000);
  };

  // Load files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('patient_files')
          .select('*')
          .eq('patient_id', user?.id)
          .order('uploaded_at', { ascending: false });
          
        if (error) throw error;
        if (data) setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    
    if (user?.id) {
      fetchFiles();
    }
  }, [user?.id]);

  // Load files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from('patient_files')
            .select('*')
            .eq('patient_id', user.id)
            .order('uploaded_at', { ascending: false });
            
          if (error) throw error;
          if (data) setFiles(data);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    
    fetchFiles();
  }, [user?.id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Emergency SOS Dialog */}
      <Dialog open={sosDialogOpen} onClose={handleSosDialogClose}>
        <DialogTitle>Add Emergency Contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add emergency contacts who will be notified when you trigger an SOS alert.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Contact Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newContact.name}
            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={newContact.phone}
            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newContact.type === 'call'}
                onChange={(e) => setNewContact({...newContact, type: e.target.checked ? 'call' : 'sms'})}
              />
            }
            label={newContact.type === 'call' ? 'Call' : 'SMS'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSosDialogClose}>Cancel</Button>
          <Button onClick={handleAddSosContact} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
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
              color="error" 
              startIcon={<EmergencyShare />}
              onClick={triggerSOS}
              disabled={sosTriggered}
            >
              {sosTriggered ? 'Sending SOS...' : 'Emergency SOS'}
            </Button>
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
              Ask Ayushi - Your personal doctor 
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
          variant="scrollable"
          scrollButtons="auto"
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
          <Tab label="Health Locker" icon={<CloudUpload />} iconPosition="start" />
          <Tab label="Health Analytics" icon={<MonitorHeart />} iconPosition="start" />
          <Tab label="Emergency SOS" icon={<EmergencyShare />} iconPosition="start" />
          <Tab label="Settings" icon={<Settings />} iconPosition="start" />

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