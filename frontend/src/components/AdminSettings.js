import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './AdminSettings.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        commissionPercentage: 25.0,
        minimumBookingDurationMinutes: 60,
        maintenanceMode: false,
        autoApproveScreens: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getSettings();
            setSettings(data);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setMessage({ type: 'error', text: 'Failed to load platform settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updated = await adminAPI.updateSettings(settings);
            setSettings(updated);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } catch (err) {
            console.error('Error saving settings:', err);
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-state">Loading settings...</div>;

    return (
        <div className="admin-settings">
            <div className="page-header">
                <h1 className="page-title">Platform Settings</h1>
                <p className="page-subtitle">Configure global platform behavior and financial rules</p>
            </div>

            {message.text && (
                <div className={`alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="settings-form">
                <div className="settings-section">
                    <h3>Financial & Booking</h3>
                    <div className="settings-grid">
                        <div className="form-group">
                            <label>Platform Commission (%)</label>
                            <div className="input-with-hint">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={settings.commissionPercentage}
                                    onChange={(e) => setSettings({ ...settings, commissionPercentage: parseFloat(e.target.value) })}
                                    required
                                />
                                <small>Percentage of advertiser spend retained by DOAP</small>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Min. Booking Duration (Minutes)</label>
                            <div className="input-with-hint">
                                <input
                                    type="number"
                                    value={settings.minimumBookingDurationMinutes}
                                    onChange={(e) => setSettings({ ...settings, minimumBookingDurationMinutes: parseInt(e.target.value) })}
                                    required
                                />
                                <small>Minimum time slot for an advertisement</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>System Policies</h3>
                    <div className="toggle-group">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <strong>Auto-Approve Screens</strong>
                                <p>Automatically approve all new screen submissions without admin review</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.autoApproveScreens}
                                    onChange={(e) => setSettings({ ...settings, autoApproveScreens: e.target.checked })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="toggle-item important">
                            <div className="toggle-info">
                                <strong>Platform Maintenance Mode</strong>
                                <p>Disable all bookings and screen uploads for users</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={fetchSettings}>Reset Changes</button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
