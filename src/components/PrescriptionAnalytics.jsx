import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  Divider, CircularProgress, Tabs, Tab, Button
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { prescriptionService } from '../services/supabase';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PrescriptionAnalytics = () => {
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('6months'); // 3months, 6months, 1year

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // In a real app, you would pass the time range to the service
        const data = await prescriptionService.getPatientPrescriptionAnalytics(user.id);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching prescription analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id, timeRange]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Format data for medication frequency chart
  const getMedicationData = () => {
    if (!analytics?.medications) return [];
    
    return analytics.medications
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(med => ({
        name: med.name.length > 15 ? `${med.name.substring(0, 15)}...` : med.name,
        count: med.count,
        fullName: med.name,
        dosage: med.dosage,
        frequency: med.frequency
      }));
  };

  // Format data for prescriptions by month chart
  const getMonthlyData = () => {
    if (!analytics?.prescriptionsByMonth) return [];
    
    return analytics.prescriptionsByMonth
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/');
        const [bMonth, bYear] = b.month.split('/');
        return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
      })
      .map(item => ({
        month: item.month,
        count: item.count,
        name: item.month // For recharts
      }));
  };

  // Mock data for adherence chart
  const getAdherenceData = () => {
    return [
      { name: 'Taken as Prescribed', value: 75 },
      { name: 'Missed Doses', value: 15 },
      { name: 'Taken Late', value: 10 }
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Prescription Analytics & Insights
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Time Range:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant={timeRange === '3months' ? 'contained' : 'outlined'} 
            onClick={() => handleTimeRangeChange('3months')}
            size="small"
          >
            3 Months
          </Button>
          <Button 
            variant={timeRange === '6months' ? 'contained' : 'outlined'} 
            onClick={() => handleTimeRangeChange('6months')}
            size="small"
          >
            6 Months
          </Button>
          <Button 
            variant={timeRange === '1year' ? 'contained' : 'outlined'} 
            onClick={() => handleTimeRangeChange('1year')}
            size="small"
          >
            1 Year
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="prescription analytics tabs">
          <Tab label="Overview" />
          <Tab label="Medication Frequency" />
          <Tab label="Monthly Trends" />
          <Tab label="Adherence" />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Total Prescriptions
                </Typography>
                <Typography variant="h3">
                  {analytics?.totalPrescriptions || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Unique Medications
                </Typography>
                <Typography variant="h3">
                  {analytics?.medications?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Adherence Rate
                </Typography>
                <Typography variant="h3">
                  75%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Recent Medications
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {getMedicationData().slice(0, 5).map((med, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {med.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dosage: {med.dosage} | Frequency: {med.frequency}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Medication Frequency Tab */}
      {tabValue === 1 && (
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getMedicationData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={70}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [value, 'Count']}
                labelFormatter={(label) => {
                  const med = getMedicationData().find(m => m.name === label);
                  return med?.fullName || label;
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Prescription Count" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
      
      {/* Monthly Trends Tab */}
      {tabValue === 2 && (
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getMonthlyData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name, props) => [value, 'Prescriptions']} />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Prescriptions per Month" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
      
      {/* Adherence Tab */}
      {tabValue === 3 && (
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getAdherenceData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {getAdherenceData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value}%`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary">
          * This analytics dashboard provides insights into your prescription history and medication usage patterns.
          Consult with your healthcare provider before making any changes to your medication regimen.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PrescriptionAnalytics;