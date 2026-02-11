import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import './AdminRevenue.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminRevenue = () => {
    const [revenue, setRevenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRevenue();
    }, []);

    const fetchRevenue = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getRevenueBreakdown();
            setRevenue(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch revenue:', err);
            setError('Failed to load revenue analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Analyzing financial data...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!revenue) return null;

    // Prepare Chart Data
    const months = Object.keys(revenue.monthlyTotalRevenue).sort();

    const lineChartData = {
        labels: months,
        datasets: [
            {
                label: 'Total DOAP Revenue',
                data: months.map(m => revenue.monthlyTotalRevenue[m]),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
            }
        ]
    };

    const doughnutData = {
        labels: ['Platform Commission (25%)', 'Direct Revenue (100%)'],
        datasets: [
            {
                data: [revenue.totalDoapCommission, revenue.revenueFromDoapScreens],
                backgroundColor: ['#6366f1', '#10b981'],
                borderWidth: 0,
                hoverOffset: 10
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: '600' }
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: { callback: (value) => '₹' + value }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return (
        <div className="admin-revenue">
            <div className="page-header">
                <div>
                    <h1 className="page-title">DOAP Revenue Analysis</h1>
                    <p className="page-subtitle">Platform earnings and financial growth metrics</p>
                </div>
                <div className="revenue-total-pill">
                    <span className="label">Cumulative Revenue:</span>
                    <span className="value">₹{revenue.totalDoapRevenue?.toLocaleString()}</span>
                </div>
            </div>

            <div className="revenue-stats-grid">
                <div className="stat-card">
                    <div className="card-icon spend">💸</div>
                    <div className="card-info">
                        <span className="label">Advertiser Spend</span>
                        <p className="value">₹{revenue.totalAdvertiserSpend?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="card-icon payout">🏧</div>
                    <div className="card-info">
                        <span className="label">Owner Payouts</span>
                        <p className="value">₹{revenue.totalPaidToScreenOwners?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card highlight">
                    <div className="card-icon commission">🏗️</div>
                    <div className="card-info">
                        <span className="label">DOAP Commission</span>
                        <p className="value">₹{revenue.totalDoapCommission?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card highlight">
                    <div className="card-icon direct">📱</div>
                    <div className="card-info">
                        <span className="label">Direct Revenue</span>
                        <p className="value">₹{revenue.revenueFromDoapScreens?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="revenue-charts-grid">
                <div className="chart-container main-chart">
                    <div className="chart-header">
                        <h3>Revenue Trend</h3>
                        <p>Monthly platform growth overview</p>
                    </div>
                    <div className="chart-wrapper">
                        <Line data={lineChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-container side-chart">
                    <div className="chart-header">
                        <h3>Revenue Mix</h3>
                        <p>Contribution breakdown</p>
                    </div>
                    <div className="chart-wrapper doughnut">
                        <Doughnut data={doughnutData} options={{
                            ...chartOptions,
                            scales: undefined, // Doughnut doesn't use scales
                            cutout: '70%'
                        }} />
                        <div className="doughnut-center">
                            <span className="percent">100%</span>
                            <span className="text">Total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenue;
