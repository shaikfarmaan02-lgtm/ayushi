import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Fab, 
  Zoom, 
  Collapse,
  Avatar,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { searchDrugInfo, checkDrugInteractions, getMissedDoseInfo, commonDrugQuestions } from '../services/drugInfo';

const ChatBotAyushi = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I\'m Ayushi, your AI Virtual Pharmacist Assistant. How can I help you today? You can ask me about medications, side effects, drug interactions, or what to do if you miss a dose.' 
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Speech recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  
  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  }
  
  // Scroll to bottom of chat when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  const toggleChatbot = () => {
    setOpen(!open);
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message to conversation
    const userMessage = { sender: 'user', text: message };
    setConversation([...conversation, userMessage]);
    
    // Process the message and generate a response
    const botResponse = processUserMessage(message);
    
    // Clear input field
    setMessage('');
    
    // Add bot response after a short delay to simulate thinking
    setTimeout(() => {
      setConversation(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const toggleListening = () => {
    if (!recognition) {
      setConversation([...conversation, { 
        sender: 'bot', 
        text: 'Sorry, speech recognition is not supported in your browser.' 
      }]);
      return;
    }
    
    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };
  
  // Process user message and generate appropriate response
  const processUserMessage = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for drug information queries
    if (message.includes('what is') && message.length > 8) {
      const drugName = message.replace('what is', '').trim();
      const drugInfo = searchDrugInfo(drugName);
      
      if (drugInfo) {
        return `${drugInfo.name}: ${drugInfo.description}`;
      }
    }
    
    // Check for side effects queries
    if (message.includes('side effects') || message.includes('side effect')) {
      for (const drug in searchDrugInfo) {
        if (message.includes(drug)) {
          return commonDrugQuestions['side effects'](drug);
        }
      }
      
      // Extract potential drug name
      const words = message.split(' ');
      for (const word of words) {
        if (word.length > 3 && word !== 'side' && word !== 'effects' && word !== 'what' && word !== 'are') {
          const result = commonDrugQuestions['side effects'](word);
          if (!result.includes("I don't have specific information")) {
            return result;
          }
        }
      }
    }
    
    // Check for dosage queries
    if (message.includes('dosage') || message.includes('dose') || message.includes('how much')) {
      for (const drug in searchDrugInfo) {
        if (message.includes(drug)) {
          return commonDrugQuestions['dosage'](drug);
        }
      }
      
      // Extract potential drug name
      const words = message.split(' ');
      for (const word of words) {
        if (word.length > 3 && word !== 'dosage' && word !== 'dose' && word !== 'how' && word !== 'much') {
          const result = commonDrugQuestions['dosage'](word);
          if (!result.includes("I don't have specific dosage information")) {
            return result;
          }
        }
      }
    }
    
    // Check for missed dose queries
    if (message.includes('miss') && message.includes('dose')) {
      for (const drug in searchDrugInfo) {
        if (message.includes(drug)) {
          return commonDrugQuestions['missed dose'](drug);
        }
      }
      
      // Extract potential drug name
      const words = message.split(' ');
      for (const word of words) {
        if (word.length > 3 && word !== 'missed' && word !== 'dose' && word !== 'what' && word !== 'should') {
          const result = commonDrugQuestions['missed dose'](word);
          if (result) {
            return result;
          }
        }
      }
      
      return "If you miss a dose, take it as soon as you remember. Skip the missed dose if it's almost time for your next scheduled dose. Don't take extra medicine to make up the missed dose. If you're concerned, please consult your doctor or pharmacist.";
    }
    
    // Check for drug interactions
    if (message.includes('interaction') || (message.includes('take') && message.includes('together'))) {
      const words = message.split(' ');
      const potentialDrugs = words.filter(word => word.length > 3 && !['interaction', 'take', 'together', 'with', 'and', 'what', 'about', 'between', 'can', 'should'].includes(word));
      
      if (potentialDrugs.length >= 2) {
        const interactions = checkDrugInteractions(potentialDrugs);
        
        if (interactions.length > 0) {
          return interactions.map(int => int.description).join('\n\n');
        } else {
          return "I don't have information about interactions between these specific medications. Always consult your doctor or pharmacist before taking multiple medications together.";
        }
      }
    }
    
    // General queries
    if (message.includes('hello') || message.includes('hi ') || message === 'hi') {
      return "Hello! I'm Ayushi, your AI Virtual Pharmacist Assistant. How can I help you today?";
    }
    
    if (message.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    if (message.includes('bye') || message.includes('goodbye')) {
      return "Goodbye! Feel free to ask if you have any medication questions in the future.";
    }
    
    // Default response
    return "I'm not sure I understand. You can ask me about specific medications, side effects, dosages, drug interactions, or what to do if you miss a dose.";
  };
  
  return (
    <>
      {/* Chatbot toggle button */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
        onClick={toggleChatbot}
      >
        <MedicalServicesIcon />
      </Fab>
      
      {/* Chatbot window */}
      <Zoom in={open}>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 320,
            height: 450,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicalServicesIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Ayushi Bot</Typography>
            </Box>
            <IconButton color="inherit" onClick={toggleChatbot} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Chat messages */}
          <List
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 2,
              bgcolor: 'background.paper'
            }}
          >
            {conversation.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  p: 0.5
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  {msg.sender === 'bot' && (
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 32,
                        height: 32,
                        mr: 1
                      }}
                    >
                      <MedicalServicesIcon fontSize="small" />
                    </Avatar>
                  )}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      ml: msg.sender === 'user' ? 1 : 0,
                      mr: msg.sender === 'bot' ? 1 : 0,
                      bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.100',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
          
          {/* Input area */}
          <Box
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about medications..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Tooltip title="Voice input">
              <IconButton 
                color={isListening ? "secondary" : "default"} 
                onClick={toggleListening}
                disabled={!recognition}
              >
                <MicIcon />
              </IconButton>
            </Tooltip>
            <IconButton color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Zoom>
    </>
  );
};

export default ChatBotAyushi;