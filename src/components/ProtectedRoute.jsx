import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1">Loading...</Typography>
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has Admin role
  if (!user || !user.roles || !user.roles.includes('Admin')) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
