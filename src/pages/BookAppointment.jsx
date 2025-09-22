import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Typography, Paper, Box, Stepper, Step, StepLabel,
  Button, Grid, Card, CardContent, Avatar, TextField,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Divider, IconButton, Chip
} from '@mui/material';
import { 
  ArrowBack, ArrowForward, CalendarMonth, AccessTime, 
  CheckCircle, Person, MedicalServices
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Mock data for doctors
const MOCK_DOCTORS = [
  {
    id: 201,
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    experience: '12 years',
    rating: 4.8,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
  },
  {
    id: 202,
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    experience: '8 years',
    rating: 4.7,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    availableDays: ['Monday', 'Wednesday', 'Friday']
  },
  {
    id: 203,
    name: 'Dr. Emily Rodriguez',
    specialty: 'General Physician',
    experience: '15 years',
    rating: 4.9,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 204,
    name: 'Dr. James Wilson',
    specialty: 'Neurologist',
    experience: '10 years',
    rating: 4.6,
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    availableDays: ['Monday', 'Tuesday', 'Thursday']
  }
];

// Mock time slots
const MOCK_TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', 
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

// Specialties list
const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'General Medicine', 'Neurology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Ophthalmology'
];

const steps = ['Select Specialty', 'Choose Doctor', 'Pick Date & Time', 'Confirm Details'];

function BookAppointment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [specialty, setSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    let newErrors = {};
    let canProceed = true;

    // Validate current step
    if (activeStep === 0 && !specialty) {
      newErrors.specialty = 'Please select a specialty';
      canProceed = false;
    } else if (activeStep === 1 && !selectedDoctor) {
      newErrors.doctor = 'Please select a doctor';
      canProceed = false;
    } else if (activeStep === 2) {
      if (!appointmentDate) {
        newErrors.date = 'Please select a date';
        canProceed = false;
      }
      if (!selectedTimeSlot) {
        newErrors.time = 'Please select a time slot';
        canProceed = false;
      }
    } else if (activeStep === 3 && !reason.trim()) {
      newErrors.reason = 'Please provide a reason for your visit';
      canProceed = false;
    }

    setErrors(newErrors);

    if (canProceed) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSpecialtyChange = (event) => {
    setSpecialty(event.target.value);
    setErrors({ ...errors, specialty: '' });
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setErrors({ ...errors, doctor: '' });
  };

  const handleDateChange = (newDate) => {
    setAppointmentDate(newDate);
    setErrors({ ...errors, date: '' });
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setErrors({ ...errors, time: '' });
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
    setErrors({ ...errors, reason: '' });
  };

  const handleSubmit = () => {
    // In a real app, this would dispatch an action to create the appointment
    // For now, we'll just navigate back to the dashboard
    alert('Appointment booked successfully!');
    navigate('/dashboard-patient');
  };

  const filteredDoctors = MOCK_DOCTORS.filter(
    doctor => specialty ? doctor.specialty.toLowerCase().includes(specialty.toLowerCase()) : true
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select Medical Specialty
            </Typography>
            <FormControl fullWidth error={!!errors.specialty}>
              <InputLabel id="specialty-select-label">Specialty</InputLabel>
              <Select
                labelId="specialty-select-label"
                id="specialty-select"
                value={specialty}
                label="Specialty"
                onChange={handleSpecialtyChange}
              >
                {SPECIALTIES.map((spec) => (
                  <MenuItem key={spec} value={spec.toLowerCase()}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
              {errors.specialty && <FormHelperText>{errors.specialty}</FormHelperText>}
            </FormControl>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="body1" gutterBottom>
                Popular Specialties
              </Typography>
              <Grid container spacing={2}>
                {SPECIALTIES.slice(0, 4).map((spec) => (
                  <Grid item xs={6} sm={3} key={spec}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                        bgcolor: specialty === spec.toLowerCase() ? 'primary.light' : 'background.paper'
                      }}
                      onClick={() => setSpecialty(spec.toLowerCase())}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <MedicalServices sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="body2">{spec}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Choose a Doctor
            </Typography>
            {errors.doctor && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {errors.doctor}
              </Typography>
            )}
            
            {filteredDoctors.length > 0 ? (
              <Grid container spacing={2}>
                {filteredDoctors.map((doctor) => (
                  <Grid item xs={12} sm={6} key={doctor.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                        bgcolor: selectedDoctor?.id === doctor.id ? 'primary.light' : 'background.paper',
                        border: selectedDoctor?.id === doctor.id ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={doctor.avatar} 
                            alt={doctor.name}
                            sx={{ width: 64, height: 64, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="h6">{doctor.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {doctor.specialty}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            Experience: {doctor.experience}
                          </Typography>
                          <Chip 
                            label={`Rating: ${doctor.rating}/5`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Available: {doctor.availableDays.join(', ')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No doctors found for the selected specialty. Please try another specialty.
              </Typography>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select Date & Time
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={appointmentDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={!!errors.date}
                        helperText={errors.date}
                      />
                    )}
                    disablePast
                    shouldDisableDate={(date) => {
                      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
                      return !selectedDoctor?.availableDays.includes(day);
                    }}
                  />
                </LocalizationProvider>
                
                {selectedDoctor && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Dr. {selectedDoctor.name.split(' ')[1]} is available on:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {selectedDoctor.availableDays.map((day) => (
                        <Chip 
                          key={day} 
                          label={day} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Time Slot
                </Typography>
                {errors.time && (
                  <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                    {errors.time}
                  </Typography>
                )}
                
                <Grid container spacing={1}>
                  {MOCK_TIME_SLOTS.map((timeSlot) => (
                    <Grid item xs={6} sm={4} key={timeSlot}>
                      <Button
                        variant={selectedTimeSlot === timeSlot ? "contained" : "outlined"}
                        fullWidth
                        onClick={() => handleTimeSlotSelect(timeSlot)}
                        sx={{ justifyContent: 'flex-start', py: 1 }}
                      >
                        <AccessTime fontSize="small" sx={{ mr: 1 }} />
                        {timeSlot}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Appointment Details
            </Typography>
            
            <TextField
              fullWidth
              label="Reason for Visit"
              multiline
              rows={4}
              value={reason}
              onChange={handleReasonChange}
              error={!!errors.reason}
              helperText={errors.reason}
              sx={{ mb: 3 }}
            />
            
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Appointment Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Doctor:
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 4, mb: 3 }}>
                    <Typography variant="body1">
                      {selectedDoctor?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDoctor?.specialty}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MedicalServices sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Specialty:
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 4, mb: 3 }}>
                    <Typography variant="body1">
                      {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarMonth sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Date & Time:
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 4, mb: 3 }}>
                    <Typography variant="body1">
                      {appointmentDate?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                    <Typography variant="body1">
                      {selectedTimeSlot}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      Duration:
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 4 }}>
                    <Typography variant="body1">
                      30 minutes
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
      
      case 4:
        return (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Appointment Booked Successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              Your appointment with {selectedDoctor?.name} has been confirmed for {appointmentDate?.toLocaleDateString()} at {selectedTimeSlot}.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You will receive a confirmation email shortly with all the details.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/dashboard-patient')}
              sx={{ mt: 2 }}
            >
              Return to Dashboard
            </Button>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Book an Appointment
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length ? (
          getStepContent(activeStep)
        ) : (
          <>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
              >
                {activeStep === steps.length - 1 ? 'Book Appointment' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default BookAppointment;