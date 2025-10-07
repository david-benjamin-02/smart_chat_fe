import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/Register';
import ChatApp from './components/ChatApp';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './components/Settings';
import VRLoader from './components/VRLoader';
import RedirectRoute from './components/RedirectRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<LoginForm />} /> */}
        <Route
          path="/"
          element={
            <RedirectRoute>
              <LoginForm />
            </RedirectRoute>
          }
        />
        <Route path="/register" element={<RegisterForm />} />
        <Route path='/settings' element={<Settings />} />
        <Route path="/loader" element={<VRLoader />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatApp />
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* <Route path="/chat" element={<ChatApp />} /> */}
      {/* </Routes> */}
    </Router >
  );
}
