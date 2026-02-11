import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-logo">DOAP Admin</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    Dashboard
                </NavLink>

                <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">👥</span>
                    Users
                </NavLink>

                <NavLink to="/admin/screens" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🖥️</span>
                    Screens
                </NavLink>


                <NavLink to="/admin/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📅</span>
                    Bookings
                </NavLink>

                <NavLink to="/admin/revenue" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">💰</span>
                    DOAP Revenue
                </NavLink>

                <NavLink to="/admin/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📈</span>
                    Reports & Insights
                </NavLink>

                <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">⚙️</span>
                    Settings
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-mini-profile">
                    <div className="user-avatar admin-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'Admin'}</span>
                        <span className="user-role">Administrator</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <span>↪</span> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
