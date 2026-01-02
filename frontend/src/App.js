import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

// Google OAuth Client ID - Replace with your actual Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '936617371696-paae599e42u4gtbmos1ulqs4j23d52ja.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider> // Wraps entire app   Stores:JWTUser infoRoles
        <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
            
            {/* Admin Only Route Example */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <div className="admin-page">
                    <h1>Admin Panel</h1>
                    <p>This page is only accessible to ADMIN users.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Screen Owner Only Route Example */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute requiredRoles={['SCREEN_OWNER']}>
                  <div className="owner-page">
                    <h1>Screen Owner Panel</h1>
                    <p>This page is only accessible to SCREEN_OWNER users.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Advertiser Only Route Example */}
            <Route
              path="/advertiser"
              element={
                <ProtectedRoute requiredRoles={['ADVERTISER']}>
                  <div className="advertiser-page">
                    <h1>Advertiser Panel</h1>
                    <p>This page is only accessible to ADVERTISER users.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

