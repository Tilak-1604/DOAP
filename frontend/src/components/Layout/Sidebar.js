import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CreditCard,
    PieChart,
    Settings,
    Monitor,
    Calendar,
    DollarSign,
    TrendingUp,
    Users,
    FileText,
    LogOut,
    Menu,
    X,
    ChevronRight,
    PlusCircle
} from 'lucide-react';

const Sidebar = ({ role }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    const links = {
        ADVERTISER: [
            { path: '/advertiser/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/advertiser/spend', label: 'Spend & Payments', icon: CreditCard },
            { path: '/advertiser/stats', label: 'Statistics', icon: PieChart },
            { path: '/advertiser/settings', label: 'Settings', icon: Settings },
        ],
        SCREEN_OWNER: [
            { path: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/owner/screens', label: 'My Screens', icon: Monitor },
            { path: '/owner/bookings', label: 'Bookings', icon: Calendar },
            { path: '/owner/earnings', label: 'Earnings', icon: DollarSign },
            { path: '/owner/insights', label: 'Insights', icon: TrendingUp },
            { path: '/owner/settings', label: 'Settings', icon: Settings },
        ],
        ADMIN: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/admin/users', label: 'Users', icon: Users },
            { path: '/admin/screens', label: 'Screens', icon: Monitor },
            { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
            { path: '/admin/revenue', label: 'Revenue', icon: DollarSign },
            { path: '/admin/reports', label: 'Reports', icon: FileText },
            { path: '/admin/settings', label: 'Settings', icon: Settings },
        ]
    };

    const currentLinks = links[role] || [];

    const sidebarVariants = {
        open: { width: '280px', transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { width: '80px', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    };

    return (
        <motion.aside
            className="h-screen bg-slate-900 text-white flex flex-col shadow-2xl relative z-50 transition-colors duration-300"
            variants={sidebarVariants}
            initial="open"
            animate={isOpen ? "open" : "closed"}
        >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-500/20">
                                D
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                DOAP
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {currentLinks.map((link) => {
                    const isActive = location.pathname.startsWith(link.path);
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `
                                relative group flex items-center px-3 py-3 rounded-xl transition-all duration-300
                                ${isActive
                                    ? 'bg-brand-600/10 text-brand-400 shadow-[0_0_20px_rgba(14,165,233,0.1)]'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 w-1 h-8 bg-brand-500 rounded-r-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}

                                    <Icon size={22} className={`min-w-[22px] transition-colors ${isActive ? 'text-brand-400' : 'group-hover:text-white'}`} />

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="ml-3 font-medium whitespace-nowrap"
                                            >
                                                {link.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {!isOpen && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                            {link.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800/50">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300
                        ${isOpen ? 'justify-start' : 'justify-center'}
                    `}
                >
                    <LogOut size={20} />
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="ml-3 font-medium"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
