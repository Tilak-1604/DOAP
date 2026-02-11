import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, ArrowLeft, Loader, CreditCard, Clock, CalendarDays, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('current');
    const navigate = useNavigate();
    const { user } = useAuth();

    const getFilteredBookings = () => {
        if (!bookings) return [];
        const now = new Date();
        if (activeTab === 'current') {
            return bookings.filter(b =>
                (b.status === 'CONFIRMED' || b.status === 'HELD') &&
                new Date(b.endDatetime) >= now
            );
        } else {
            return bookings.filter(b =>
                b.status === 'CANCELLED' ||
                b.status === 'EXPIRED' ||
                new Date(b.endDatetime) < now
            );
        }
    };

    useEffect(() => {
        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingAPI.getMyBookings();
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            HELD: 'bg-sky-100 text-sky-700 border-sky-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200',
            EXPIRED: 'bg-slate-100 text-slate-600 border-slate-200',
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/advertiser/dashboard')}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
                        <p className="text-slate-500 text-sm">Track your scheduled advertising campaigns</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                    {['current', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                                ${activeTab === tab
                                    ? 'bg-white text-brand-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }
                            `}
                        >
                            {tab} Bookings
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader size={32} className="text-brand-600 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {getFilteredBookings().length === 0 ? (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                <CalendarDays size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No {activeTab} bookings</h3>
                            <p className="text-slate-500 mb-6">You don't have any {activeTab} campaigns.</p>
                            {activeTab === 'current' && (
                                <button
                                    onClick={() => navigate('/advertiser/dashboard')}
                                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    Browse Screens
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence>
                                {getFilteredBookings().map((booking, index) => (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-slate-900">
                                                        Booking #{booking.bookingReference || booking.id}
                                                    </h3>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={16} />
                                                        Screen #{booking.screenId}
                                                    </span>
                                                    <span className="hidden sm:inline text-slate-300">|</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={16} />
                                                        {new Date(booking.startDatetime).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                                                <span className="text-lg font-bold text-slate-900">₹{booking.priceAmount}</span>
                                            </div>
                                            <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
