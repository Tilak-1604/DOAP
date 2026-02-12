import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = filter === 'ALL'
                ? await adminAPI.getAllUsers()
                : await adminAPI.getUsersByRole(filter);
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (userId) => {
        try {
            await adminAPI.activateUser(userId);
            fetchUsers();
        } catch (err) {
            alert('Failed to activate user');
        }
    };

    const handleBlock = async (userId) => {
        try {
            await adminAPI.blockUser(userId);
            fetchUsers();
        } catch (err) {
            alert('Failed to block user');
        }
    };

    return (
        <div className="admin-users">
            <h1 className="page-title">User Management</h1>

            <div className="filter-tabs sticky-header p-4 -mx-4 mb-8 bg-white/95 backdrop-blur-sm z-30 border-b border-slate-200">
                <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>All Users</button>
                <button className={filter === 'ADVERTISER' ? 'active' : ''} onClick={() => setFilter('ADVERTISER')}>Advertisers</button>
                <button className={filter === 'SCREEN_OWNER' ? 'active' : ''} onClick={() => setFilter('SCREEN_OWNER')}>Screen Owners</button>
            </div>

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Roles</th>
                                <th>Stats</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.userId}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.roles.join(', ')}</td>
                                    <td>
                                        {user.numberOfScreens && <span>Screens: {user.numberOfScreens}</span>}
                                        {user.adsUploaded && <span>Ads: {user.adsUploaded}</span>}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isActive ? 'active' : 'blocked'}`}>
                                            {user.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.isActive ? (
                                            <button className="btn-block" onClick={() => handleBlock(user.userId)}>Block</button>
                                        ) : (
                                            <button className="btn-activate" onClick={() => handleActivate(user.userId)}>Activate</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
