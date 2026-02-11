import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getDashboardStats();
            setStats(data);
        } catch (err) {
            setError('Failed to load dashboard statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading dashboard...</div>;
    if (error) return <div className="admin-error">{error}</div>;
    if (!stats) return null;

    return (
        <div className="admin-dashboard">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Platform Overview & Statistics</p>

            <div className="stats-grid">
                {/* User Statistics */}
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <p className="stat-value">{stats.totalUsers}</p>
                        <div className="stat-breakdown">
                            <span>Advertisers: {stats.totalAdvertisers}</span>
                            <span>Owners: {stats.totalScreenOwners}</span>
                        </div>
                    </div>
                </div>

                {/* Screen Statistics */}
                <div className="stat-card">
                    <div className="stat-icon">🖥️</div>
                    <div className="stat-content">
                        <h3>Total Screens</h3>
                        <p className="stat-value">{stats.totalScreens}</p>
                        <div className="stat-breakdown">
                            <span>Owner: {stats.ownerScreens}</span>
                            <span>DOAP: {stats.doapScreens}</span>
                        </div>
                    </div>
                </div>

                {/* Booking Statistics */}
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <h3>Bookings</h3>
                        <p className="stat-value">{stats.totalBookings}</p>
                        <div className="stat-breakdown">
                            <span>Held: {stats.heldBookings}</span>
                            <span>Confirmed: {stats.confirmedBookings}</span>
                        </div>
                    </div>
                </div>

                {/* Revenue Statistics */}
                <div className="stat-card revenue-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Total Revenue</h3>
                        <p className="stat-value">₹{stats.totalDoapRevenue?.toFixed(2) || '0.00'}</p>
                        <div className="stat-breakdown">
                            <span>Commission: ₹{stats.commissionRevenue?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-insights">
                <div className="insight-section">
                    <h3>📊 Operational Insights</h3>
                    <div className="insight-grid">
                        <div className="insight-item">
                            <span className="insight-label">Booking Confirmation Rate</span>
                            <div className="insight-value-bar">
                                <div className="bar-fill" style={{ width: `${(stats.confirmedBookings / (stats.totalBookings || 1)) * 100}%` }}></div>
                                <span>{((stats.confirmedBookings / (stats.totalBookings || 1)) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="insight-item">
                            <span className="insight-label">Platform Screen Mix (DOAP vs Owners)</span>
                            <div className="insight-value-bar">
                                <div className="bar-fill doap" style={{ width: `${(stats.doapScreens / (stats.totalScreens || 1)) * 100}%` }}></div>
                                <span>{((stats.doapScreens / (stats.totalScreens || 1)) * 100).toFixed(1)}% DOAP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="quick-actions-panel">
                    <h3>⚡ Quick Reports</h3>
                    <div className="actions-grid">
                        <button onClick={() => window.location.href = '/admin/reports'} className="action-btn">
                            Download Revenue CSV
                        </button>
                        <button onClick={() => window.location.href = '/admin/reports'} className="action-btn">
                            View Platform Summary
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
