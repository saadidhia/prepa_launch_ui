import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './components/context/AuthContext'

function PrivateRoute({ children }) {
  const { userIsAuthenticated } = useAuth()
  return userIsAuthenticated() ? children : <Navigate to="/login" />
}

export default PrivateRoute