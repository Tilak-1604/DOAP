import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Monitor, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

const BookingEntryPage = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl w-full mx-auto space-y-12"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                        Start Your Campaign
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Choose your preferred workflow to begin advertising on DOAP's digital screen network.
                    </p>
                </motion.div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* OPTION 1: Content First */}
                    <motion.div
                        variants={itemVariants}
                        onClick={() => navigate('/advertiser-workflow')}
                        className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-brand-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Film size={32} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">Start with Content</h2>
                                <p className="text-slate-500 leading-relaxed">
                                    Select one of your uploaded advertisements or upload a new one, and let us recommend the best screens.
                                </p>
                            </div>

                            <div className="flex items-center text-brand-600 font-semibold group-hover:underline">
                                Select Content <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>

                    {/* OPTION 2: Screen First */}
                    <motion.div
                        variants={itemVariants}
                        onClick={() => navigate('/screens')}
                        className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Monitor size={32} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">Start with Screens</h2>
                                <p className="text-slate-500 leading-relaxed">
                                    Browse our network of screens using map or list view, filter by location, and book specific time slots.
                                </p>
                            </div>

                            <div className="flex items-center text-purple-600 font-semibold group-hover:underline">
                                Browse Screens <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Action */}
                <motion.div variants={itemVariants} className="text-center">
                    <button
                        onClick={() => navigate('/advertiser/dashboard')}
                        className="inline-flex items-center text-slate-400 hover:text-slate-600 font-medium transition-colors"
                    >
                        <X size={16} className="mr-2" />
                        Cancel and return to Dashboard
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default BookingEntryPage;
