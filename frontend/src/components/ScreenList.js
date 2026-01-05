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

  const { hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filters State
  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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

  // Filter logic
  const filteredScreens = screens.filter(screen => {
    // Backend already filters by status/role, this is for UI search filters
    const matchesCity = filterCity === '' ||
      (screen.city && screen.city.toLowerCase().includes(filterCity.toLowerCase())) ||
      (screen.pincode && screen.pincode.includes(filterCity));

    const matchesCategory = filterCategory === '' ||
      (screen.category && screen.category === filterCategory);

    return matchesCity && matchesCategory;
  });

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
        <h2>{hasRole('ADVERTISER') ? 'Discover Screens' : 'Screen Management'}</h2>
        {(hasRole('ADMIN') || hasRole('SCREEN_OWNER')) && (
          <button
            onClick={() => navigate('/screens/add')}
            className="btn btn-primary"
          >
            + Add New Screen
          </button>
        )}
        {hasRole('ADVERTISER') && (
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ marginLeft: 'auto' }}
          >
            Logout
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input
          placeholder="Search by City or PIN..."
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        >
          <option value="">All Categories</option>
          <option value="Mall">Mall</option>
          <option value="Shop">Shop</option>
          <option value="Highway">Highway</option>
          <option value="Airport">Airport</option>
          <option value="Metro Station">Metro Station</option>
          <option value="Bus Stand">Bus Stand</option>
          <option value="Office Building">Office Building</option>
          <option value="Hotel/Restaurant">Hotel/Restaurant</option>
          <option value="Other">Other</option>
        </select>
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
      {filteredScreens.length === 0 ? (
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
          {filteredScreens.map((screen) => (
            <div key={screen.id} className="screen-card">
              {/* Card Header */}
              <div className="screen-card-header">
                <h3>{screen.screenName}</h3>

                {/* Status Control for Owners/Admins */}
                {(hasRole('SCREEN_OWNER') || (hasRole('ADMIN') && screen.ownerRole === 'ADMIN')) ? (
                  <div className="status-control" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={screen.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await screenAPI.updateScreenStatus(screen.id, newStatus);
                          loadScreens(); // Refresh list
                        } catch (err) {
                          alert("Failed to update status");
                        }
                      }}
                      className={`status-select ${getStatusBadgeClass(screen.status)}`}
                      style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                      {/* REJECTED is not selectable manually, but if screen is REJECTED, show it */}
                      {screen.status === 'REJECTED' && <option value="REJECTED" disabled>REJECTED</option>}
                    </select>
                  </div>
                ) : (
                  <span className={`status-badge ${getStatusBadgeClass(screen.status)}`}>
                    {screen.status.replace('_', ' ')}
                  </span>
                )}
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

                  <div className="screen-info-item">
                    <strong>Category:</strong>
                    <p>{screen.category}</p>
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

              {/* View Details for Advertiser */}
              {hasRole('ADVERTISER') && (
                <div className="screen-card-footer">
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/screens/${screen.id}`)}
                  >
                    View Details
                  </button>
                </div>
              )}

              {/* Edit Button for Owner/Admin */}
              {(hasRole('SCREEN_OWNER') || (hasRole('ADMIN') && screen.ownerRole === 'ADMIN')) && (
                <div className="screen-card-footer" style={{ marginTop: '10px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                    onClick={() => navigate(`/screens/edit/${screen.id}`)}
                  >
                    Edit Screen
                  </button>
                </div>
              )}

              {/* Admin Approval */}
              {hasRole('ADMIN') && screen.status === 'INACTIVE' && screen.ownerRole !== 'ADMIN' && (
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
