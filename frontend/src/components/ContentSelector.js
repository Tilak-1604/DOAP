import React, { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';
import { Image, Video, CheckCircle, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const ContentSelector = ({ onContentSelected }) => {
    const [myContent, setMyContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);

    useEffect(() => {
        fetchMyContent();
    }, []);

    const fetchMyContent = async () => {
        try {
            setLoading(true);
            setError(null);
            const content = await contentAPI.getMyContent();
            const approvedContent = content.filter(c => c.status === 'APPROVED');
            setMyContent(approvedContent);
        } catch (err) {
            console.error('Failed to fetch content:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Authentication error. Please try logging in again.');
            } else {
                setError('Failed to load your content. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (content) => {
        setSelectedContent(content);
        if (onContentSelected) {
            onContentSelected(content);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-2"></div>
                <p>Loading your content...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">{error}</div>;
    }

    if (myContent.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Upload size={32} />
                </div>
                <h4 className="text-slate-700 font-medium text-lg">No Approved Content Found</h4>
                <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                    You haven't uploaded any content yet, or your uploads are still pending approval.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {myContent.map((content) => (
                    <motion.div
                        key={content.id}
                        onClick={() => handleSelect(content)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all
                            ${selectedContent?.id === content.id
                                ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg'
                                : 'border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md'}
                        `}
                    >
                        {/* Preview */}
                        <div className="aspect-video bg-slate-900 relative">
                            {content.contentType === 'IMAGE' ? (
                                <img src={content.s3Url} alt="Ad content" className="w-full h-full object-cover" />
                            ) : (
                                <video src={content.s3Url} className="w-full h-full object-cover" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                                <span className="text-white text-xs font-bold truncate">ID: {content.id}</span>
                            </div>

                            {/* Type Badge */}
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                {content.contentType === 'IMAGE' ? <Image size={12} /> : <Video size={12} />}
                                {content.contentType}
                            </div>
                        </div>

                        {/* Selected Indicator */}
                        {selectedContent?.id === content.id && (
                            <div className="absolute inset-0 bg-brand-500/20 z-10 flex items-center justify-center">
                                <div className="bg-white text-brand-600 rounded-full p-2 shadow-lg scale-100 animation-bounce">
                                    <CheckCircle size={24} fill="white" className="text-brand-600" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ContentSelector;
