import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testAPI } from '../services/api';
import { move, motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  CreditCard,
  FileImage,
  Plus,
  Upload,
  ArrowRight,
  TrendingUp,
  Monitor
} from 'lucide-react';
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
import { Line } from 'react-chartjs-2';

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

const Dashboard = ({ hideNav }) => {
  const { user, logout, hasRole } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [, setLoading] = useState(false);
  const navigate = useNavigate();

  // Advertiser Data State
  const [bookings, setBookings] = useState([]);
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    totalSpend: 0,
    totalAds: 0,
    approvedAds: 0
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    if (hasRole('ADMIN')) {
      if (!hideNav) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
    } else if (hasRole('ADVERTISER')) {
      if (!hideNav) {
        navigate('/advertiser/dashboard', { replace: true });
        return;
      }
      fetchAdvertiserData();
    } else if (hasRole('SCREEN_OWNER')) {
      if (!hideNav) {
        navigate('/owner/dashboard', { replace: true });
        return;
      }
    }
  }, [user, hideNav]);

  const fetchAdvertiserData = async () => {
    setLoading(true);
    try {
      const { bookingAPI, contentAPI } = await import('../services/api');
      const [bookingsData, adsData] = await Promise.all([
        bookingAPI.getMyBookings().catch(err => []),
        contentAPI.getMyContent().catch(err => [])
      ]);

      setBookings(bookingsData);
      setAds(adsData);
      calculateStats(bookingsData, adsData);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsList, adsList) => {
    const now = new Date();
    const active = bookingsList.filter(b =>
      ['CONFIRMED', 'HELD'].includes(b.status) && new Date(b.endDatetime) > now
    ).length;
    const completed = bookingsList.filter(b =>
      new Date(b.endDatetime) < now && b.status === 'CONFIRMED'
    ).length;
    const spend = bookingsList
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + (b.priceAmount || 0), 0);
    const approved = adsList.filter(a => a.status === 'APPROVED').length;

    setStats({
      activeBookings: active,
      completedBookings: completed,
      totalSpend: spend,
      totalAds: adsList.length,
      approvedAds: approved
    });
  };

  const testEndpoint = async (endpointName, apiCall) => {
    // ... logic kept same ...
    setLoading(true);
    try {
      const result = await apiCall();
      setTestResults(prev => ({ ...prev, [endpointName]: { success: true, message: result } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [endpointName]: { success: false, message: error.message } }));
    }
    setLoading(false);
  };

  // Chart Data Mockup (Ideally needs real historical data)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ad Spend (₹)',
        data: [0, 0, stats.totalSpend * 0.2, stats.totalSpend * 0.5, stats.totalSpend * 0.8, stats.totalSpend],
        borderColor: 'rgb(14, 165, 233)', // brand-500
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-accent-600">
            Welcome back, {user?.name?.split(' ')[0] || 'Advertiser'}!
          </h2>
          <p className="text-slate-500 mt-2">Here's what's happening with your campaigns today.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/create-ad')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm font-medium"
          >
            <Upload size={18} />
            <span>Upload Ad</span>
          </button>
          <button
            onClick={() => navigate('/booking-start')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all font-medium"
          >
            <Plus size={18} />
            <span>New Campaign</span>
          </button>
        </div>
      </motion.div>

      {hasRole('ADVERTISER') && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Campaigns', value: stats.activeBookings, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Completed', value: stats.completedBookings, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Total Spend', value: `₹${stats.totalSpend.toLocaleString()}`, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'My Ads', value: stats.totalAds, icon: FileImage, color: 'text-orange-500', bg: 'bg-orange-50' },
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

          {/* Charts & Activity Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-brand-500" />
                  Spend Analytics
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

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Recent Ads</h3>
                <button onClick={() => navigate('/my-ads')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">View All</button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {ads.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <FileImage size={40} className="mx-auto mb-2 opacity-50" />
                    <p>No ads uploaded yet.</p>
                  </div>
                ) : (
                  ads.slice(0, 5).map(ad => (
                    <div key={ad.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                        {ad.contentType === 'IMAGE' ? (
                          <img src={ad.s3Url} alt="Ad" className="w-full h-full object-cover" />
                        ) : (
                          <video src={ad.s3Url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FileImage size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 truncate">{ad.adTitle || 'Untitled Ad'}</h4>
                        <p className="text-xs text-slate-500 capitalize">{ad.status.toLowerCase()}</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${ad.status === 'APPROVED' ? 'bg-green-500' :
                        ad.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Bookings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Recent Bookings</h3>
              <button onClick={() => navigate('/bookings')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium group">
                View All History
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Screen</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No bookings found. <button onClick={() => navigate('/booking-start')} className="text-brand-600 font-medium hover:underline">Create one?</button>
                      </td>
                    </tr>
                  ) : (
                    bookings.slice(0, 5).map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                              <Monitor size={16} />
                            </div>
                            <span className="font-medium text-slate-700">{booking.screenName || `Screen #${booking.screenId}`}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(booking.startDatetime).toLocaleDateString()}
                          <span className="text-xs text-slate-400 ml-1">
                            {new Date(booking.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-700">
                          ₹{booking.priceAmount}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                            booking.status === 'PENDING' || booking.status === 'HELD' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">Details</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Admin View (Just a simple wrapper for now, focusing on Advertiser first) */}
      {hasRole('ADMIN') && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
          <h3 className="text-red-700 font-bold mb-2">Admin Dashboard</h3>
          <p className="text-red-600">Please access the admin dashboard via the Admin Portal.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

