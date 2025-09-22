import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Paper, Typography, IconButton, Grid, Avatar,
  TextField, Button, Divider, Chip, Badge, Card, CardContent
} from '@mui/material';
import {
  Mic, MicOff, Videocam, VideocamOff, CallEnd,
  ScreenShare, Chat, MoreVert, Send, AttachFile,
  PictureInPicture, MedicalServices
} from '@mui/icons-material';

// Import WebRTC service
import * as webRTCService from '../services/webRTC';

// Mock appointment data
const getMockAppointment = (id) => {
  const appointments = {
    '1': {
      id: 1,
      patientName: 'John Smith',
      patientAvatar: 'https://randomuser.me/api/portraits/men/44.jpg',
      doctorName: 'Dr. Sarah Johnson',
      doctorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: '2023-06-15',
      time: '10:00 AM',
      reason: 'Chest pain and shortness of breath'
    },
    '2': {
      id: 2,
      patientName: 'Emma Wilson',
      patientAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      doctorName: 'Dr. Michael Chen',
      doctorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: '2023-06-15',
      time: '11:30 AM',
      reason: 'Skin rash and itching'
    }
  };
  return appointments[id];
};

function VideoCall() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const userRole = user?.role || 'patient';
  
  const [appointment, setAppointment] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    // Fetch appointment details
    const appointmentData = getMockAppointment(appointmentId);
    setAppointment(appointmentData);

    // Simulate connecting and then connected after 2 seconds
    setTimeout(() => {
      setCallStatus('connected');
      
      // Start timer for call duration
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }, 2000);

    // Initialize WebRTC using our service
    const initializeWebRTC = async () => {
      try {
        // Initialize local stream
        const localStream = await webRTCService.initLocalStream();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        // Create peer connection
        const peerConnection = webRTCService.createPeerConnection();
        peerConnectionRef.current = peerConnection;
        
        // In a real app, you would exchange signaling data with the remote peer here
        // For demo purposes, we'll simulate a connection
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = webRTCService.getRemoteStream();
          }
        }, 2000);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Failed to access camera and microphone. Please check permissions.');
      }
    };

    initializeWebRTC();

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop all tracks of the stream
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [appointmentId]);

  const toggleVideo = () => {
    const newState = webRTCService.toggleVideo();
    setIsVideoOn(newState);
  };

  const toggleAudio = () => {
    const newState = webRTCService.toggleAudio();
    setIsAudioOn(newState);
  };

  const toggleScreenShare = async () => {
    try {
      const isNowScreenSharing = await webRTCService.toggleScreenShare();
      setIsScreenSharing(isNowScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
      alert('Failed to share screen. Please check permissions.');
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const endCall = () => {
    setCallStatus('ended');
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Close WebRTC connection
    webRTCService.endCall();
    
    // Navigate back after a short delay
    setTimeout(() => {
      navigate(userRole === 'doctor' ? '/dashboard-doctor' : '/dashboard-patient');
    }, 2000);
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: userRole,
        text: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!appointment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h5">Loading appointment details...</Typography>
      </Box>
    );
  }

  const otherPartyName = userRole === 'doctor' ? appointment.patientName : appointment.doctorName;
  const otherPartyAvatar = userRole === 'doctor' ? appointment.patientAvatar : appointment.doctorAvatar;

  return (
    <Box sx={{ height: '100vh', bgcolor: '#121212' }}>
      {/* Call Status Bar */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'rgba(0,0,0,0.7)', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={otherPartyAvatar} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="h6">{otherPartyName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                size="small" 
                label={callStatus === 'connected' ? 'Connected' : callStatus === 'connecting' ? 'Connecting...' : 'Call Ended'} 
                color={callStatus === 'connected' ? 'success' : callStatus === 'connecting' ? 'warning' : 'error'}
                sx={{ mr: 1 }}
              />
              {callStatus === 'connected' && (
                <Typography variant="body2" color="text.secondary">
                  {formatElapsedTime(elapsedTime)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        
        <Box>
          <IconButton color="inherit" onClick={() => setShowChat(!showChat)}>
            <Badge badgeContent={chatMessages.length > 0 ? chatMessages.length : 0} color="primary">
              <Chat />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <PictureInPicture />
          </IconButton>
          <IconButton color="inherit">
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Main Video Area */}
      <Grid container sx={{ height: 'calc(100vh - 64px - 80px)' }}>
        {/* Video Streams */}
        <Grid item xs={showChat ? 8 : 12} sx={{ position: 'relative', height: '100%' }}>
          {/* Remote Video (Full Screen) */}
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            bgcolor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {callStatus === 'connecting' ? (
              <Typography variant="h5" color="white">Connecting to {otherPartyName}...</Typography>
            ) : callStatus === 'ended' ? (
              <Typography variant="h5" color="white">Call Ended</Typography>
            ) : (
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </Box>
          
          {/* Local Video (Picture-in-Picture) */}
          <Box sx={{ 
            position: 'absolute', 
            width: '25%', 
            maxWidth: 300,
            minWidth: 200,
            aspectRatio: '16/9',
            bottom: 20, 
            right: 20,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            border: '2px solid white'
          }}>
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!isVideoOn && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                bgcolor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Typography color="white">Camera Off</Typography>
              </Box>
            )}
          </Box>
          
          {/* Medical Info Card (for doctors) */}
          {userRole === 'doctor' && (
            <Card sx={{ 
              position: 'absolute', 
              top: 20, 
              left: 20,
              width: 300,
              opacity: 0.9
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MedicalServices sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Patient Information</Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {appointment.patientName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Reason for Visit:</strong> {appointment.reason}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth 
                  sx={{ mt: 1 }}
                >
                  View Medical Records
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
        
        {/* Chat Panel */}
        {showChat && (
          <Grid item xs={4} sx={{ height: '100%', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <Paper sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: '#1e1e1e',
              color: 'white',
              borderRadius: 0
            }}>
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h6">Chat</Typography>
              </Box>
              
              {/* Messages Area */}
              <Box sx={{ 
                flexGrow: 1, 
                p: 2, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {chatMessages.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    No messages yet. Start the conversation!
                  </Typography>
                ) : (
                  chatMessages.map(message => (
                    <Box 
                      key={message.id}
                      sx={{ 
                        alignSelf: message.sender === userRole ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                      }}
                    >
                      <Paper sx={{ 
                        p: 1.5, 
                        borderRadius: 2,
                        bgcolor: message.sender === userRole ? 'primary.main' : 'background.paper',
                        color: message.sender === userRole ? 'white' : 'text.primary'
                      }}>
                        <Typography variant="body2">{message.text}</Typography>
                      </Paper>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {message.timestamp}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
              
              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <AttachFile />
                  </IconButton>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                    sx={{ 
                      mx: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                      }
                    }}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={sendChatMessage}
                    disabled={!chatMessage.trim()}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Call Controls */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'rgba(0,0,0,0.8)', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>
        <IconButton 
          sx={{ 
            bgcolor: isAudioOn ? 'rgba(255,255,255,0.2)' : 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: isAudioOn ? 'rgba(255,255,255,0.3)' : 'error.dark',
            }
          }}
          onClick={toggleAudio}
        >
          {isAudioOn ? <Mic /> : <MicOff />}
        </IconButton>
        
        <IconButton 
          sx={{ 
            bgcolor: isVideoOn ? 'rgba(255,255,255,0.2)' : 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: isVideoOn ? 'rgba(255,255,255,0.3)' : 'error.dark',
            }
          }}
          onClick={toggleVideo}
        >
          {isVideoOn ? <Videocam /> : <VideocamOff />}
        </IconButton>
        
        <IconButton 
          sx={{ 
            bgcolor: 'error.main',
            color: 'white',
            p: 2,
            '&:hover': {
              bgcolor: 'error.dark',
            }
          }}
          onClick={endCall}
        >
          <CallEnd sx={{ fontSize: 30 }} />
        </IconButton>
        
        <IconButton 
          sx={{ 
            bgcolor: isScreenSharing ? 'primary.main' : 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: isScreenSharing ? 'primary.dark' : 'rgba(255,255,255,0.3)',
            }
          }}
          onClick={toggleScreenShare}
        >
          <ScreenShare />
        </IconButton>
        
        <IconButton 
          sx={{ 
            bgcolor: showChat ? 'primary.main' : 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: showChat ? 'primary.dark' : 'rgba(255,255,255,0.3)',
            }
          }}
          onClick={toggleChat}
        >
          <Chat />
        </IconButton>
      </Box>
    </Box>
  );
}

export default VideoCall;