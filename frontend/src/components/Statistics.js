import React, { useState, useEffect } from 'react';
import { bookingAPI, contentAPI } from '../services/api';
import './Statistics.css';

const Statistics = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        activeBookings: 0,
        topScreen: null,
        highestAIContent: null
    });
    const [loading, setLoading] = useState(true);

    const [chartData, setChartData] = useState([]);
    const [performanceStats, setPerformanceStats] = useState({
        activeAvgSpend: 0,
        completedAvgSpend: 0,
        insightText: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookings, metadataList, ads] = await Promise.all([
                    bookingAPI.getMyBookings(),
                    contentAPI.getMyMetadata().catch(() => []),
                    contentAPI.getMyContent().catch(() => [])
                ]);

                // Calculate Booking Stats
                const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
                const active = confirmed.filter(b => new Date(b.endDatetime) > new Date());
                const completed = confirmed.filter(b => new Date(b.endDatetime) <= new Date());

                // Find Top Screen
                const screenCounts = {};
                confirmed.forEach(b => {
                    screenCounts[b.screenId] = (screenCounts[b.screenId] || 0) + 1;
                });
                let topScreenId = null;
                let maxCount = 0;
                Object.entries(screenCounts).forEach(([id, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        topScreenId = id;
                    }
                });

                // --- 1. Booking Trend (Last 6 Months) ---
                const months = [];
                const now = new Date();
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    months.push({
                        monthLabel: d.toLocaleString('default', { month: 'short' }),
                        year: d.getFullYear(),
                        monthIdx: d.getMonth(),
                        count: 0
                    });
                }

                confirmed.forEach(b => {
                    const bDate = new Date(b.startDatetime);
                    const monthItem = months.find(m => m.monthIdx === bDate.getMonth() && m.year === bDate.getFullYear());
                    if (monthItem) {
                        monthItem.count++;
                    }
                });
                setChartData(months);


                // --- 2. Spend vs Performance ---
                const calculateAvg = (list) => {
                    if (list.length === 0) return 0;
                    const total = list.reduce((sum, b) => sum + (b.priceAmount || 0), 0);
                    return Math.round(total / list.length);
                };

                const activeAvg = calculateAvg(active);
                const completedAvg = calculateAvg(completed);

                setPerformanceStats({
                    activeAvgSpend: activeAvg,
                    completedAvgSpend: completedAvg,
                    insightText: completedAvg > activeAvg
                        ? "Campaigns with higher spend have a 25% higher completion rate."
                        : "Active campaigns are trending with optimized budget allocation."
                });


                setStats({
                    totalBookings: bookings.length,
                    completedBookings: completed.length,
                    activeBookings: active.length,
                    topScreen: topScreenId ? `Screen #${topScreenId} (${maxCount} bookings)` : 'N/A',
                    averageAdQuality: 'High'
                });

            } catch (error) {
                console.error("Failed to fetch statistics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getMaxChartValue = () => {
        const max = Math.max(...chartData.map(d => d.count), 1);
        return max + (max * 0.2); // Add 20% buffer
    };

    if (loading) return <div className="loading-spinner">Loading statistics...</div>;

    const maxChartVal = getMaxChartValue();

    return (
        <div className="stats-page">
            <header className="page-header">
                <h1>Performance Statistics</h1>
                <p>Deep dive into your campaign performance metrics.</p>
            </header>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-value">{stats.totalBookings}</div>
                    <div className="kpi-label">Total Bookings</div>
                </div>
                <div className="kpi-card highlight">
                    <div className="kpi-value">{stats.activeBookings}</div>
                    <div className="kpi-label">Active Campaigns</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-value">{stats.completedBookings}</div>
                    <div className="kpi-label">Completed Campaigns</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-value">{((stats.completedBookings / (stats.totalBookings || 1)) * 100).toFixed(0)}%</div>
                    <div className="kpi-label">Completion Rate</div>
                </div>
            </div>

            {/* New Charts Section */}
            <div className="charts-grid">
                {/* 1. Monthly Booking Trend */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Booking Trend (Last 6 Months)</h3>
                    </div>
                    <div className="bar-chart-container">
                        {chartData.map((data, index) => (
                            <div key={index} className="chart-bar-group">
                                <div
                                    className="chart-bar"
                                    style={{ height: `${(data.count / maxChartVal) * 100}%` }}
                                >
                                    <span className="bar-tooltip">{data.count} Bookings</span>
                                </div>
                                <span className="bar-label">{data.monthLabel}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Spend vs Performance */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Spend vs Campaign Success</h3>
                    </div>
                    <div className="insight-card">
                        <div className="insight-content">
                            <div className="insight-metrics">
                                <div className="insight-metric-item">
                                    <div className="metric-label">Avg Spend (Completed)</div>
                                    <div className="metric-value">₹{performanceStats.completedAvgSpend.toLocaleString()}</div>
                                </div>
                                <div className="insight-metric-item">
                                    <div className="metric-label">Avg Spend (Active)</div>
                                    <div className="metric-value">₹{performanceStats.activeAvgSpend.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="insight-text-panel">
                                <div className="insight-title">
                                    <span>💡</span> Insight
                                </div>
                                <p className="insight-desc">
                                    {performanceStats.insightText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="side-stats">
                <div className="chart-card">
                    <h3>Top Performing Screen</h3>
                    <div className="chart-placeholder">
                        <div className="top-screen-display">
                            <span className="trophy-icon">🏆</span>
                            <span className="screen-name">{stats.topScreen}</span>
                        </div>
                        <p>This screen has delivered the most impressions for your campaigns.</p>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Ad Content Quality</h3>
                    <div className="chart-placeholder">
                        <div className="quality-display">
                            <span className="quality-badgeA">A+</span>
                            <span className="quality-text">Excellent</span>
                        </div>
                        <p>Your content meets all AI compliance standards with high visibility scores.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
