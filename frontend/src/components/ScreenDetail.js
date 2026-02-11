import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { screenAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ContentSelector from './ContentSelector';
import PaymentSuccessModal from './PaymentSuccessModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Monitor,
    Maximize,
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    X,
    CreditCard,
    FileText
} from 'lucide-react';

const ScreenDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout, hasRole } = useAuth();
    const [screen, setScreen] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Availability State
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Booking Wizard State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [bookingStep, setBookingStep] = useState('SCHEDULE'); // SCHEDULE, SELECT_AD, CONFIRM, PAYMENT
    const [uploadedContent, setUploadedContent] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingResponse, setBookingResponse] = useState(null);

    const [slots, setSlots] = useState([]);

    const fetchAvailability = useCallback(async (dateStr) => {
        if (!dateStr || !screen) return;
        try {
            setCheckingAvailability(true);
            const dateOnly = dateStr.split('T')[0];
            const slotData = await bookingAPI.getSlots(screen.id, dateOnly);
            setSlots(slotData);
        } catch (err) {
            console.error("Failed to check availability", err);
        } finally {
            setCheckingAvailability(false);
        }
    }, [screen]);

    // Effect to fetch availability when start date changes
    useEffect(() => {
        if (bookingStep === 'SCHEDULE' && startDate && screen) {
            fetchAvailability(startDate);
        }
    }, [startDate, bookingStep, screen, fetchAvailability]);

    // Initialize default dates when modal opens
    useEffect(() => {
        if (showUploadModal && !startDate) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Local time adjustment
            const dateStr = now.toISOString().split('T')[0];
            setStartDate(`${dateStr}T09:00`);
            setEndDate(`${dateStr}T11:00`);
        }
    }, [showUploadModal]);

    const handleCreateBooking = async () => {
        if (!startDate || !endDate) {
            setBookingError("Please select both start and end times.");
            return;
        }
        if (!uploadedContent) {
            setBookingError("Please select an advertisement.");
            return;
        }

        setIsBookingLoading(true);
        setBookingError('');

        try {
            const bookingRequest = {
                screenId: screen.id,
                contentId: uploadedContent.id,
                startDatetime: startDate,
                endDatetime: endDate
            };

            const response = await bookingAPI.createBooking(bookingRequest);
            console.log("Booking Held:", response);
            setBookingResponse(response);
            setBookingStep('PAYMENT');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setBookingError("Booking Failed: " + err.response.data);
            } else {
                setBookingError("Booking Failed. Please check availability.");
            }
        } finally {
            setIsBookingLoading(false);
        }
    };


    const handlePayment = async () => {
        if (!bookingResponse) return;
        setIsBookingLoading(true);
        setBookingError('');

        try {
            // Check if Razorpay is loaded
            if (!window.Razorpay) {
                throw new Error("Razorpay SDK not loaded. Please refresh the page.");
            }

            const { paymentAPI } = await import('../services/api');

            // 1. Get Razorpay Key from Backend
            const keyData = await paymentAPI.getRazorpayKey();
            const razorpayKey = keyData.key;

            // 2. Create Order
            const orderData = await paymentAPI.createOrder(bookingResponse.id);

            // 3. Open Razorpay
            const options = {
                key: razorpayKey, // Use key from backend
                amount: orderData.amount,
                currency: orderData.currency,
                name: "DOAP Ads",
                description: "Booking Payment",
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: bookingResponse.id
                        });

                        console.log("Payment Verified. showing modal.");
                        setConfirmedBooking(bookingResponse);
                        setShowSuccessModal(true);
                        // Do NOT navigate yet. Modal will handle navigation.

                    } catch (verifyErr) {
                        console.error("Verification Error", verifyErr);
                        setBookingError("Payment Verification Failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "Advertiser",
                    email: "advertiser@doap.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                setBookingError("Payment Failed: " + response.error.description);
            });
            rzp1.open();

        } catch (err) {
            console.error("Payment Initiation Error", err);
            const errorMessage = err.message || err.response?.data || err.toString();
            setBookingError("Failed to initiate payment: " + errorMessage);
        } finally {
            setIsBookingLoading(false);
        }
    };

    useEffect(() => {
        loadScreenDetails();
    }, [id]);

    const loadScreenDetails = async () => {
        try {
            setLoading(true);
            const data = await screenAPI.getScreenById(id);
            setScreen(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load screen details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!screen) return <div className="p-8 text-center text-slate-500">Screen not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
            {/* Breadcrumb / Back */}
            <button onClick={() => navigate('/screens')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-4">
                <ChevronLeft size={18} />
                <span>Back to Screens</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Media & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                        {/* Placeholder Preview */}
                        <div className="h-80 bg-slate-900 relative flex items-center justify-center overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                            <Monitor size={64} className="text-slate-700 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <h1 className="text-3xl font-bold text-white mb-2">{screen.screenName}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm">
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {screen.city}, {screen.country}</span>
                                    <span className="flex items-center gap-1"><Maximize size={16} /> {screen.resolutionWidth}x{screen.resolutionHeight}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Details Tabs/Sections */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Description</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {screen.description || "No description provided for this screen."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Location Details</h3>
                                <ul className="space-y-3 text-slate-600 text-sm">
                                    <li className="flex justify-between">
                                        <span className="text-slate-400">Address:</span>
                                        <span className="text-right font-medium">{screen.address}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-slate-400">Area:</span>
                                        <span className="text-right font-medium">{screen.location || screen.pincode}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-slate-400">City:</span>
                                        <span className="text-right font-medium">{screen.city}</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Technical Specs</h3>
                                <ul className="space-y-3 text-slate-600 text-sm">
                                    <li className="flex justify-between">
                                        <span className="text-slate-400">Type:</span>
                                        <span className="text-right font-medium">{screen.screenType}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-slate-400">Orientation:</span>
                                        <span className="text-right font-medium">{screen.orientation}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-slate-400">Active Hours:</span>
                                        <span className="text-right font-medium">{screen.activeFrom} - {screen.activeTo}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sticky Booking Card */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-24"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Starting from</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-slate-800">₹500</span>
                                    <span className="text-sm text-slate-400">/hour</span>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                                ACTIVE
                            </div>
                        </div>

                        {hasRole('ADVERTISER') ? (
                            <button
                                onClick={() => {
                                    setShowUploadModal(true);
                                    setBookingStep('SCHEDULE');
                                }}
                                className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Calendar size={20} />
                                Book Now
                            </button>
                        ) : (
                            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-slate-500 text-sm">Login as Advertiser to book.</p>
                            </div>
                        )}

                        <div className="mt-6 space-y-3 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>Instant Confirmation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>High Visibility Area</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span>Verified Screen Owner</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Booking Wizard Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">Book Screen</h3>
                                    <p className="text-sm text-slate-500">{screen.screenName}</p>
                                </div>
                                <button
                                    onClick={() => { setShowUploadModal(false); setBookingStep('SCHEDULE'); }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Wizard Steps Indicator */}
                                <div className="flex items-center justify-center mb-8">
                                    {['SCHEDULE', 'SELECT_AD', 'CONFIRM', 'PAYMENT'].map((step, idx, arr) => {
                                        const currentIndex = arr.indexOf(bookingStep);
                                        const isCompleted = idx < currentIndex;
                                        const isCurrent = idx === currentIndex;

                                        return (
                                            <div key={step} className="flex items-center">
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                                    ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/40' : 'bg-slate-100 text-slate-400'}
                                                `}>
                                                    {isCompleted ? <CheckCircle size={14} /> : idx + 1}
                                                </div>
                                                {idx < arr.length - 1 && (
                                                    <div className={`w-12 h-1 rounded-full mx-2 ${isCompleted ? 'bg-green-500' : 'bg-slate-100'}`}></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Step Content */}
                                {bookingStep === 'SCHEDULE' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                                                <input
                                                    type="date"
                                                    value={startDate.split('T')[0] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setStartDate(`${val}T09:00`);
                                                        setEndDate(`${val}T11:00`);
                                                    }}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Time Range</label>
                                                <div className="flex gap-2">
                                                    <input type="time"
                                                        value={startDate.split('T')[1]}
                                                        onChange={(e) => setStartDate(`${startDate.split('T')[0]}T${e.target.value}`)}
                                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                                                    />
                                                    <span className="self-center text-slate-400">-</span>
                                                    <input type="time"
                                                        value={endDate.split('T')[1]}
                                                        onChange={(e) => setEndDate(`${endDate.split('T')[0]}T${e.target.value}`)}
                                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Availability Slots Visualization */}
                                        {startDate && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-slate-700">Availability Slots</h4>
                                                    {checkingAvailability && <span className="text-xs text-brand-600 animate-pulse">Checking...</span>}
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                                    {slots.length > 0 ? slots.map((s, i) => {
                                                        const isBooked = s.status === 'BOOKED';
                                                        return (
                                                            <button
                                                                key={i}
                                                                disabled={isBooked}
                                                                onClick={() => {
                                                                    const datePart = startDate.split('T')[0];
                                                                    const [startStr, endStr] = s.slot.split('-');
                                                                    setStartDate(`${datePart}T${startStr}:00`);
                                                                    setEndDate(`${datePart}T${endStr.trim()}:00`);
                                                                }}
                                                                className={`
                                                                    p-2 rounded-lg text-xs font-medium border transition-all
                                                                    ${isBooked
                                                                        ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed'
                                                                        : 'bg-white border-slate-200 hover:border-brand-500 hover:text-brand-600 hover:shadow-sm'}
                                                                `}
                                                            >
                                                                {s.slot}
                                                            </button>
                                                        )
                                                    }) : <span className="text-slate-400 text-sm col-span-full">No slots available for this date.</span>}
                                                </div>
                                            </div>
                                        )}

                                        {bookingError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"><AlertCircle size={16} /> {bookingError}</div>}

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={() => {
                                                    if (!startDate || !endDate) {
                                                        setBookingError("Please select a time range.");
                                                        return;
                                                    }
                                                    setBookingError('');
                                                    setBookingStep('SELECT_AD');
                                                }}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                Next Step <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {bookingStep === 'SELECT_AD' && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-4">
                                            <h4 className="font-bold text-lg text-slate-800">Select Advertisement</h4>
                                            <p className="text-slate-500 text-sm">Choose one of your active campaigns to display.</p>
                                        </div>

                                        <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[300px]">
                                            <ContentSelector onContentSelected={(content) => {
                                                setUploadedContent(content);
                                                setBookingStep('CONFIRM');
                                            }} />
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <button onClick={() => setBookingStep('SCHEDULE')} className="btn-secondary">Back</button>
                                        </div>
                                    </div>
                                )}

                                {bookingStep === 'CONFIRM' && uploadedContent && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
                                            <h4 className="font-bold text-blue-900 flex items-center gap-2"><FileText size={20} /> Booking Summary</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                                                <div>
                                                    <span className="block text-blue-400 text-xs uppercase font-bold">Screen</span>
                                                    <span className="font-semibold">{screen.screenName}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-blue-400 text-xs uppercase font-bold">Campaign</span>
                                                    <span className="font-semibold">ID #{uploadedContent.id} ({uploadedContent.contentType})</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="block text-blue-400 text-xs uppercase font-bold">Schedule</span>
                                                    <span className="font-semibold">{new Date(startDate).toLocaleString()} — {new Date(endDate).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {bookingError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{bookingError}</div>}

                                        <div className="flex justify-between pt-4">
                                            <button onClick={() => setBookingStep('SELECT_AD')} className="btn-secondary">Back</button>
                                            <button
                                                onClick={handleCreateBooking}
                                                disabled={isBookingLoading}
                                                className="btn-primary w-full md:w-auto"
                                            >
                                                {isBookingLoading ? 'Processing...' : 'Confirm & Proceed to Payment'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {bookingStep === 'PAYMENT' && bookingResponse && (
                                    <div className="space-y-8 text-center pt-8">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={40} />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-slate-800">Booking Reserved!</h4>
                                            <p className="text-slate-500 mt-2">Please complete payment to finalize.</p>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-sm mx-auto">
                                            <span className="text-slate-500 text-sm">Total Amount</span>
                                            <div className="text-3xl font-bold text-slate-800 my-2">₹{bookingResponse.priceAmount.toFixed(2)}</div>
                                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Ref: {bookingResponse.bookingReference}</span>
                                        </div>

                                        {bookingError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{bookingError}</div>}

                                        <button
                                            onClick={handlePayment}
                                            disabled={isBookingLoading}
                                            className="w-full max-w-sm mx-auto btn-primary py-4 text-lg shadow-xl shadow-brand-500/20"
                                        >
                                            {isBookingLoading ? 'Processing Payment...' : 'Pay with Razorpay'}
                                        </button>
                                        <div className="text-xs text-slate-400 mt-4">Secure payment powered by Razorpay</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            {showSuccessModal && confirmedBooking && (
                <PaymentSuccessModal
                    booking={confirmedBooking}
                    onClose={() => {
                        setShowSuccessModal(false);
                        setShowUploadModal(false);
                        setBookingStep('SCHEDULE');
                        setUploadedContent(null);
                        setStartDate('');
                        setEndDate('');
                        setSlots([]);
                        setBookingResponse(null);
                        setConfirmedBooking(null);
                        navigate('/dashboard');
                    }}
                />
            )}
        </div>
    );
};

export default ScreenDetail;
