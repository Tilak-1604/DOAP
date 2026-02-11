import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadComponent from './UploadComponent';
import AdDetailsForm from './AdDetailsForm';
import { ArrowLeft, CheckCircle, Upload, Info, PlayCircle, Image as ImageIcon, MapPin, Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdvertiserWorkflow = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedContent, setUploadedContent] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [userContent, setUserContent] = useState([]);
    const [loadingContent, setLoadingContent] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        if (location.state?.selectedContent) {
            console.log("Pre-selected content found:", location.state.selectedContent);
            setUploadedContent(location.state.selectedContent);
            setCurrentStep(2);
        } else if (currentStep === 1) {
            fetchUserContent();
        }
    }, [currentStep, location.state]);

    const handleUploadSuccess = (content) => {
        console.log('Content uploaded successfully:', content);
        setUploadedContent(content);
        // User flow: Upload -> Success -> Step 2 (Details)
        setCurrentStep(2);
    };

    const handleAdDetailsSuccess = async (details) => {
        console.log('Ad details saved successfully:', details);
        setCurrentStep(3);
        fetchRecommendations(uploadedContent.id);
    };

    const handleViewAllScreens = () => {
        navigate('/screens');
    };

    const fetchUserContent = async () => {
        setLoadingContent(true);
        try {
            const { contentAPI } = await import('../services/api');
            const data = await contentAPI.getMyContent();
            setUserContent(data);
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setLoadingContent(false);
        }
    };

    const fetchRecommendations = async (contentId) => {
        setLoadingRecommendations(true);
        try {
            console.log('🚀 Triggering Recommendation API for content:', contentId);
            const { recommendationAPI } = await import('../services/api');
            const recs = await recommendationAPI.getRecommendations(contentId);
            setRecommendations(recs);
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleContentSelect = (content) => {
        setUploadedContent(content);
        setCurrentStep(3); // Skip Details if already verified, Jump to Recommendations
        fetchRecommendations(content.id);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Create Campaign</h1>
                    <p className="text-slate-500">Select your ad content and find the perfect screens.</p>
                </div>
            </div>

            {/* Steps Progress */}
            <div className="flex items-center justify-center max-w-2xl mx-auto mb-8">
                {['Select Content', 'Ad Details', 'Browse Screens'].map((label, idx) => {
                    const stepNum = idx + 1;
                    return (
                        <React.Fragment key={stepNum}>
                            <div className="flex flex-col items-center gap-2 relative z-10">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                    ${currentStep >= stepNum ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 text-slate-400'}
                                `}>
                                    {currentStep > stepNum ? <CheckCircle size={18} /> : stepNum}
                                </div>
                                <span className={`text-xs font-medium ${currentStep >= stepNum ? 'text-brand-600' : 'text-slate-400'}`}>
                                    {label}
                                </span>
                            </div>
                            {stepNum < 3 && (
                                <div className={`flex-1 h-0.5 mx-2 -mt-6 transition-colors ${currentStep > stepNum ? 'bg-brand-600' : 'bg-slate-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {!showUpload ? (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-slate-800">Select Advertisement Content</h2>
                                        <button
                                            onClick={() => setShowUpload(true)}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Upload size={18} /> Upload New Ad
                                        </button>
                                    </div>

                                    {loadingContent ? (
                                        <div className="flex justify-center py-20">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                                        </div>
                                    ) : userContent.length === 0 ? (
                                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                                            <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-700">No ads found</h3>
                                            <p className="text-slate-500 mb-6">You haven't uploaded any advertisements yet.</p>
                                            <button className="btn-secondary" onClick={() => setShowUpload(true)}>Upload Your First Ad</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {userContent.map(content => (
                                                <div
                                                    key={content.id}
                                                    onClick={() => handleContentSelect(content)}
                                                    className="group cursor-pointer relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all"
                                                >
                                                    {content.contentType === 'IMAGE' ? (
                                                        <img src={content.s3Url} alt="Ad" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <video src={content.s3Url} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                                <PlayCircle className="text-white opacity-80 group-hover:scale-110 transition-transform" size={48} />
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                                                        <div className="flex justify-between items-center">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${content.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                                {content.status}
                                                            </span>
                                                            <span className="text-[10px] opacity-80">{new Date(content.uploadTimestamp).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="max-w-3xl mx-auto">
                                    <button
                                        onClick={() => setShowUpload(false)}
                                        className="mb-6 text-slate-500 hover:text-brand-600 flex items-center gap-2 transition-colors"
                                    >
                                        <ArrowLeft size={18} /> Back to Selection
                                    </button>

                                    <div className="text-center mb-8">
                                        <h2 className="text-xl font-bold text-slate-800">Upload New Creative</h2>
                                        <p className="text-slate-500">Upload high-quality content for your campaign.</p>
                                    </div>

                                    <UploadComponent onUploadSuccess={handleUploadSuccess} />

                                    <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                                        <Info className="text-blue-500 mt-1 shrink-0" size={20} />
                                        <div className="text-sm text-blue-800 space-y-1">
                                            <p className="font-semibold">Smart Tips</p>
                                            <ul className="list-disc pl-4 space-y-1 opacity-80">
                                                <li>Use high-resolution images (1920x1080) for best results on large screens.</li>
                                                <li>Keep videos under 30 seconds to maximize engagement.</li>
                                                <li>Ensure text is large and readable from a distance.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {currentStep === 2 && uploadedContent && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 max-w-3xl mx-auto"
                        >
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium text-sm mb-4">
                                    <CheckCircle size={16} /> Content Uploaded
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Campaign Details</h2>
                                <p className="text-slate-500">Add details to help our AI recommend the best screens.</p>
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="relative w-64 aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200 group">
                                    {uploadedContent.contentType === 'IMAGE' ? (
                                        <img src={uploadedContent.s3Url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={uploadedContent.s3Url} controls className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>

                            <AdDetailsForm
                                contentId={uploadedContent.id}
                                onSubmitSuccess={handleAdDetailsSuccess}
                            />
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-800">🎯 Recommended Screens</h2>
                                <p className="text-slate-500">AI-matched screens based on your content and target audience.</p>
                            </div>

                            {loadingRecommendations ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
                                    <p className="text-slate-600 font-medium">Analyzing your content...</p>
                                    <p className="text-slate-400 text-sm">Matching with 500+ screens</p>
                                </div>
                            ) : recommendations.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recommendations.slice(0, 6).map((rec, index) => (
                                            <motion.div
                                                key={rec.screenId}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all group relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-3">
                                                    <div className="bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                                                        #{index + 1} Match
                                                    </div>
                                                </div>

                                                <h4 className="font-bold text-lg text-slate-800 pr-16 mb-1">{rec.screenName}</h4>
                                                <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                                                    <MapPin size={14} /> {rec.location || rec.city}
                                                </div>

                                                <div className="bg-slate-50 rounded-lg p-3 mb-4 space-y-2">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-500">Relevance Score</span>
                                                        <span className="font-bold text-slate-700">{(rec.score * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-brand-500 h-1.5 rounded-full transition-all duration-1000"
                                                            style={{ width: `${rec.score * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/screens/${rec.screenId}`)}
                                                    className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    View & Book <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center pt-4">
                                        <button
                                            className="btn-secondary flex items-center gap-2"
                                            onClick={handleViewAllScreens}
                                        >
                                            View All Screens <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Star className="text-slate-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">No specific recommendations</h3>
                                    <p className="text-slate-500 mb-6">We couldn't find exact matches, but we have plenty of screens.</p>
                                    <button
                                        className="btn-primary"
                                        onClick={handleViewAllScreens}
                                    >
                                        Browse All Screens
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdvertiserWorkflow;
