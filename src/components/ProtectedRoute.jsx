import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If role is an array, check if user's role is included
  if (Array.isArray(role)) {
    if (!role.includes(userRole)) {
      return <Navigate to="/" />;
    }
  } 
  // If role is a string, check if it matches user's role
  else if (role && role !== userRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;