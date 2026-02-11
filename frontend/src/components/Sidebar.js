import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">DOAP Ads</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/advertiser/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    Dashboard
                </NavLink>

                <NavLink to="/advertiser/spend" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">💰</span>
                    Spend & Payments
                </NavLink>

                <NavLink to="/advertiser/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📈</span>
                    Statistics
                </NavLink>

                <NavLink to="/advertiser/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">⚙️</span>
                    Settings
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-mini-profile">
                    <div className="user-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || (user?.email ? user.email.split('@')[0] : 'Advertiser')}</span>
                        <span className="user-role">Advertiser</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <span>↪</span> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
