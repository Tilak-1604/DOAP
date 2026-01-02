import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 * 
 * For role-based protection:
 * <ProtectedRoute requiredRoles={['ADMIN']}>
 *   <AdminComponent />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, loading, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasAnyRole(requiredRoles)) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Required roles: {requiredRoles.join(', ')}</p>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

