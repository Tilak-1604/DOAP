import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ScreenOwnerSidebar.css';

const ScreenOwnerSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">DOAP Screen</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/owner/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    Dashboard
                </NavLink>

                <NavLink to="/owner/screens" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🖥️</span>
                    My Screens
                </NavLink>

                <NavLink to="/owner/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📅</span>
                    Bookings
                </NavLink>

                <NavLink to="/owner/earnings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">💰</span>
                    Earnings
                </NavLink>

                <NavLink to="/owner/insights" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📈</span>
                    Insights
                </NavLink>

                <NavLink to="/owner/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">⚙️</span>
                    Settings
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-mini-profile">
                    <div className="user-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || (user?.email ? user.email.split('@')[0] : 'Owner')}</span>
                        <span className="user-role">Screen Owner</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <span>↪</span> Logout
                </button>
            </div>
        </aside>
    );
};

export default ScreenOwnerSidebar;
