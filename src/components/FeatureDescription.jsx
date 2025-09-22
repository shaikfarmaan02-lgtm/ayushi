import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * FeatureDescription - Component to display detailed descriptions of application features
 */
const FeatureDescription = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Feature descriptions
  const features = [
    {
      title: "Secure Authentication",
      description: "Our application uses Supabase for secure, multi-factor authentication. User credentials are encrypted and stored securely, with role-based access control for patients, doctors, and administrators.",
      technical: "Implements JWT tokens, secure password hashing, and session management."
    },
    {
      title: "Patient Dashboard",
      description: "A comprehensive dashboard for patients to manage appointments, view prescriptions, access medical records, and track health metrics. The intuitive interface provides quick access to all healthcare needs.",
      technical: "Built with React and Material UI components, with real-time data updates from Supabase."
    },
    {
      title: "Doctor Dashboard",
      description: "Specialized interface for healthcare providers to manage patient appointments, issue prescriptions, record medical notes, and conduct video consultations. Streamlines the workflow for medical professionals.",
      technical: "Features role-based views and specialized tools for medical documentation."
    },
    {
      title: "WebRTC Video Consultation",
      description: "High-quality, secure video consultations between patients and doctors. Features include screen sharing, audio/video controls, and end-to-end encryption for patient privacy.",
      technical: "Implemented using WebRTC with Simple Peer for peer-to-peer connections, ensuring low latency and high-quality video."
    },
    {
      title: "E-Prescription System",
      description: "Digital prescription management with analytics on medication history. Doctors can issue prescriptions electronically, and patients can view their medication history, request refills, and receive reminders.",
      technical: "Utilizes NoSQL database structure for flexible medication data storage and analytics."
    },
    {
      title: "Medical Records Management",
      description: "Comprehensive system for storing and retrieving medical records, including lab results, imaging reports, and visit summaries. Supports document uploads and secure sharing between healthcare providers.",
      technical: "Implements a flexible NoSQL schema to accommodate various types of medical data and attachments."
    },
    {
      title: "AI Virtual Pharmacist",
      description: "An AI-powered assistant that provides information about medications, potential interactions, and answers health-related questions. Enhances patient understanding of their treatment plans.",
      technical: "Integrates with external APIs for medication information and uses natural language processing for query understanding."
    },
    {
      title: "Appointment Scheduling",
      description: "Intuitive system for booking, rescheduling, and canceling appointments. Patients can select preferred doctors, appointment types, and available time slots.",
      technical: "Features real-time availability updates and integration with calendar systems."
    },
    {
      title: "Health Analytics",
      description: "Data visualization tools for tracking health metrics, medication adherence, and treatment outcomes. Helps patients and doctors monitor progress and make informed decisions.",
      technical: "Uses Chart.js and MUI X-Charts for interactive data visualization and trend analysis."
    },
    {
      title: "Responsive Design",
      description: "Fully responsive interface that works seamlessly across desktop, tablet, and mobile devices. Ensures accessibility for all users regardless of device or screen size.",
      technical: "Implemented with responsive Material UI components and CSS media queries for optimal viewing on all devices."
    }
  ];

  return (
    <Box sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Ayushi Healthcare Platform Features
        </Typography>
        
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div variants={itemVariants}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    borderRadius: 2,
                    background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {feature.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Technical Implementation:</strong> {feature.technical}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default FeatureDescription;