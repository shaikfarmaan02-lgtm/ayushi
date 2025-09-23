import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Paper, Typography, TextField, IconButton, 
  Avatar, CircularProgress, Divider, Chip,
  Button, Menu, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import { 
  Send, Mic, MicOff, MoreVert, 
  Download, ContentCopy, Delete, VolumeUp
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { format } from 'date-fns';

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

// Speech synthesis setup
const synth = window.speechSynthesis;

const AIChatbot = () => {
  const user = useSelector(state => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [model, setModel] = useState('gpt-4o');
  const messagesEndRef = useRef(null);
  
  // Fetch user context (appointments, prescriptions) for contextual responses
  const [userContext, setUserContext] = useState({
    appointments: [],
    prescriptions: []
  });

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        if (!user) return;
        
        // Fetch chat history from Supabase
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          // Add welcome message if no history
          const welcomeMessage = {
            id: 'welcome',
            role: 'assistant',
            content: `Hello ${user?.name || 'there'}! I'm your healthcare assistant. How can I help you today?`,
            created_at: new Date().toISOString()
          };
          setMessages([welcomeMessage]);
          
          // Save welcome message to Supabase
          if (user) {
            await supabase.from('chat_messages').insert([{
              user_id: user.id,
              role: 'assistant',
              content: welcomeMessage.content,
              created_at: welcomeMessage.created_at
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    const fetchUserContext = async () => {
      try {
        if (!user) return;
        
        // In a real app, fetch from Supabase
        // For now, use mock data
        setUserContext({
          appointments: [
            { id: 1, doctor: 'Dr. Sarah Johnson', date: '2023-06-20', time: '10:00 AM', reason: 'Annual checkup' },
            { id: 2, doctor: 'Dr. Michael Chen', date: '2023-07-05', time: '2:30 PM', reason: 'Follow-up' }
          ],
          prescriptions: [
            { id: 1, medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', doctor: 'Dr. Sarah Johnson' },
            { id: 2, medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', doctor: 'Dr. Michael Chen' }
          ]
        });
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    };

    fetchChatHistory();
    fetchUserContext();
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if (!recognition) return;

    const handleResult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setInput(transcript);
    };

    const handleEnd = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.stop();
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Save user message to Supabase
      if (user) {
        await supabase.from('chat_messages').insert([{
          user_id: user.id,
          role: 'user',
          content: userMessage.content,
          created_at: userMessage.created_at
        }]);
      }
      
      // Prepare context for the AI
      const contextString = prepareContextForAI();
      
      // Call AI service (OpenAI or Anthropic)
      const response = await callAIService(userMessage.content, contextString, model);
      
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to Supabase
      if (user) {
        await supabase.from('chat_messages').insert([{
          user_id: user.id,
          role: 'assistant',
          content: assistantMessage.content,
          created_at: assistantMessage.created_at
        }]);
      }
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        created_at: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareContextForAI = () => {
    // Create a context string with user's appointments and prescriptions
    let context = '';
    
    if (userContext.appointments.length > 0) {
      context += 'Your upcoming appointments:\n';
      userContext.appointments.forEach(app => {
        context += `- ${app.doctor} on ${app.date} at ${app.time} for ${app.reason}\n`;
      });
    }
    
    if (userContext.prescriptions.length > 0) {
      context += '\nYour current prescriptions:\n';
      userContext.prescriptions.forEach(rx => {
        context += `- ${rx.medication} ${rx.dosage}, ${rx.frequency}, prescribed by ${rx.doctor}\n`;
      });
    }
    
    return context;
  };

  const callAIService = async (message, context, selectedModel) => {
    // In a real app, this would call OpenAI or Anthropic API
    // For now, return a mock response
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if message is about appointments
    if (message.toLowerCase().includes('appointment')) {
      return `I see you have ${userContext.appointments.length} upcoming appointments. Your next appointment is with ${userContext.appointments[0].doctor} on ${userContext.appointments[0].date} at ${userContext.appointments[0].time} for ${userContext.appointments[0].reason}. Would you like me to help you schedule a new appointment?`;
    }
    
    // Check if message is about prescriptions
    if (message.toLowerCase().includes('prescription') || message.toLowerCase().includes('medication')) {
      return `You currently have ${userContext.prescriptions.length} active prescriptions. These include ${userContext.prescriptions.map(rx => rx.medication).join(' and ')}. Remember to take your medications as prescribed. Is there anything specific you'd like to know about your medications?`;
    }
    
    // Generic responses
    const responses = [
      "I understand your concern. Based on what you've told me, I recommend discussing this with your doctor during your next appointment.",
      "That's a good question about your health. While I can provide general information, your doctor would be the best person to give you specific advice.",
      "I've noted your symptoms. Would you like me to help you schedule an appointment with a specialist?",
      "Based on your medical history, this is something you should monitor. Would you like me to remind you to track these symptoms?",
      "I understand you're concerned. Many patients have similar questions. Let me explain what the research shows about this condition."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const speakText = (text) => {
    if (!synth) return;
    
    // Stop any current speech
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMenuOpen = (event, message) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage.content);
    }
    handleMenuClose();
  };

  const handleSpeakMessage = () => {
    if (selectedMessage) {
      speakText(selectedMessage.content);
    }
    handleMenuClose();
  };

  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      try {
        // Delete from Supabase if it's a real message
        if (user && selectedMessage.id !== 'welcome') {
          await supabase
            .from('chat_messages')
            .delete()
            .match({ id: selectedMessage.id });
        }
        
        // Remove from state
        setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
    handleMenuClose();
  };

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0'
        }}
      >
        <Typography variant="h6">
          AI Health Assistant
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                size="small"
              />
            }
            label="Voice"
            sx={{ mr: 2 }}
          />
          <TextField
            select
            value={model}
            onChange={handleModelChange}
            variant="outlined"
            size="small"
            sx={{ width: 120 }}
          >
            <MenuItem value="gpt-4o">GPT-4o</MenuItem>
            <MenuItem value="gpt-3.5-turbo">GPT-3.5</MenuItem>
            <MenuItem value="claude-3-opus">Claude 3</MenuItem>
          </TextField>
        </Box>
      </Paper>
      
      {/* Messages Container */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          p: 2,
          bgcolor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                    width: 36,
                    height: 36,
                    ml: message.role === 'user' ? 1 : 0,
                    mr: message.role === 'user' ? 0 : 1
                  }}
                >
                  {message.role === 'user' ? user?.name?.charAt(0) || 'U' : 'AI'}
                </Avatar>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: message.role === 'user' 
                      ? 'primary.light' 
                      : message.isError 
                        ? '#ffebee' 
                        : 'background.paper',
                    color: message.role === 'user' 
                      ? 'primary.contrastText' 
                      : message.isError 
                        ? 'error.dark' 
                        : 'text.primary',
                    position: 'relative'
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 1, 
                      color: message.role === 'user' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : 'text.secondary'
                    }}
                  >
                    {format(new Date(message.created_at), 'h:mm a')}
                  </Typography>
                  
                  {/* Message actions */}
                  <IconButton 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: message.role === 'user' ? 'auto' : 8,
                      left: message.role === 'user' ? 8 : 'auto',
                      opacity: 0.6,
                      '&:hover': { opacity: 1 }
                    }}
                    onClick={(e) => handleMenuOpen(e, message)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Paper>
              </Box>
            </Box>
          </motion.div>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 7, mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Thinking...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Input Area */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          borderRadius: '0 0 12px 12px',
          bgcolor: theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color={isListening ? 'error' : 'default'} 
            onClick={toggleListening}
            disabled={!recognition}
          >
            {isListening ? <MicOff /> : <Mic />}
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{ mx: 1 }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send />
          </IconButton>
        </Box>
        
        {/* Context chips */}
        {(userContext.appointments.length > 0 || userContext.prescriptions.length > 0) && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
              Available context:
            </Typography>
            {userContext.appointments.length > 0 && (
              <Chip 
                label={`${userContext.appointments.length} appointments`} 
                size="small" 
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
            {userContext.prescriptions.length > 0 && (
              <Chip 
                label={`${userContext.prescriptions.length} prescriptions`} 
                size="small" 
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
          </Box>
        )}
      </Paper>
      
      {/* Message Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCopyMessage}>
          <ContentCopy fontSize="small" sx={{ mr: 1 }} />
          Copy
        </MenuItem>
        <MenuItem onClick={handleSpeakMessage}>
          <VolumeUp fontSize="small" sx={{ mr: 1 }} />
          Speak
        </MenuItem>
        <MenuItem onClick={handleDeleteMessage}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AIChatbot;