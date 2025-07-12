
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show a loading indicator while auth status is being verified.
  // This prevents a flicker effect of showing the login page briefly.
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  // If verification is done and user is not authenticated, redirect to login.
  // We pass the current location so we can redirect back after login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the component they were trying to access.
  return children;
};

export default ProtectedRoute;
