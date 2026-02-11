import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadComponent from './UploadComponent';
import AdDetailsForm from './AdDetailsForm';
import { ArrowLeft, CheckCircle, Upload, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadAdContent = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Upload, 2: Details
    const [uploadedContent, setUploadedContent] = useState(null);

    const handleUploadSuccess = (content) => {
        console.log('Content uploaded successfully:', content);
        setUploadedContent(content);
        setStep(2);
    };

    const handleAdDetailsSuccess = (details) => {
        console.log('Ad details saved:', details);
        setStep(3);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Upload Advertisement</h1>
                    <p className="text-slate-500">Upload your creatives now and use them for bookings later.</p>
                </div>
            </div>

            {/* Steps Progress */}
            <div className="flex items-center justify-center max-w-xl mx-auto mb-8">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                            ${step >= s ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 text-slate-400'}
                        `}>
                            {step > s ? <CheckCircle size={18} /> : s}
                        </div>
                        {s < 3 && (
                            <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${step > s ? 'bg-brand-600' : 'bg-slate-100'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Upload Creative</h2>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Select an image or video file to upload. Supported formats: JPG, PNG, MP4.
                                </p>
                            </div>

                            <UploadComponent onUploadSuccess={handleUploadSuccess} />

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3">
                                <Info className="text-blue-500 mt-1 shrink-0" size={20} />
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-semibold text-slate-700">Content Guidelines</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>High-resolution images (1920x1080 recommended)</li>
                                        <li>Videos under 30 seconds</li>
                                        <li>No offensive or prohibited content</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && uploadedContent && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium text-sm mb-4">
                                    <CheckCircle size={16} /> Upload Successful
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Add Details</h2>
                                <p className="text-slate-500">Provide information to help with ad approval and targeting.</p>
                            </div>

                            <AdDetailsForm
                                contentId={uploadedContent.id}
                                onSubmitSuccess={handleAdDetailsSuccess}
                            />
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                                <CheckCircle size={48} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Complete!</h2>
                                <p className="text-slate-500 text-lg">Your advertisement has been saved to your library.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/my-ads')}
                                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all w-full sm:w-auto"
                                >
                                    View My Ads
                                </button>
                                <button
                                    onClick={() => navigate('/booking-start')}
                                    className="px-6 py-3 bg-gradient-to-r from-brand-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all w-full sm:w-auto"
                                >
                                    Create a Booking
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UploadAdContent;
