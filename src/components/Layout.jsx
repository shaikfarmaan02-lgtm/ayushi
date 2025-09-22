import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBotAyushi from './ChatBotAyushi';
import { useSelector } from 'react-redux';

const Layout = ({ children, toggleDarkMode, darkMode }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  
  // Only show the chatbot for authenticated users
  const showChatbot = isAuthenticated && (role === 'patient' || role === 'doctor');
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <Box sx={{ 
        flexGrow: 1,
        padding: 3
      }}>
        {children}
      </Box>
      {showChatbot && <ChatBotAyushi />}
      <Footer />
    </Box>
  );
};

export default Layout;