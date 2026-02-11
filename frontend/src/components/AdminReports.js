import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './AdminReports.css';

const AdminReports = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 16),
        end: new Date().toISOString().slice(0, 16)
    });

    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getPlatformSummary();
            setSummary(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching summary:', err);
            setError('Failed to load platform summary. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        if (!dateRange.start || !dateRange.end) {
            alert('Please select both start and end dates');
            return;
        }

        setDownloading(type);
        try {
            // Ensure strings are valid (datetime-local usually gives YYYY-MM-DDTHH:MM)
            const response = await adminAPI.exportReport(type, dateRange.start, dateRange.end);

            if (!response.data || response.data.size === 0) {
                alert('No data found for the selected period');
                return;
            }

            // Create a link to download the blob
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
            alert(`Failed to export ${type} report. Please try a different date range.`);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="admin-reports">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Platform Reports</h1>
                    <p className="page-subtitle">Generate and download comprehensive platform data</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Generating platform insights...</div>
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : (
                <>
                    <div className="summary-grid">
                        <div className="summary-card">
                            <span className="label">Total Users</span>
                            <span className="value">{summary.totalUsers || 0}</span>
                        </div>
                        <div className="summary-card">
                            <span className="label">Active Screens</span>
                            <span className="value">{summary.activeScreens || 0}</span>
                        </div>
                        <div className="summary-card">
                            <span className="label">Total Bookings</span>
                            <span className="value">{summary.totalBookings || 0}</span>
                        </div>
                        <div className="summary-card highlight">
                            <span className="label">Total Revenue</span>
                            <span className="value">₹{(summary.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="report-controls-card">
                        <h3>Custom Report Generation</h3>
                        <p>Select date range and report type to download data in CSV format</p>

                        <div className="filters-row">
                            <div className="filter-group">
                                <label>Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                />
                            </div>
                            <div className="filter-group">
                                <label>End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="export-buttons">
                            <button
                                className={`export-btn bookings ${downloading === 'bookings' ? 'busy' : ''}`}
                                onClick={() => handleExport('bookings')}
                                disabled={downloading !== null}
                            >
                                <span className="icon">{downloading === 'bookings' ? '⌛' : '📊'}</span>
                                {downloading === 'bookings' ? 'Generating CSV...' : 'Download Bookings Report'}
                            </button>
                            <button
                                className={`export-btn revenue ${downloading === 'revenue' ? 'busy' : ''}`}
                                onClick={() => handleExport('revenue')}
                                disabled={downloading !== null}
                            >
                                <span className="icon">{downloading === 'revenue' ? '⌛' : '💰'}</span>
                                {downloading === 'revenue' ? 'Generating CSV...' : 'Download Revenue Report'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReports;
