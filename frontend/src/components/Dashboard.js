import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, hasRole } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const onUploadSuccess = (result) => {
    console.log("Upload Success:", result);
    alert("Upload Successful!");
  };

  useEffect(() => {
    // Removed auto-redirect for advertisers - they should use the dashboard
  }, [user, navigate]);

  const testEndpoint = async (endpointName, apiCall) => {
    setLoading(true);
    try {
      const result = await apiCall();
      setTestResults(prev => ({
        ...prev,
        [endpointName]: { success: true, message: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpointName]: {
          success: false,
          message: error.response?.data || 'Access denied'
        }
      }));
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>DOAP</h1>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.email}</span>
          <span className="user-roles">
            Roles: {user?.roles?.join(', ') || 'None'}
          </span>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Dashboard</h2>
          <div className="user-info-card">
            <h3>User Information</h3>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Roles:</strong> {user?.roles?.join(', ') || 'None'}</p>
          </div>
        </div>

        <div className="role-badges">
          {hasRole('ADMIN') && <span className="badge badge-admin">ADMIN</span>}
          {hasRole('SCREEN_OWNER') && <span className="badge badge-owner">SCREEN_OWNER</span>}
          {hasRole('ADVERTISER') && <span className="badge badge-advertiser">ADVERTISER</span>}
          {hasRole('AD_EDITOR') && <span className="badge badge-editor">AD_EDITOR</span>}
        </div>

        <div className="test-endpoints-section">
          <h3>Test Role-Based Endpoints</h3>
          <p className="section-description">
            Click the buttons below to test access to role-protected endpoints.
            You'll only be able to access endpoints for which you have the required role.
          </p>

          <div className="test-buttons">
            <button
              onClick={() => testEndpoint('public', testAPI.getPublic)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Test Public Endpoint
            </button>

            {hasRole('ADMIN') && (
              <button
                onClick={() => testEndpoint('admin', testAPI.getAdmin)}
                className="btn btn-primary"
                disabled={loading}
              >
                Test Admin Endpoint
              </button>
            )}

            {hasRole('SCREEN_OWNER') && (
              <button
                onClick={() => testEndpoint('owner', testAPI.getOwner)}
                className="btn btn-primary"
                disabled={loading}
              >
                Test Screen Owner Endpoint
              </button>
            )}

            {hasRole('ADVERTISER') && (
              <button
                onClick={() => testEndpoint('advertiser', testAPI.getAdvertiser)}
                className="btn btn-primary"
                disabled={loading}
              >
                Test Advertiser Endpoint
              </button>
            )}
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="test-results">
              <h4>Test Results:</h4>
              {Object.entries(testResults).map(([endpoint, result]) => (
                <div
                  key={endpoint}
                  className={`test-result ${result.success ? 'success' : 'error'}`}
                >
                  <strong>{endpoint.toUpperCase()}:</strong> {result.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Screen Management Quick Access */}
        {(hasRole('ADMIN') || hasRole('SCREEN_OWNER')) && (
          <div className="quick-actions-section">
            <h3>Screen Management</h3>
            <div className="quick-actions">
              <button
                onClick={() => navigate('/screens')}
                className="btn btn-primary"
              >
                View All Screens
              </button>
              <button
                onClick={() => navigate('/screens/add')}
                className="btn btn-secondary"
              >
                + Add New Screen
              </button>
            </div>
          </div>
        )}

        <div className="role-specific-sections">
          {hasRole('ADMIN') && (
            <div className="role-section admin-section">
              <h3>Admin Dashboard</h3>
              <p>You have administrator access. You can manage users, screens, and platform settings.</p>
            </div>
          )}

          {hasRole('SCREEN_OWNER') && (
            <div className="role-section owner-section">
              <h3>Screen Owner Dashboard</h3>
              <p>Manage your screens, view bookings, and track revenue.</p>
            </div>
          )}

          {hasRole('ADVERTISER') && (
            <div className="role-section advertiser-section">
              <h3>Advertiser Dashboard</h3>
              <p>Create your advertisement campaign and browse available screens.</p>
              <div className="quick-actions" style={{ marginTop: '20px' }}>
                <button
                  onClick={() => navigate('/create-ad')}
                  className="btn btn-primary"
                  style={{ marginRight: '10px' }}
                >
                  🎯 Create New Advertisement
                </button>
                <button
                  onClick={() => navigate('/screens')}
                  className="btn btn-secondary"
                >
                  📺 Browse Screens
                </button>
              </div>
            </div>
          )}

          {hasRole('AD_EDITOR') && (
            <div className="role-section editor-section">
              <h3>Ad Editor Dashboard</h3>
              <p>Review and edit advertisement content submitted by advertisers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

