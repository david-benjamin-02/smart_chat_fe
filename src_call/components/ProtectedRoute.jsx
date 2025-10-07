// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('uid');

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
