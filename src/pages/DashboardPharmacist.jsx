import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { format } from 'date-fns';

function DashboardPharmacist() {
  const [activeTab, setActiveTab] = useState(0);
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchPrescriptions();
    fetchInventory();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients:patient_id(full_name, email, phone),
          doctors:doctor_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setNotification({
        open: true,
        message: 'Failed to load prescriptions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pharmacy_inventory')
        .select('*')
        .order('name');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setNotification({
        open: true,
        message: 'Failed to load inventory',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const updatePrescriptionStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setPrescriptions(prescriptions.map(prescription => 
        prescription.id === id ? { ...prescription, status } : prescription
      ));
      
      setNotification({
        open: true,
        message: `Prescription ${status === 'filled' ? 'filled' : 'rejected'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating prescription:', error);
      setNotification({
        open: true,
        message: 'Failed to update prescription',
        severity: 'error'
      });
    }
  };

  const updateInventoryItem = async (id, quantity) => {
    try {
      const { error } = await supabase
        .from('pharmacy_inventory')
        .update({ quantity, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
      
      setNotification({
        open: true,
        message: 'Inventory updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      setNotification({
        open: true,
        message: 'Failed to update inventory',
        severity: 'error'
      });
    }
  };

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctors?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <LocalPharmacyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Pharmacist Dashboard
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchPrescriptions();
              fetchInventory();
            }}
          >
            Refresh
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search prescriptions or inventory..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mb: 2 }}
          />

          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab icon={<AssignmentIcon />} label="Prescriptions" />
            <Tab icon={<InventoryIcon />} label="Inventory" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pending Prescriptions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Medication</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Loading prescriptions...</TableCell>
                    </TableRow>
                  ) : filteredPrescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No prescriptions found</TableCell>
                    </TableRow>
                  ) : (
                    filteredPrescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>{prescription.patients?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{prescription.doctors?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{prescription.medication}</TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>
                          {prescription.created_at ? format(new Date(prescription.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={prescription.status} 
                            color={
                              prescription.status === 'filled' ? 'success' : 
                              prescription.status === 'pending' ? 'warning' : 
                              prescription.status === 'rejected' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {prescription.status === 'pending' && (
                            <>
                              <IconButton 
                                color="success" 
                                size="small"
                                onClick={() => updatePrescriptionStatus(prescription.id, 'filled')}
                                title="Fill Prescription"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => updatePrescriptionStatus(prescription.id, 'rejected')}
                                title="Reject Prescription"
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Medication Inventory
            </Typography>
            <Grid container spacing={3}>
              {loading ? (
                <Grid item xs={12}>
                  <Typography align="center">Loading inventory...</Typography>
                </Grid>
              ) : filteredInventory.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center">No inventory items found</Typography>
                </Grid>
              ) : (
                filteredInventory.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {item.category}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography>
                            In Stock: {item.quantity}
                          </Typography>
                          <Chip 
                            label={item.quantity > 10 ? 'Well Stocked' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'} 
                            color={item.quantity > 10 ? 'success' : item.quantity > 0 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                          <TextField
                            type="number"
                            label="Update Quantity"
                            size="small"
                            defaultValue={item.quantity}
                            inputProps={{ min: 0 }}
                            sx={{ mr: 1, width: '50%' }}
                            onBlur={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              if (!isNaN(newQuantity) && newQuantity !== item.quantity) {
                                updateInventoryItem(item.id, newQuantity);
                              }
                            }}
                          />
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              const newQuantity = item.quantity + 10;
                              updateInventoryItem(item.id, newQuantity);
                            }}
                          >
                            Restock
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Paper>
        )}
      </motion.div>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DashboardPharmacist;