import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import DashboardError from './DashboardError';
import './OwnerInsights.css';

const OwnerInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await ownerAPI.getInsights();
            setData(res);
        } catch (error) {
            console.error("Failed to fetch insights", error);
            setError({
                status: error.response?.status,
                message: error.response?.data?.message || "Could not retrieve your optimization insights."
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading optimization insights...</div>;

    if (error) {
        return <DashboardError
            status={error.status}
            message={error.message}
            onRetry={fetchInsights}
        />;
    }

    if (!data) return <div className="empty-state">No insights data available yet. Start booking to see patterns!</div>;

    return (
        <div className="owner-insights-page">
            <header className="page-header">
                <h1>📊 Optimization Insights</h1>
                <p>Use data to maximize your screens' potential and revenue.</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card highlight">
                    <div className="stat-value">{data.highestUtilizationRate.toFixed(1)}%</div>
                    <div className="stat-label">Avg. Utilization Rate</div>
                    <div className="stat-icon">📊</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value text-base">{data.mostBookedScreen}</div>
                    <div className="stat-label">Winner: Most Booked</div>
                    <div className="stat-icon">🏆</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value text-base">{data.leastBookedScreen}</div>
                    <div className="stat-label">Opportunity: Least Booked</div>
                    <div className="stat-icon">🔦</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{data.avgAiMatchScore?.toFixed(2)}</div>
                    <div className="stat-label">AI Relevance Score</div>
                    <div className="stat-icon">🤖</div>
                </div>
            </div>

            <div className="insights-secondary-grid mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time & Patterns */}
                <div className="info-card bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <span className="mr-2">⏰</span> Time Patterns
                    </h3>
                    <div className="insight-row flex items-center justify-between mb-4">
                        <span className="text-gray-600">Peak Time Slot</span>
                        <span className="font-bold text-blue-600">{data.peakTimeSlots}</span>
                    </div>
                    <div className="insight-row flex items-center justify-between">
                        <span className="text-gray-600">Highest Traffic Days</span>
                        <span className="font-bold text-blue-600">{data.peakDays}</span>
                    </div>
                    <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                        <strong>Strategy:</strong> Consider a 20% premium pricing for the {data.peakTimeSlots} slot on {data.peakDays}.
                    </div>
                </div>

                {/* Conversion Analytics */}
                <div className="info-card bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <span className="mr-2">🎯 Conversion Funnel</span>
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Booking Conversion Rate</span>
                                <span className="font-bold">{data.bookingConversionRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.bookingConversionRate}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Cancellation / Expiry Rate</span>
                                <span className="font-bold">{data.cancellationRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-red-400 h-2 rounded-full" style={{ width: `${data.cancellationRate}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-500 italic">
                        * High conversion rate indicates strong demand and AI matching efficiency.
                    </p>
                </div>
            </div>

            <div className="optimization-tips mt-8">
                <h3 className="text-xl font-bold mb-4">💡 Optimization Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="tip-card p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="font-bold text-green-800 mb-1">AI Recommendation</div>
                        <p className="text-sm text-green-700">Your screen <strong>{data.mostBookedScreen}</strong> has an AI match score of {data.avgAiMatchScore?.toFixed(2)}. Its visibility is optimal.</p>
                    </div>
                    <div className="tip-card p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="font-bold text-amber-800 mb-1">Pricing Insight</div>
                        <p className="text-sm text-amber-700"><strong>{data.leastBookedScreen}</strong> is underperforming. Try a limited-time 15% discount for non-peak hours to attract new advertisers.</p>
                    </div>
                    <div className="tip-card p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-bold text-blue-800 mb-1">Utilization Tip</div>
                        <p className="text-sm text-blue-700">Current utilization is {data.highestUtilizationRate.toFixed(1)}%. Target 75% by offering bulk booking discounts for weekly campaigns.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerInsights;
