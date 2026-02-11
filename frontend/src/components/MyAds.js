import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, ArrowLeft, Image as ImageIcon, Video, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const MyAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadAds();
    }, [user]);

    const loadAds = async () => {
        try {
            setLoading(true);
            const data = await contentAPI.getMyContent();
            setAds(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200',
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
                        <h1 className="text-2xl font-bold text-slate-900">My Creatives</h1>
                        <p className="text-slate-500 text-sm">Manage your uploaded advertisement content</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/create-ad')}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    <span>Upload New Ad</span>
                </button>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader size={32} className="text-brand-600 animate-spin" />
                </div>
            ) : ads.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <ImageIcon size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No content yet</h3>
                    <p className="text-slate-500 mb-6">Upload your first image or video advertisement to get started.</p>
                    <button
                        onClick={() => navigate('/create-ad')}
                        className="text-brand-600 font-medium hover:underline"
                    >
                        Create your first ad &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ads.map((ad, index) => (
                        <motion.div
                            key={ad.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-brand-200 transition-all duration-300 overflow-hidden"
                        >
                            {/* Preview Area */}
                            <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                                {ad.contentType === 'IMAGE' ? (
                                    <img
                                        src={ad.s3Url}
                                        alt="Ad Creative"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <video
                                        src={ad.s3Url}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute top-2 right-2">
                                    <StatusBadge status={ad.status} />
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center gap-1.5">
                                    {ad.contentType === 'IMAGE' ? <ImageIcon size={12} /> : <Video size={12} />}
                                    {ad.contentType}
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 truncate pr-2" title={ad.url || 'Untitled Campaign'}>
                                        {/* Assuming there might be a name or just using ID/Date */}
                                        Campaign #{ad.id}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 mb-4">
                                    Uploaded on {new Date(ad.createdAt || Date.now()).toLocaleDateString()}
                                </p>

                                <div className="flex gap-2">
                                    <button className="flex-1 px-3 py-2 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAds;
