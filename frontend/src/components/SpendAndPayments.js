import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import './SpendAndPayments.css';

const SpendAndPayments = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Stats
    const [totalSpend, setTotalSpend] = useState(0);
    const [thisMonthSpend, setThisMonthSpend] = useState(0);
    const [lastMonthSpend, setLastMonthSpend] = useState(0);
    const [avgSpend, setAvgSpend] = useState(0);
    const [statusCounts, setStatusCounts] = useState({ success: 0, failed: 0, pending: 0 });

    // Filters
    const [dateFilter, setDateFilter] = useState('ALL'); // '7DAYS', '30DAYS', 'ALL'
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'SUCCESS', 'FAILED', 'PENDING', 'ALL'
    const [searchQuery, setSearchQuery] = useState('');

    // Modal
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await paymentAPI.getMyHistory();
                setPayments(data);
                calculateStats(data);
                applyFilters(data, dateFilter, statusFilter, searchQuery);
            } catch (error) {
                console.error("Failed to fetch payment history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        applyFilters(payments, dateFilter, statusFilter, searchQuery);
        // eslint-disable-next-line
    }, [dateFilter, statusFilter, searchQuery, payments]);

    const calculateStats = (data) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        let total = 0;
        let thisMonth = 0;
        let lastMonthVal = 0;
        let successCount = 0;
        let failedCount = 0;
        let pendingCount = 0;

        data.forEach(p => {
            const pDate = new Date(p.createdAt || Date.now());

            if (p.status === 'SUCCESS') {
                total += p.amount;
                successCount++;

                if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
                    thisMonth += p.amount;
                }
                if (pDate.getMonth() === lastMonth && pDate.getFullYear() === lastMonthYear) {
                    lastMonthVal += p.amount;
                }
            } else if (p.status === 'FAILED') {
                failedCount++;
            } else {
                pendingCount++;
            }
        });

        setTotalSpend(total);
        setThisMonthSpend(thisMonth);
        setLastMonthSpend(lastMonthVal);
        setAvgSpend(successCount > 0 ? Math.round(total / successCount) : 0);
        setStatusCounts({ success: successCount, failed: failedCount, pending: pendingCount });
    };

    const applyFilters = (data, dFilter, sFilter, query) => {
        let filtered = [...data];
        const now = new Date();

        // Date Filter
        if (dFilter === '7DAYS') {
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
            filtered = filtered.filter(p => new Date(p.createdAt || Date.now()) >= sevenDaysAgo);
        } else if (dFilter === '30DAYS') {
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
            filtered = filtered.filter(p => new Date(p.createdAt || Date.now()) >= thirtyDaysAgo);
        }

        // Status Filter
        if (sFilter !== 'ALL') {
            filtered = filtered.filter(p => p.status === sFilter);
        }

        // Search Query
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(p =>
                (p.bookingId && p.bookingId.toString().includes(lowerQuery)) ||
                (p.transactionReference && p.transactionReference.toLowerCase().includes(lowerQuery))
            );
        }

        setFilteredPayments(filtered);
    };

    const handleViewReceipt = (payment) => {
        setSelectedPayment(payment);
        setShowReceipt(true);
    };

    const closeReceipt = () => {
        setShowReceipt(false);
        setSelectedPayment(null);
    };

    const downloadReceipt = () => {
        // Mock download - in real app, use jsPDF or backend endpoint
        alert("Downloading invoice for transaction " + selectedPayment.transactionReference);
    };

    if (loading) return <div className="loading-spinner">Loading payments...</div>;

    return (
        <div className="spend-page">
            <header className="page-header">
                <h1>Spend & Payments</h1>
                <p>Track your advertising budget and transaction history.</p>
            </header>

            <div className="summary-grid">
                {/* Total Spend */}
                <div className="spend-summary-card">
                    <div className="summary-label">Total Lifetime Spend</div>
                    <div className="summary-amount">₹{totalSpend.toLocaleString()}</div>
                    <div className="summary-trend">
                        <span>✅</span> {statusCounts.success} Successful Transactions
                    </div>
                </div>

                {/* Breakdown */}
                <div className="breakdown-card">
                    <div className="summary-label" style={{ marginBottom: '15px' }}>Spend Breakdown</div>
                    <div className="breakdown-list">
                        <div className="breakdown-item">
                            <span className="breakdown-label">This Month</span>
                            <span className="breakdown-value">₹{thisMonthSpend.toLocaleString()}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Last Month</span>
                            <span className="breakdown-value">₹{lastMonthSpend.toLocaleString()}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Average per Booking</span>
                            <span className="breakdown-value">₹{avgSpend.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Status Summary */}
                <div className="status-summary-card">
                    <div className="summary-label" style={{ marginBottom: '15px' }}>Payment Status</div>
                    <div className="status-chips">
                        <div className="status-chip success">
                            <span>✔ Successful</span>
                            <span className="chip-count">{statusCounts.success}</span>
                        </div>
                        <div className="status-chip failed">
                            <span>❌ Failed</span>
                            <span className="chip-count">{statusCounts.failed}</span>
                        </div>
                        <div className="status-chip pending">
                            <span>⏳ Pending</span>
                            <span className="chip-count">{statusCounts.pending}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="payments-table-container">
                <div className="filters-bar">
                    <div className="filter-group">
                        <label>Date Range:</label>
                        <select
                            className="filter-select"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="ALL">All Time</option>
                            <option value="30DAYS">Last 30 Days</option>
                            <option value="7DAYS">Last 7 Days</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>

                    <div className="filter-group" style={{ marginLeft: 'auto' }}>
                        <input
                            type="text"
                            placeholder="Search Booking ID or Ref..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <h3>Transaction History</h3>

                {filteredPayments.length === 0 ? (
                    <p className="empty-text">No transactions match your filters.</p>
                ) : (
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction Ref</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Booking ID</th>
                                <th>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{new Date(payment.createdAt || Date.now()).toLocaleDateString()}</td>
                                    <td className="mono-font">{payment.transactionReference || '-'}</td>
                                    <td className="amount-col">₹{payment.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${payment.status.toLowerCase()}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td>#{payment.bookingId}</td>
                                    <td>
                                        {payment.status === 'SUCCESS' && (
                                            <button
                                                className="action-btn"
                                                onClick={() => handleViewReceipt(payment)}
                                            >
                                                View Receipt
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Receipt Modal */}
            {showReceipt && selectedPayment && (
                <div className="modal-overlay" onClick={closeReceipt}>
                    <div className="receipt-modal" onClick={e => e.stopPropagation()}>
                        <div className="receipt-header">
                            <div className="receipt-logo">DOAP Ads</div>
                            <div className="receipt-title">Payment Receipt</div>
                        </div>

                        <div className="receipt-body">
                            <div className="receipt-row">
                                <span className="receipt-label">Date:</span>
                                <span className="receipt-value">{new Date(selectedPayment.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="receipt-label">Transaction ID:</span>
                                <span className="receipt-value mono-font">{selectedPayment.transactionReference}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="receipt-label">Booking ID:</span>
                                <span className="receipt-value">#{selectedPayment.bookingId}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="receipt-label">Status:</span>
                                <span className="receipt-value success">PAID</span>
                            </div>

                            <div className="receipt-total">
                                <span>Total Amount</span>
                                <span>₹{selectedPayment.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="receipt-actions">
                            <button className="btn-secondary" onClick={closeReceipt}>Close</button>
                            <button className="btn-primary" onClick={downloadReceipt}>Download PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpendAndPayments;
