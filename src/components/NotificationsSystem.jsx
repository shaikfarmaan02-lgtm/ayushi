import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Box,
  Divider,
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationIcon from '@mui/icons-material/Medication';
import EventIcon from '@mui/icons-material/Event';
import { supabase } from '../supabaseClient';
import { formatDistanceToNow } from 'date-fns';

// Mock notifications for development
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. Smith tomorrow at 10:00 AM',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false
  },
  {
    id: 2,
    type: 'prescription',
    title: 'New Prescription',
    message: 'Dr. Johnson has prescribed you new medication',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true
  },
  {
    id: 3,
    type: 'system',
    title: 'System Update',
    message: 'The platform will be under maintenance tonight from 2-4 AM',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: false
  }
];

const NotificationsSystem = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, userId, role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Load notifications from Supabase
      const fetchNotifications = async () => {
        try {
          // In production, this would fetch from Supabase
          // const { data, error } = await supabase
          //   .from('notifications')
          //   .select('*')
          //   .eq('user_id', userId)
          //   .order('created_at', { ascending: false })
          //   .limit(10);
          
          // if (error) throw error;
          
          // For development, use mock data
          setNotifications(MOCK_NOTIFICATIONS);
          setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.read).length);
          
          // Set up real-time subscription
          setupRealtimeSubscription();
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      
      fetchNotifications();
    }
    
    return () => {
      // Clean up subscription
      if (isAuthenticated) {
        supabase.removeAllChannels();
      }
    };
  }, [isAuthenticated, userId]);
  
  const setupRealtimeSubscription = () => {
    // In production, this would subscribe to Supabase changes
    // const channel = supabase
    //   .channel('public:notifications')
    //   .on('postgres_changes', 
    //     { 
    //       event: 'INSERT', 
    //       schema: 'public', 
    //       table: 'notifications',
    //       filter: `user_id=eq.${userId}`
    //     }, 
    //     (payload) => {
    //       handleNewNotification(payload.new);
    //     }
    //   )
    //   .subscribe();
    
    // For development, simulate real-time with timeout
    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        type: 'appointment',
        title: 'New Appointment Request',
        message: 'You have a new appointment request from Patient Alex',
        created_at: new Date().toISOString(),
        read: false
      };
      
      handleNewNotification(newNotification);
    }, 10000); // Simulate after 10 seconds
  };
  
  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.svg'
      });
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const markAsRead = async (id) => {
    // In production, this would update Supabase
    // const { error } = await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('id', id);
    
    // if (error) {
    //   console.error('Error marking notification as read:', error);
    //   return;
    // }
    
    // For development, update local state
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const markAllAsRead = async () => {
    // In production, this would update Supabase
    // const { error } = await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('user_id', userId)
    //   .eq('read', false);
    
    // if (error) {
    //   console.error('Error marking all notifications as read:', error);
    //   return;
    // }
    
    // For development, update local state
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <EventIcon />;
      case 'prescription':
        return <MedicationIcon />;
      default:
        return <MedicalServicesIcon />;
    }
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  if (!isAuthenticated) return null;

  return (
    <>
      <IconButton
        size="large"
        aria-label="show notifications"
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 320, maxHeight: 400 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Box>
          <Divider />
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', maxHeight: 320, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      cursor: 'pointer'
                    }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.read ? 'grey.400' : 'primary.main' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block' }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsSystem;