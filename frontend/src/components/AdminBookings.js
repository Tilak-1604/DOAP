import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import './AdminBookings.css';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getAllBookings();
            setBookings(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to load bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading bookings...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="admin-bookings">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Booking Management</h1>
                    <p className="page-subtitle">Detailed oversight of all platform activity</p>
                </div>
                <div className="header-stats">
                    <div className="stat-pill">
                        <span className="stat-label">Total Bookings:</span>
                        <span className="stat-value">{bookings.length}</span>
                    </div>
                </div>
            </div>

            <div className="data-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ref / Date</th>
                            <th>Advertiser</th>
                            <th>Screen & Owner</th>
                            <th>Ad Content</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-table">No bookings found.</td>
                            </tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td className="booking-ref-cell">
                                        <span className="ref-code">#{booking.id}</span>
                                        <span className="date-time">{new Date(booking.bookedAt).toLocaleDateString()}</span>
                                    </td>
                                    <td>
                                        <div className="user-info">
                                            <span className="name">{booking.advertiserName}</span>
                                            <span className="email">{booking.advertiserEmail}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="screen-owner-info">
                                            <span className="screen-name">🖥️ {booking.screenName}</span>
                                            <div className="owner-detail">
                                                <span className="owner-label">Owner:</span>
                                                <span className="owner-name">{booking.ownerName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ad-content-info">
                                            <span className="ad-title">{booking.adTitle}</span>
                                            <span className={`badge ad-type-badge ${booking.adType?.toLowerCase()}`}>
                                                {booking.adType}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="price">₹{booking.priceAmount?.toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <span className={`badge status-badge ${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminBookings;
