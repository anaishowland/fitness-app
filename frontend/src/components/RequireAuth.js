import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

const RequireAuth = ({ children }) => {
  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RequireAuth; 