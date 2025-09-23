import React, { useState, useEffect, useRef } from 'react';
import { 
  TextField, 
  Autocomplete, 
  CircularProgress, 
  Paper, 
  Typography, 
  Box, 
  Chip,
  Avatar,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationIcon from '@mui/icons-material/Medication';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { supabase } from '../services/supabase';

const GlobalSearch = ({ variant = 'standard', placeholder = 'Search patients, doctors, prescriptions...' }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Categories for search results
  const categories = {
    PATIENT: { label: 'Patient', icon: <PersonIcon fontSize="small" /> },
    DOCTOR: { label: 'Doctor', icon: <MedicalServicesIcon fontSize="small" /> },
    PRESCRIPTION: { label: 'Prescription', icon: <MedicationIcon fontSize="small" /> },
    APPOINTMENT: { label: 'Appointment', icon: <EventNoteIcon fontSize="small" /> }
  };

  useEffect(() => {
    let active = true;
    
    if (inputValue.length < 2) {
      setOptions([]);
      return undefined;
    }

    setLoading(true);

    // Function to search across multiple tables
    const searchData = async () => {
      try {
        // Search patients
        const { data: patients, error: patientsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .eq('role', 'patient')
          .or(`first_name.ilike.%${inputValue}%,last_name.ilike.%${inputValue}%`)
          .limit(5);

        if (patientsError) throw patientsError;

        // Search doctors
        const { data: doctors, error: doctorsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, specialty')
          .eq('role', 'doctor')
          .or(`first_name.ilike.%${inputValue}%,last_name.ilike.%${inputValue}%,specialty.ilike.%${inputValue}%`)
          .limit(5);

        if (doctorsError) throw doctorsError;

        // Search prescriptions
        const { data: prescriptions, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('id, medication_name, patient_id, doctor_id, created_at')
          .or(`medication_name.ilike.%${inputValue}%`)
          .limit(5);

        if (prescriptionsError) throw prescriptionsError;

        // Search appointments
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, patient_id, doctor_id, appointment_date, status, reason')
          .or(`reason.ilike.%${inputValue}%,status.ilike.%${inputValue}%`)
          .limit(5);

        if (appointmentsError) throw appointmentsError;

        if (active) {
          const formattedResults = [
            ...patients.map(patient => ({
              id: `patient-${patient.id}`,
              category: 'PATIENT',
              primary: `${patient.first_name} ${patient.last_name}`,
              secondary: 'Patient',
              avatar: patient.avatar_url,
              route: `/patient/${patient.id}`
            })),
            ...doctors.map(doctor => ({
              id: `doctor-${doctor.id}`,
              category: 'DOCTOR',
              primary: `Dr. ${doctor.first_name} ${doctor.last_name}`,
              secondary: doctor.specialty || 'Doctor',
              avatar: doctor.avatar_url,
              route: `/doctor/${doctor.id}`
            })),
            ...prescriptions.map(prescription => ({
              id: `prescription-${prescription.id}`,
              category: 'PRESCRIPTION',
              primary: prescription.medication_name,
              secondary: new Date(prescription.created_at).toLocaleDateString(),
              route: `/prescription/${prescription.id}`
            })),
            ...appointments.map(appointment => ({
              id: `appointment-${appointment.id}`,
              category: 'APPOINTMENT',
              primary: appointment.reason || 'Appointment',
              secondary: `${new Date(appointment.appointment_date).toLocaleString()} - ${appointment.status}`,
              route: `/appointment/${appointment.id}`
            }))
          ];

          setOptions(formattedResults);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error searching data:', error);
        setLoading(false);
      }
    };

    searchData();

    return () => {
      active = false;
    };
  }, [inputValue]);

  const handleOptionSelect = (event, option) => {
    if (option && option.route) {
      navigate(option.route);
      setInputValue('');
      setOpen(false);
    }
  };

  return (
    <Autocomplete
      ref={searchRef}
      id="global-search"
      sx={{ width: variant === 'outlined' ? 300 : 200 }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={handleOptionSelect}
      options={options}
      loading={loading}
      groupBy={(option) => option.category}
      getOptionLabel={(option) => option.primary}
      noOptionsText="No results found"
      filterOptions={(x) => x} // Disable built-in filtering
      PaperComponent={(props) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Paper {...props} elevation={4} />
        </motion.div>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant={variant}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {option.avatar ? (
              <Avatar src={option.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
            ) : (
              categories[option.category].icon
            )}
            <Box sx={{ ml: option.avatar ? 0 : 2 }}>
              <Typography variant="body1">{option.primary}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.secondary}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                size="small" 
                label={categories[option.category].label} 
                color={
                  option.category === 'PATIENT' ? 'primary' :
                  option.category === 'DOCTOR' ? 'secondary' :
                  option.category === 'PRESCRIPTION' ? 'success' : 'info'
                }
              />
            </Box>
          </Box>
        </Box>
      )}
    />
  );
};

export default GlobalSearch;