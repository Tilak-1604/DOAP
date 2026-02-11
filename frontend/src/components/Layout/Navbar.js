import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ role }) => {
    const { user } = useAuth();

    return (
        <header className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40 transition-all duration-300">
            {/* Left Side: Breadcrumbs / Title */}
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {role ? role.replace('_', ' ') : 'Platform'}
                </span>
                <h1 className="text-xl font-bold text-slate-800">
                    Overview
                </h1>
            </div>

            {/* Right Side: Actions & Profile */}
            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 rounded-full bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all w-64 text-sm text-slate-600 placeholder-slate-400"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-slate-200"></div>

                {/* Profile Dropdown */}
                <div
                    onClick={() => window.location.href = `/${role === 'SCREEN_OWNER' ? 'owner' : role === 'ADMIN' ? 'admin' : 'advertiser'}/settings`}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">
                            {user?.name || (user?.email?.split('@')[0]) || 'User'}
                        </p>
                        <p className="text-xs text-slate-400">
                            {role === 'SCREEN_OWNER' ? 'Owner' : role?.charAt(0) + role?.slice(1).toLowerCase()}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                        <span className="text-brand-600 font-bold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
