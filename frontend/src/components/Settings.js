import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { motion } from 'framer-motion';
import { User, Lock, Shield, Moon, Sun, Save, LogOut } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setMessage('');
            const updatedUser = await userAPI.updateProfile({ name: formData.name });
            setMessage('Profile updated successfully.');
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // In a real app, we'd update context via a setUser function exposed by AuthContext
        } catch (err) {
            setError(err.response?.data || 'Failed to update profile.');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        try {
            setError('');
            setMessage('');
            await userAPI.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            setMessage('Password changed successfully.');
            setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (err) {
            setError(err.response?.data || 'Failed to change password.');
        }
    };

    const handleLogout = () => {
        window.location.href = '/login';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account preferences and security.</p>
            </header>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2"
                >
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    {message}
                </motion.div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2"
                >
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {error}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Profile Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                            <User size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profile Information</h3>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                        </div>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                            <Save size={16} /> Save Changes
                        </button>
                    </form>
                </motion.div>

                {/* 2. Change Password */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Change Password</h3>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-lg font-medium transition-colors">
                            Change Password
                        </button>
                    </form>
                </motion.div>

                {/* 3. Security Info & Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* Security */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Security & Status</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Login Method</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">
                                    {user?.email && user.email.includes('gmail.com') ? 'Google OAuth' : 'Email/Password'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Status</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-slate-600 dark:text-slate-300">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Preferences</h3>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Dark Mode</span>
                            <button
                                onClick={toggleTheme}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                    ${theme === 'dark' ? 'bg-brand-600' : 'bg-slate-200'}
                                `}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`
                                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                        ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
