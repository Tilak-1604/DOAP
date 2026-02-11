import React from 'react';
import { bookingAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';

const PaymentSuccessModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const handleDownloadInvoice = async () => {
        try {
            const blob = await bookingAPI.downloadInvoice(booking.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${booking.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download invoice", error);
            alert("Failed to download invoice. Please try again later.");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative overflow-hidden"
                >
                    {/* Confetti placeholder or decorative background */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>

                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
                    <p className="text-slate-500 mb-8">
                        Your booking has been confirmed and is now active.
                    </p>

                    <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100 text-left space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Booking Ref</span>
                            <span className="font-mono font-medium text-slate-700">{booking.bookingReference}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Amount Paid</span>
                            <span className="font-bold text-slate-800">₹{booking.priceAmount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Date</span>
                            <span className="text-slate-700">{new Date(booking.startDatetime).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleDownloadInvoice}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all"
                        >
                            <Download size={18} /> Download Invoice
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all"
                        >
                            Go to Dashboard <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentSuccessModal;
