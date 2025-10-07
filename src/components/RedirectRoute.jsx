// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RedirectRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('uid');
  console.log("in", isAuthenticated)
  return isAuthenticated ? <Navigate to="/chat" replace /> : children;
};

export default RedirectRoute;
