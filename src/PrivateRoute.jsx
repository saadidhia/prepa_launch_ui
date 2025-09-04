import React,{useContext} from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './components/context/AuthContext';
import AuthContext from "./components/context/AuthContext"

function PrivateRoute({ children, requiredRole }) {
  const { userIsAuthenticated, userHasRole } = useAuth();
  const Auth = useContext(AuthContext);

  if (!userIsAuthenticated()) {
    return <Navigate to="/connexion" />;
  }

  if (requiredRole && !userHasRole(requiredRole)) {
    Auth.userLogout()

  }

  return children;
}

export default PrivateRoute;
