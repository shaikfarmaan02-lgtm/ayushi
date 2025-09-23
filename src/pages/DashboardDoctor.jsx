import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, Container, Typography, Grid, Card, CardContent, 
  Button, Tabs, Tab, Paper, Divider, Avatar, Chip,
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  IconButton, TextField, Badge, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, InputLabel, Select, MenuItem, TextareaAutosize,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, FormControlLabel
} from '@mui/material';
import { 
  CalendarMonth, VideoCall, MedicalServices, 
  Notifications, AccessTime, Add, MoreVert, Edit,
  CheckCircle, Cancel, Search, Analytics, Person, 
  Assignment, History, Settings, Download, Print,
  Star, StarBorder, Favorite, Timeline, BarChart
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { supabase } from '../services/supabase';

// Register Chart.js components
Chart.register(...registerables);

// Mock data for appointments
const MOCK_APPOINTMENTS = [
  { 
    id: 1, 
    patientName: 'John Smith', 
    age: 45,
    reason: 'Chest pain and shortness of breath',
    date: '2023-06-15', 
    time: '10:00 AM', 
    status: 'upcoming',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg'
  },
  { 
    id: 2, 
    patientName: 'Emma Wilson', 
    age: 32,
    reason: 'Skin rash and itching',
    date: '2023-06-15', 
    time: '11:30 AM', 
    status: 'upcoming',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  { 
    id: 3, 
    patientName: 'Robert Johnson', 
    age: 58,
    reason: 'Follow-up for hypertension',
    date: '2023-06-15', 
    time: '2:15 PM', 
    status: 'upcoming',
    avatar: 'https://randomuser.me/api/portraits/men/68.jpg'
  },
  { 
    id: 4, 
    patientName: 'Sophia Garcia', 
    age: 28,
    reason: 'Migraine headaches',
    date: '2023-06-16', 
    time: '9:45 AM', 
    status: 'upcoming',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  }
];

// Mock data for patients
const MOCK_PATIENTS = [
  {
    id: 101,
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    lastVisit: '2023-05-10',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg'
  },
  {
    id: 102,
    name: 'Emma Wilson',
    age: 32,
    gender: 'Female',
    lastVisit: '2023-06-01',
    conditions: ['Eczema', 'Allergic Rhinitis'],
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    id: 103,
    name: 'Robert Johnson',
    age: 58,
    gender: 'Male',
    lastVisit: '2023-05-25',
    conditions: ['Hypertension', 'Hyperlipidemia'],
    avatar: 'https://randomuser.me/api/portraits/men/68.jpg'
  }
];

function DashboardDoctor() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useSelector(state => state.auth.user);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistoryOpen, setPatientHistoryOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [prescription, setPrescription] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    notes: ''
  });
  const [availabilitySettings, setAvailabilitySettings] = useState({
    monday: { available: true, start: '09:00', end: '17:00' },
    tuesday: { available: true, start: '09:00', end: '17:00' },
    wednesday: { available: true, start: '09:00', end: '17:00' },
    thursday: { available: true, start: '09:00', end: '17:00' },
    friday: { available: true, start: '09:00', end: '17:00' },
    saturday: { available: false, start: '09:00', end: '13:00' },
    sunday: { available: false, start: '09:00', end: '13:00' },
  });
  const [darkMode, setDarkMode] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    patientCount: 128,
    appointmentsThisMonth: 45,
    prescriptionsWritten: 67,
    averageRating: 4.8,
    patientFeedback: [
      { id: 1, patient: 'John S.', rating: 5, comment: 'Excellent care and attention to detail.' },
      { id: 2, patient: 'Emma W.', rating: 5, comment: 'Very thorough and explains everything clearly.' },
      { id: 3, patient: 'Robert J.', rating: 4, comment: 'Good doctor, but wait times can be long.' }
    ]
  });

  // Fetch doctor data on component mount
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        // In a real app, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('doctor_analytics')
        //   .select('*')
        //   .eq('doctor_id', user.id)
        //   .single();
        
        // if (error) throw error;
        // if (data) setAnalyticsData(data);
        
        // For now, we'll use mock data
        console.log('Doctor dashboard loaded with mock data');
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };

    fetchDoctorData();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientHistoryOpen(true);
  };
  
  const handlePrescriptionDialogOpen = (patient) => {
    setSelectedPatient(patient);
    setPrescription({
      ...prescription,
      patientId: patient.id
    });
    setPrescriptionDialogOpen(true);
  };
  
  const handlePrescriptionChange = (e) => {
    setPrescription({
      ...prescription,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePrescriptionSubmit = async () => {
    try {
      // In a real app, we would save to Supabase
      // const { data, error } = await supabase
      //   .from('prescriptions')
      //   .insert([
      //     { 
      //       doctor_id: user.id,
      //       patient_id: prescription.patientId,
      //       medication: prescription.medication,
      //       dosage: prescription.dosage,
      //       frequency: prescription.frequency,
      //       duration: prescription.duration,
      //       instructions: prescription.instructions,
      //       notes: prescription.notes,
      //       created_at: new Date()
      //     }
      //   ]);
      
      // if (error) throw error;
      
      console.log('Prescription saved:', prescription);
      setPrescriptionDialogOpen(false);
      // Reset form
      setPrescription({
        patientId: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAppointments = MOCK_APPOINTMENTS.filter(appointment => 
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = MOCK_PATIENTS.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaysAppointments = MOCK_APPOINTMENTS.filter(appointment => 
    appointment.date === '2023-06-15'
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar 
              sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
              alt={user?.name || 'Dr. Sarah Johnson'}
              src={user?.avatar}
            >
              {user?.name?.charAt(0) || 'D'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {user?.name || 'Dr. Sarah Johnson'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You have {todaysAppointments.length} appointments scheduled for today
            </Typography>
          </Grid>
          <Grid item>
            <Badge badgeContent={3} color="error" sx={{ mr: 2 }}>
              <IconButton color="primary">
                <Notifications />
              </IconButton>
            </Badge>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Edit />}
              component={Link}
              to="/doctor/availability"
            >
              Set Availability
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Today's Appointments
              </Typography>
              <Typography variant="h3" component="div">
                {todaysAppointments.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CalendarMonth fontSize="small" sx={{ color: 'primary.main', mr: 0.5 }} />
                <Typography variant="body2">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Prescriptions
              </Typography>
              <Typography variant="h3" component="div">
                2
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <MedicalServices fontSize="small" sx={{ color: 'warning.main', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Requires your attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Patients
              </Typography>
              <Typography variant="h3" component="div">
                {MOCK_PATIENTS.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Active patient records
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Next Appointment
              </Typography>
              <Typography variant="h5" component="div" noWrap>
                {todaysAppointments[0]?.patientName || 'No appointments'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AccessTime fontSize="small" sx={{ color: 'primary.dark', mr: 0.5 }} />
                <Typography variant="body2">
                  {todaysAppointments[0]?.time || 'N/A'}
                </Typography>
              </Box>
              {todaysAppointments.length > 0 && (
                <Button 
                  variant="contained" 
                  size="small" 
                  sx={{ mt: 1 }}
                  component={Link}
                  to={`/video-consultation/${todaysAppointments[0]?.id}`}
                >
                  Start Consultation
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Search sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search patients or appointments..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              disableUnderline: true,
            }}
          />
        </Box>
      </Paper>

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
          <Tab label="Today's Schedule" />
          <Tab label="Patient Records" />
          <Tab label="Prescriptions" />
        </Tabs>

        {/* Today's Schedule Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Appointments for Today</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<Add />}
                component={Link}
                to="/doctor/schedule-appointment"
              >
                Add Appointment
              </Button>
            </Box>
            
            {filteredAppointments.length > 0 ? (
              <List>
                {filteredAppointments
                  .filter(apt => apt.date === '2023-06-15')
                  .sort((a, b) => {
                    const timeA = new Date(`2023-06-15 ${a.time}`);
                    const timeB = new Date(`2023-06-15 ${b.time}`);
                    return timeA - timeB;
                  })
                  .map((appointment) => (
                    <Paper key={appointment.id} elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar src={appointment.avatar} alt={appointment.patientName} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" component="span" fontWeight="bold">
                              {appointment.patientName}, {appointment.age}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {appointment.reason}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
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
                            Start Video Call
                          </Button>
                          <IconButton edge="end">
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Paper>
                  ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No appointments scheduled for today.
              </Typography>
            )}
          </Box>
        )}

        {/* Patient Records Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Patient Records</Typography>
            
            {filteredPatients.length > 0 ? (
              <List>
                {filteredPatients.map((patient) => (
                  <Paper key={patient.id} elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={patient.avatar} alt={patient.name} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" fontWeight="bold">
                            {patient.name}, {patient.age} ({patient.gender})
                          </Typography>
                        }
                        secondary={
                          <>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                {patient.conditions.map((condition, index) => (
                                  <Chip 
                                    key={index} 
                                    label={condition} 
                                    size="small" 
                                    variant="outlined"
                                    color="primary"
                                  />
                                ))}
                              </Box>
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          sx={{ mr: 1 }}
                          component={Link}
                          to={`/patient-records/${patient.id}`}
                        >
                          View Records
                        </Button>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          component={Link}
                          to={`/create-prescription/${patient.id}`}
                        >
                          Prescribe
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No patient records found matching your search.
              </Typography>
            )}
          </Box>
        )}

        {/* Prescriptions Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Pending Prescriptions</Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    John Smith, 45
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requested: June 14, 2023
                  </Typography>
                </Box>
                <Chip 
                  label="Pending" 
                  size="small" 
                  color="warning" 
                  variant="outlined" 
                />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                Medication refill request for:
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 1, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2">
                  • Lisinopril 10mg - Once daily
                </Typography>
                <Typography variant="body2">
                  • Metformin 500mg - Twice daily
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  startIcon={<Cancel />}
                  sx={{ mr: 1 }}
                >
                  Deny
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  startIcon={<CheckCircle />}
                  component={Link}
                  to="/create-prescription/101"
                >
                  Approve & Edit
                </Button>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Emma Wilson, 32
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requested: June 13, 2023
                  </Typography>
                </Box>
                <Chip 
                  label="Pending" 
                  size="small" 
                  color="warning" 
                  variant="outlined" 
                />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                New prescription request for skin condition:
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 1, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2">
                  Patient reports worsening of eczema on arms and requests stronger topical medication.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ mr: 1 }}
                  component={Link}
                  to="/patient-records/102"
                >
                  View History
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  component={Link}
                  to="/create-prescription/102"
                >
                  Create Prescription
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default DashboardDoctor;