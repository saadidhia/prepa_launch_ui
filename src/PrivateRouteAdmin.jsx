import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './components/context/AuthContext'

function PrivateRoute({ children }) {
  const { userIsAdmin } = useAuth()
  return userIsAdmin() ? children : <Navigate to="/connexion" />
}

export default PrivateRoute