import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { screenAPI } from '../services/api';
import ApprovalButtons from './ApprovalButtons';
import './ScreenList.css';

const ScreenList = () => {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadScreens();
  }, []);

  const loadScreens = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await screenAPI.getAllScreens();
      setScreens(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setError('Failed to load screens. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalSuccess = () => {
    loadScreens();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'badge-success';
      case 'INACTIVE':
        return 'badge-warning';
      case 'REJECTED':
        return 'badge-danger';
      case 'UNDER_MAINTENANCE':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="screen-list-container">
        <div className="loading">Loading screens...</div>
      </div>
    );
  }

  return (
    <div className="screen-list-container">
      {/* Header */}
      <div className="screen-list-header">
        <h2>Screen Management</h2>
        {(hasRole('ADMIN') || hasRole('SCREEN_OWNER')) && (
          <button
            onClick={() => navigate('/screens/add')}
            className="btn btn-primary"
          >
            + Add New Screen
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Role info */}
      {hasRole('ADMIN') && (
        <div className="admin-info">
          <p>You are viewing <strong>all screens</strong> in the system.</p>
        </div>
      )}

      {hasRole('SCREEN_OWNER') && (
        <div className="owner-info">
          <p>You are viewing <strong>your screens</strong> only.</p>
        </div>
      )}

      {/* Empty state */}
      {screens.length === 0 ? (
        <div className="empty-state">
          <p>No screens found.</p>
          {(hasRole('ADMIN') || hasRole('SCREEN_OWNER')) && (
            <button
              onClick={() => navigate('/screens/add')}
              className="btn btn-primary"
            >
              Add Your First Screen
            </button>
          )}
        </div>
      ) : (
        <div className="screens-grid">
          {screens.map((screen) => (
            <div key={screen.id} className="screen-card">
              {/* Card Header */}
              <div className="screen-card-header">
                <h3>{screen.screenName}</h3>
                <span className={`status-badge ${getStatusBadgeClass(screen.status)}`}>
                  {screen.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="screen-card-body">
                <div className="screen-info-item">
                  <strong>Location:</strong>
                  <p>{screen.city}, {screen.country}</p>
                  <small style={{ color: '#777' }}>{screen.address} - {screen.pincode}</small>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div className="screen-info-item">
                    <strong>Type:</strong>
                    <p>{screen.screenType}</p>
                  </div>

                  <div className="screen-info-item">
                    <strong>Orientation:</strong>
                    <p>{screen.orientation}</p>
                  </div>
                </div>

                <div className="screen-info-item">
                  <strong>Resolution:</strong>
                  <p>
                    {screen.resolutionWidth} × {screen.resolutionHeight}px
                  </p>
                </div>

                <div className="screen-info-item">
                  <strong>Hours:</strong>
                  <p>{screen.activeFrom} - {screen.activeTo}</p>
                </div>

                {screen.description && (
                  <div className="screen-info-item" style={{ marginTop: '10px' }}>
                    <strong>Description:</strong>
                    <p>{screen.description}</p>
                  </div>
                )}
              </div>

              {/* Admin Approval */}
              {hasRole('ADMIN') && screen.status === 'INACTIVE' && (
                <div className="screen-card-footer">
                  <ApprovalButtons
                    screenId={screen.id}
                    onSuccess={handleApprovalSuccess}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreenList;
