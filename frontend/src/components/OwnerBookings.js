import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import DashboardError from './DashboardError';
import './OwnerBookings.css';

const OwnerBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [stats, setStats] = useState({
        activeCount: 0,
        upcomingCount: 0,
        completedCount: 0,
        cancelledCount: 0
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ownerAPI.getBookings();
            setBookings(data);
            calculateStats(data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            setError({
                status: error.response?.status,
                message: error.response?.data?.message || "Could not retrieve your bookings."
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const now = new Date();
        const stats = {
            activeCount: data.filter(b => b.status === 'CONFIRMED' && new Date(b.startDatetime) <= now && new Date(b.endDatetime) >= now).length,
            upcomingCount: data.filter(b => b.status === 'CONFIRMED' && new Date(b.startDatetime) > now).length,
            completedCount: data.filter(b => b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.endDatetime) < now)).length,
            cancelledCount: data.filter(b => ['CANCELLED', 'EXPIRED'].includes(b.status)).length
        };
        setStats(stats);
    };

    const filteredBookings = bookings.filter(b => {
        const now = new Date();
        if (activeTab === 'ALL') return true;
        if (activeTab === 'ACTIVE') return b.status === 'CONFIRMED' && new Date(b.startDatetime) <= now && new Date(b.endDatetime) >= now;
        if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED' && new Date(b.startDatetime) > now;
        if (activeTab === 'COMPLETED') return b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.endDatetime) < now);
        if (activeTab === 'CANCELLED') return ['CANCELLED', 'EXPIRED'].includes(b.status);
        return true;
    });

    if (loading) return <div className="loading-spinner">Loading bookings...</div>;

    if (error) {
        return <DashboardError
            status={error.status}
            message={error.message}
            onRetry={fetchBookings}
        />;
    }

    return (
        <div className="owner-bookings-page">
            <header className="page-header">
                <h1>Bookings Management</h1>
                <p>Track and manage advertiser bookings for your screens.</p>
            </header>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.activeCount}</div>
                    <div className="stat-label">Active</div>
                    <div className="stat-icon">🟢</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.upcomingCount}</div>
                    <div className="stat-label">Upcoming</div>
                    <div className="stat-icon">📅</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.completedCount}</div>
                    <div className="stat-label">Completed</div>
                    <div className="stat-icon">✅</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.cancelledCount}</div>
                    <div className="stat-label">Cancelled</div>
                    <div className="stat-icon">❌</div>
                </div>
            </div>

            {/* Professional Tabs */}
            <div className="tabs-container sticky-header">
                {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Booking Table */}
            <div className="table-container shadow-sm border border-gray-200 rounded-lg bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screen / Advertiser</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 cursor-pointer">
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                    No bookings found for this category.
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors" onClick={() => setSelectedBooking(booking)}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{booking.screenName}</div>
                                        <div className="text-xs text-gray-500">{booking.advertiserName || 'Direct Advertiser'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`type-badge ${booking.contentType?.toLowerCase()}`}>
                                            {booking.contentType === 'VIDEO' ? '📹 Video' : '🖼️ Image'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-900">{new Date(booking.startDatetime).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-500">{new Date(booking.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-green-600">₹{booking.ownerEarnings}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`pay-status ${booking.paymentStatus?.toLowerCase() || 'pending'}`}>
                                            {booking.paymentStatus || 'PENDING'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {selectedBooking && (
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Booking Details</h3>
                            <button className="close-btn" onClick={() => setSelectedBooking(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Booking ID</label>
                                    <p>#{selectedBooking.id}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Screen Name</label>
                                    <p>{selectedBooking.screenName}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Advertiser</label>
                                    <p>{selectedBooking.advertiserName || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Time Slot</label>
                                    <p>{new Date(selectedBooking.startDatetime).toLocaleString()} - {new Date(selectedBooking.endDatetime).toLocaleString()}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Total Price</label>
                                    <p>₹{selectedBooking.priceAmount}</p>
                                </div>
                                <div className="detail-item highlight">
                                    <label>Your Earnings</label>
                                    <p>₹{selectedBooking.ownerEarnings}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerBookings;
