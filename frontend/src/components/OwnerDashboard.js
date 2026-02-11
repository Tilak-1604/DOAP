import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Monitor,
    CheckCircle,
    Calendar,
    DollarSign,
    Plus,
    List,
    TrendingUp,
    MapPin,
    MoreHorizontal
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalScreens: 0,
        activeScreens: 0,
        totalEarnings: 0,
        upcomingBookings: 0
    });
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const { default: api } = await import('../services/api');

            const [statsData, screensData] = await Promise.all([
                api.get('/api/screen-owner/dashboard').then(res => res.data),
                api.get('/api/screen-owner/screens').then(res => res.data)
            ]);

            setStats(statsData);
            setScreens(screensData);
        } catch (error) {
            console.error("Failed to load screen owner data", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'INACTIVE': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'UNDER_MAINTENANCE': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Chart Data Mockup (Ideally needs real historical data)
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Earnings (₹)',
                data: [0, 0, (stats.totalEarnings || 0) * 0.2, (stats.totalEarnings || 0) * 0.5, (stats.totalEarnings || 0) * 0.8, (stats.totalEarnings || 0)],
                borderColor: 'rgb(16, 185, 129)', // green-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { grid: { borderDash: [4, 4], color: '#f1f5f9' }, beginAtZero: true },
            x: { grid: { display: false } }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-accent-600">
                        Owner Dashboard
                    </h1>
                    <p className="text-slate-500 mt-2">Monitor your screens' performance and earnings.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/owner/screens')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm font-medium"
                    >
                        <List size={18} />
                        <span>Manage Screens</span>
                    </button>
                    <button
                        onClick={() => navigate('/owner/add-screen')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all font-medium"
                    >
                        <Plus size={18} />
                        <span>Add New Screen</span>
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Screens', value: stats.totalScreens, icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Active Screens', value: stats.activeScreens, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: "Today's Bookings", value: stats.upcomingBookings, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Total Earnings', value: `₹${stats.totalEarnings?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1 cursor-default group-hover:text-brand-600 transition-colors">
                                    {stat.value}
                                </h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Earnings Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-500" />
                            Earnings Overview
                        </h3>
                        <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 focus:ring-0 text-slate-600 cursor-pointer hover:bg-slate-100">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </motion.div>

                {/* Quick Actions / Tips? Or maybe recent activity list */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-brand-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h3 className="font-bold text-xl mb-2">Maximize Earnings</h3>
                        <p className="text-brand-100 mb-6 text-sm">
                            Ensure your screens are always active and maintain high uptime to attract more advertisers.
                        </p>
                        <button onClick={() => navigate('/owner/insights')} className="w-full py-2 bg-white text-brand-900 rounded-lg font-bold hover:bg-brand-50 transition-colors">
                            View Insights
                        </button>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-brand-700 opacity-50 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-brand-500 opacity-30 blur-2xl"></div>
                </motion.div>
            </div>

            {/* My Screens Table Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">My Screens</h3>
                    <button onClick={() => navigate('/owner/screens')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">View All</button>
                </div>

                {screens.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Monitor size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="mb-4">No screens added yet.</p>
                        <button onClick={() => navigate('/owner/add-screen')} className="text-brand-600 font-bold hover:underline">Add your first screen</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Screen Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Earnings</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookings</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {screens.slice(0, 5).map(screen => (
                                    <tr key={screen.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                                    <Monitor size={16} />
                                                </div>
                                                <div className="font-medium text-slate-700">{screen.screenName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <MapPin size={14} />
                                                {screen.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(screen.status)}`}>
                                                {screen.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                            ₹{screen.earnings?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {screen.bookingCount || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/owner/screens/${screen.id}`)}
                                                    className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                                                    title="View"
                                                >
                                                    <Monitor size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/owner/screens/edit/${screen.id}`)}
                                                    className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OwnerDashboard;
