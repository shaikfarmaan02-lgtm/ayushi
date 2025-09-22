import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPatient from './pages/DashboardPatient';
import DashboardDoctor from './pages/DashboardDoctor';
import DashboardPharmacist from './pages/DashboardPharmacist';
import DashboardAdmin from './pages/DashboardAdmin';
import VideoConsultation from './pages/VideoConsultation';
import BookAppointment from './pages/BookAppointment';
import Features from './pages/Features';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard-patient" element={
            <ProtectedRoute role="patient">
              <DashboardPatient />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-doctor" element={
            <ProtectedRoute role="doctor">
              <DashboardDoctor />
            </ProtectedRoute>
          } />
          <Route path="/pharmacist/*" element={
            <ProtectedRoute role="pharmacist">
              <DashboardPharmacist />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <DashboardAdmin />
            </ProtectedRoute>
          } />
          
          {/* Appointment Routes */}
          <Route path="/book-appointment" element={
            <ProtectedRoute role="patient">
              <BookAppointment />
            </ProtectedRoute>
          } />
          
          {/* Video Consultation Routes */}
          <Route path="/video-consultation/:appointmentId" element={
            <ProtectedRoute role={["patient", "doctor"]}>
              <VideoConsultation />
            </ProtectedRoute>
          } />
          
          {/* Features Page - Public */}
          <Route path="/features" element={<Features />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;