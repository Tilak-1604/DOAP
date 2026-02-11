import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './AdminScreens.css';

const AdminScreens = () => {
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchScreens();
    }, [activeTab]);

    const fetchScreens = async () => {
        setLoading(true);
        try {
            let data;
            if (activeTab === 'all') {
                data = await adminAPI.getAllScreens();
            } else if (activeTab === 'pending') {
                data = await adminAPI.getPendingScreens();
            } else if (activeTab === 'doap') {
                data = await adminAPI.getDoapScreens();
            }
            setScreens(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching screens:', err);
            setError('Failed to load screens. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminAPI.approveScreen(id);
            fetchScreens();
        } catch (err) {
            alert('Failed to approve screen');
        }
    };

    const handleReject = async (id) => {
        try {
            await adminAPI.rejectScreen(id);
            fetchScreens();
        } catch (err) {
            alert('Failed to reject screen');
        }
    };

    const handleSuspend = async (id) => {
        try {
            await adminAPI.suspendScreen(id);
            fetchScreens();
        } catch (err) {
            alert('Failed to suspend screen');
        }
    };

    return (
        <div className="admin-screens">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Screen Management</h1>
                    <p className="page-subtitle">Oversee all platform screens and approvals</p>
                </div>
                <button className="add-screen-btn" onClick={() => navigate('/admin/screens/create')}>
                    <span className="btn-icon">+</span> Add New Screen
                </button>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Screens
                </button>
                <button
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Approvals
                </button>
                <button
                    className={`tab-btn ${activeTab === 'doap' ? 'active' : ''}`}
                    onClick={() => setActiveTab('doap')}
                >
                    DOAP Screens
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading screens...</div>
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : (
                <div className="data-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Screen Name</th>
                                <th>Location</th>
                                <th>Type</th>
                                <th>Owner</th>
                                <th>Rate</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {screens.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-table">No screens found.</td>
                                </tr>
                            ) : (
                                screens.map(screen => (
                                    <tr key={screen.id}>
                                        <td className="screen-name-cell">
                                            <strong>{screen.screenName}</strong>
                                            <span className="screen-id">ID: {screen.id}</span>
                                        </td>
                                        <td>{screen.city}</td>
                                        <td><span className="badge type-badge">{screen.screenType}</span></td>
                                        <td>
                                            <div className="owner-info">
                                                <span className={`badge role-badge ${screen.ownerRole.toLowerCase()}`}>
                                                    {screen.ownerRole}
                                                </span>
                                                <span className="owner-name text-truncate">{screen.ownerName}</span>
                                            </div>
                                        </td>
                                        <td>₹{screen.pricePerHour}/hr</td>
                                        <td>
                                            <span className={`badge status-badge ${screen.status.toLowerCase()}`}>
                                                {screen.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            {screen.status === 'PENDING' && (
                                                <>
                                                    <button className="action-btn approve" onClick={() => handleApprove(screen.id)}>Approve</button>
                                                    <button className="action-btn reject" onClick={() => handleReject(screen.id)}>Reject</button>
                                                </>
                                            )}
                                            {screen.status === 'ACTIVE' && (
                                                <button className="action-btn suspend" onClick={() => handleSuspend(screen.id)}>Suspend</button>
                                            )}
                                            <button className="action-btn view" onClick={() => navigate(`/screens/${screen.id}`)}>View</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminScreens;
