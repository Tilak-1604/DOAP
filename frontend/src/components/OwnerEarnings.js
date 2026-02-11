import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import DashboardError from './DashboardError';
import './OwnerEarnings.css';

const OwnerEarnings = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await ownerAPI.getEarnings();
            console.log(res);
            setData(res);
        } catch (error) {
            console.error("Failed to fetch earnings", error);
            setError({
                status: error.response?.status,
                message: error.response?.data?.message || "Could not retrieve your earnings data."
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading earnings details...</div>;

    if (error) {
        return <DashboardError
            status={error.status}
            message={error.message}
            onRetry={fetchEarnings}
        />;
    }

    if (!data) return <div className="empty-state">No earnings records found.</div>;

    return (
        <div className="owner-earnings-page">
            <header className="page-header">
                <h1>💰 Earnings Overview</h1>
                <p>Track your revenue performance and payout status.</p>
            </header>

            {/* Earnings Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">₹{data.totalLifetimeEarnings?.toLocaleString()}</div>
                    <div className="stat-label">Total Lifetime Earnings</div>
                    <div className="stat-icon">📈</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">₹{data.currentMonthEarnings?.toLocaleString()}</div>
                    <div className="stat-label">This Month</div>
                    <div className="stat-icon">📅</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">₹{data.lastMonthEarnings?.toLocaleString()}</div>
                    <div className="stat-label">Last Month</div>
                    <div className="stat-icon">🔙</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#f59e0b' }}>₹{data.pendingEarnings?.toLocaleString()}</div>
                    <div className="stat-label">Pending (Active Bookings)</div>
                    <div className="stat-icon">⏳</div>
                </div>
            </div>

            <div className="earnings-secondary-grid mt-8">
                {/* Payout Status Card */}
                <div className="payout-card shadow-sm border border-gray-100 rounded-xl bg-white p-6">
                    <h3 className="text-lg font-bold mb-4">🏦 Payout Status</h3>
                    <div className="payout-item flex justify-between py-3 border-b">
                        <span className="text-gray-600">Available Balance</span>
                        <span className="font-bold text-green-600">₹{data.availableBalance?.toLocaleString()}</span>
                    </div>
                    <div className="payout-item flex justify-between py-3 border-b">
                        <span className="text-gray-600">Paid Out</span>
                        <span className="font-bold text-gray-800">₹{data.paidOut?.toLocaleString()}</span>
                    </div>
                    <div className="payout-item flex justify-between py-3">
                        <span className="text-gray-600">Pending Payout</span>
                        <span className="font-bold text-orange-600">₹{data.pendingPayout?.toLocaleString()}</span>
                    </div>
                    <button className="action-btn primary w-full mt-4">Withdraw Funds</button>
                </div>

                {/* Per Screen Breakdown */}
                <div className="breakdown-card shadow-sm border border-gray-100 rounded-xl bg-white p-6">
                    <h3 className="text-lg font-bold mb-4">🖥️ Earnings per Screen</h3>
                    <div className="breakdown-list max-h-[250px] overflow-y-auto">
                        {data.screenBreakdown?.map((screen, idx) => (
                            <div key={idx} className="breakdown-item flex justify-between py-2 border-b last:border-0">
                                <span className="text-gray-700">{screen.screenName}</span>
                                <span className="font-semibold">₹{screen.earnings?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Earnings History */}
            <div className="dashboard-section mt-8">
                <div className="section-header">
                    <h3>📜 Earnings History</h3>
                </div>
                <div className="table-container shadow-sm border border-gray-200 rounded-lg bg-white overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.earningsHistory?.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No earnings history yet.</td></tr>
                            ) : (
                                [...data.earningsHistory].reverse().map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold">{item.screenName}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">#{item.bookingId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.duration}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-green-600">₹{item.amountEarned?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(item.dateCredited).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="status-badge confirmed">PAID</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerEarnings;
