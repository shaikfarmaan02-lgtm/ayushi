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
  Alert,
  Snackbar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from '@mui/x-charts';

function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    usersByRole: {
      patient: 0,
      doctor: 0,
      pharmacist: 0,
      admin: 0
    }
  });

  useEffect(() => {
    fetchUsers();
    fetchErrorLogs();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setNotification({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrorLogs(data || []);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      setNotification({
        open: true,
        message: 'Failed to load error logs',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get user counts
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, role, last_sign_in_at');
      
      if (userError) throw userError;
      
      // Get appointment count
      const { count: appointmentCount, error: appointmentError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true });
      
      if (appointmentError) throw appointmentError;
      
      // Get prescription count
      const { count: prescriptionCount, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select('id', { count: 'exact', head: true });
      
      if (prescriptionError) throw prescriptionError;
      
      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      
      const activeUsers = userData.filter(user => 
        user.last_sign_in_at && new Date(user.last_sign_in_at) > thirtyDaysAgo
      ).length;
      
      const usersByRole = userData.reduce((acc, user) => {
        const role = user.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});
      
      setStats({
        totalUsers: userData.length,
        activeUsers,
        totalAppointments: appointmentCount,
        totalPrescriptions: prescriptionCount,
        usersByRole
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      setNotification({
        open: true,
        message: 'Failed to load statistics',
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

  const updateUserStatus = async (id, isActive) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: isActive, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, is_active: isActive } : user
      ));
      
      setNotification({
        open: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      setNotification({
        open: true,
        message: 'Failed to update user status',
        severity: 'error'
      });
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter error logs based on search term
  const filteredErrorLogs = errorLogs.filter(log => 
    log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart data
  const userRoleData = [
    { id: 0, value: stats.usersByRole.patient || 0, label: 'Patients' },
    { id: 1, value: stats.usersByRole.doctor || 0, label: 'Doctors' },
    { id: 2, value: stats.usersByRole.pharmacist || 0, label: 'Pharmacists' },
    { id: 3, value: stats.usersByRole.admin || 0, label: 'Admins' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Admin Dashboard
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchUsers();
              fetchErrorLogs();
              fetchStats();
            }}
          >
            Refresh
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users or error logs..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mb: 2 }}
          />

          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab icon={<DashboardIcon />} label="Analytics" />
            <Tab icon={<PeopleIcon />} label="Users" />
            <Tab icon={<ErrorIcon />} label="Error Logs" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography component="p" variant="h4">
                  {stats.totalUsers}
                </Typography>
                <Typography color="textSecondary" sx={{ flex: 1 }}>
                  {stats.activeUsers} active in last 30 days
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Appointments
                </Typography>
                <Typography component="p" variant="h4">
                  {stats.totalAppointments}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Prescriptions
                </Typography>
                <Typography component="p" variant="h4">
                  {stats.totalPrescriptions}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography color="textSecondary" gutterBottom>
                  System Status
                </Typography>
                <Typography component="p" variant="h4" color="success.main">
                  Healthy
                </Typography>
                <Typography color="textSecondary">
                  All services operational
                </Typography>
              </Paper>
            </Grid>

            {/* Charts */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
                <Typography variant="h6" gutterBottom>
                  User Activity
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Jan', value: 65 },
                      { name: 'Feb', value: 59 },
                      { name: 'Mar', value: 80 },
                      { name: 'Apr', value: 81 },
                      { name: 'May', value: 56 },
                      { name: 'Jun', value: 55 },
                      { name: 'Jul', value: 40 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Active Users" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
                <Typography variant="h6" gutterBottom>
                  User Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent System Activity
                </Typography>
                <List>
                  {[
                    { action: 'System backup completed', time: '2 hours ago', icon: <SettingsIcon color="primary" /> },
                    { action: 'New doctor account approved', time: '5 hours ago', icon: <PeopleIcon color="success" /> },
                    { action: 'Database optimization completed', time: '1 day ago', icon: <SettingsIcon color="primary" /> },
                    { action: 'System update installed', time: '2 days ago', icon: <RefreshIcon color="secondary" /> },
                    { action: 'Error rate spike detected and resolved', time: '3 days ago', icon: <ErrorIcon color="error" /> }
                  ].map((item, index) => (
                    <ListItem key={index} divider={index < 4}>
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.action} 
                        secondary={item.time} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">Loading users...</TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No users found</TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role || 'unknown'} 
                            color={
                              user.role === 'admin' ? 'secondary' : 
                              user.role === 'doctor' ? 'primary' : 
                              user.role === 'pharmacist' ? 'info' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.is_active ? 'Active' : 'Inactive'} 
                            color={user.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color={user.is_active ? 'error' : 'success'}
                            onClick={() => updateUserStatus(user.id, !user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Logs
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Severity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Loading error logs...</TableCell>
                    </TableRow>
                  ) : filteredErrorLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No error logs found</TableCell>
                    </TableRow>
                  ) : (
                    filteredErrorLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.created_at ? format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                        </TableCell>
                        <TableCell>{log.source || 'Unknown'}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{log.user_id || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.severity || 'error'} 
                            color={
                              log.severity === 'critical' ? 'error' : 
                              log.severity === 'warning' ? 'warning' : 
                              log.severity === 'info' ? 'info' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Notification Settings</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email Notifications" 
                          secondary="Send system alerts to administrators" 
                        />
                        <Chip label="Enabled" color="success" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ErrorIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Error Reporting" 
                          secondary="Automatically log errors to database" 
                        />
                        <Chip label="Enabled" color="success" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="User Registration" 
                          secondary="Allow new user registrations" 
                        />
                        <Chip label="Enabled" color="success" size="small" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Maintenance</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <RefreshIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Database Backup" 
                          secondary="Last backup: 12 hours ago" 
                        />
                        <Button variant="outlined" size="small">Run Now</Button>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="System Optimization" 
                          secondary="Last run: 3 days ago" 
                        />
                        <Button variant="outlined" size="small">Run Now</Button>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ErrorIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Clear Error Logs" 
                          secondary="100 entries currently stored" 
                        />
                        <Button variant="outlined" size="small" color="error">Clear</Button>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
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

export default DashboardAdmin;