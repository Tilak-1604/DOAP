import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { screenAPI, bookingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ContentSelector from './ContentSelector';
// import './ScreenDetail.css'; // Add if needed

const ScreenDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout, hasRole } = useAuth();
    const [screen, setScreen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAvailability, setShowAvailability] = useState(false);

    // Availability State
    const [availableRanges, setAvailableRanges] = useState([]);
    const [availableRangesRaw, setAvailableRangesRaw] = useState([]); // Store raw API booking objects for logic
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Booking Wizard State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [bookingStep, setBookingStep] = useState('SELECT'); // SELECT, DETAILS, PAYMENT
    const [uploadedContent, setUploadedContent] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    const fetchAvailability = async (dateStr) => {
        if (!dateStr) return;
        try {
            setCheckingAvailability(true);
            const dateOnly = dateStr.split('T')[0]; // Extract YYYY-MM-DD
            const ranges = await bookingAPI.getAvailability(screen.id, dateOnly);

            setAvailableRangesRaw(ranges); // Store raw for click handlers

            // Format ranges for display
            const formatted = ranges.map(r => {
                const start = new Date(r.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const end = new Date(r.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `${start} - ${end}`;
            });
            setAvailableRanges(formatted);
        } catch (err) {
            console.error("Failed to check availability", err);
        } finally {
            setCheckingAvailability(false);
        }
    };

    // Effect to fetch availability when start date changes
    useEffect(() => {
        if (bookingStep === 'DETAILS' && startDate && screen) { // Ensure screen is loaded
            fetchAvailability(startDate);
        }
    }, [startDate, bookingStep, screen]); // Add screen to dependency array

    const [bookingResponse, setBookingResponse] = useState(null); // Store held booking details

    const handleCreateBooking = async () => {
        if (!startDate || !endDate) {
            setBookingError("Please select both start and end times.");
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



    // Let's write the real handlePayment function assuming paymentAPI is imported.
    const handlePayment = async () => {
        if (!bookingResponse) return;
        setIsBookingLoading(true);
        setBookingError('');
        try {
            // Use paymentAPI embedded in api.js logic
            // Since I cannot easily change the top import within this single 'replace' block if it's far away,
            // I will assume I update line 3 separately.

            // To be safe, I can use the default api object if available?
            // import api from... is at top.
            // api.post('/api/payments/pay'...)

            // Actually, let's use the named import `paymentAPI` and make sure to update line 3.
            const response = await import('../services/api').then(module => module.paymentAPI.pay(bookingResponse.id));

            alert("Payment Successful! Booking Confirmed: " + bookingResponse.bookingReference);
            setShowUploadModal(false);
            setBookingStep('SELECT');
            setUploadedContent(null);
            setStartDate('');
            setEndDate('');
            setAvailableRanges([]);
            setAvailableRangesRaw([]);
            setBookingResponse(null);
        } catch (err) {
            console.error("Payment Error", err);
            setBookingError("Payment Failed. " + (err.response?.data || "Try again."));
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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading details...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (!screen) return <div style={{ padding: '20px' }}>Screen not found.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => navigate('/screens')} className="btn btn-secondary">
                    &larr; Back to Screens
                </button>
                {hasRole('ADVERTISER') && (
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                )}
            </div>

            <div className="screen-card" style={{ padding: '30px' }}>
                <div className="screen-card-header" style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <h2 style={{ margin: 0 }}>{screen.screenName}</h2>
                    <span className={`status-badge badge-success`} style={{ alignSelf: 'center' }}>
                        ACTIVE
                    </span>
                </div>

                {/* Big Placeholder Image/Video */}
                <div style={{
                    backgroundColor: '#333',
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    color: '#fff',
                    fontSize: '18px'
                }}>
                    Screen Preview (Placeholder)
                </div>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div>
                        <h3>Location</h3>
                        <p><strong>City:</strong> {screen.city}</p>
                        <p><strong>Area:</strong> {screen.location ? screen.location : `${screen.address}, ${screen.pincode}`}</p>
                        {/* Fallback usage of screen.location if address/pincode separate fields are empty in legacy data */}
                        <p><strong>Area:</strong> {screen.location ? screen.location : `${screen.address}, ${screen.pincode}`}</p>
                    </div>
                    <div>
                        <h3>Technical Specs</h3>
                        <p><strong>Type:</strong> {screen.screenType}</p>
                        <p><strong>Dimension:</strong> {screen.screenWidth}x{screen.screenHeight}</p>
                        <p><strong>Resolution:</strong> {screen.resolutionWidth}x{screen.resolutionHeight}</p>
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3>Description</h3>
                    <p>{screen.description}</p>
                </div>

                <hr style={{ margin: '30px 0' }} />

                {/* Pricing & Availability Section */}
                <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <h3>Booking & Availability</h3>

                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#555' }}>
                        Pricing will be calculated at booking time.
                    </p>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        {hasRole('ADVERTISER') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowUploadModal(true)}
                                style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                            >
                                Book Screen
                            </button>
                        )}
                        {!hasRole('ADVERTISER') && (
                            <button className="btn btn-secondary" disabled style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                                Booking (Advertisers Only)
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Wizard Modal */}
            {showUploadModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '600px', maxWidth: '95%',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0 }}>Book Screen: {screen.screenName}</h3>
                            <button onClick={() => { setShowUploadModal(false); setBookingStep('SELECT'); setUploadedContent(null); }}
                                style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {bookingStep === 'SELECT' && (
                            <div>
                                <h4 style={{ marginBottom: '10px' }}>Step 1: Select Advertisement Content</h4>
                                <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9em' }}>
                                    Choose from your previously uploaded and approved content.
                                </p>
                                <ContentSelector onContentSelected={(content) => {
                                    console.log("Content Selected:", content);
                                    setUploadedContent(content);
                                    setBookingStep('DETAILS');
                                }} />
                            </div>
                        )}

                        {bookingStep === 'DETAILS' && uploadedContent && (
                            <div>
                                <h4 style={{ marginBottom: '10px' }}>Step 2: Schedule & Confirm</h4>

                                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                                    <strong>✅ Content Approved</strong>
                                    {/* <br/> <small>ID: {uploadedContent.id}</small> */}
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Date</label>
                                    <input
                                        type="date"
                                        value={startDate.split('T')[0] || ''}
                                        onChange={(e) => {
                                            setStartDate(`${e.target.value}T09:00`); // Default to morning
                                            setEndDate(`${e.target.value}T11:00`);
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>

                                {startDate && (
                                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h5 style={{ margin: '0 0 10px 0', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Availability Timeline (24h)</span>
                                            {checkingAvailability && <span style={{ fontSize: '0.8em', color: '#2563eb' }}>Updating...</span>}
                                        </h5>

                                        {/* Visual Timeline Bar */}
                                        <div style={{
                                            position: 'relative', height: '40px', backgroundColor: '#fee2e2', // Default Red (Booked/Unavailable)
                                            borderRadius: '6px', overflow: 'hidden', display: 'flex', border: '1px solid #cbd5e1'
                                        }}>
                                            {/* Render Green Blocks for Available Ranges */}
                                            {availableRanges.map((range, idx) => {
                                                // Parse times to calculate % width and position
                                                // range string format: "HH:mm - HH:mm" (from fetchAvailability) -- WAIT, fetchAvailability formats it. 
                                                // Let's modify fetchAvailability to store raw objects for this visualization, or parse back.
                                                // Actually, better to store raw ranges in state.

                                                // Since we don't have raw ranges here (I need to check how fetchAvailability stores data),
                                                // I will assume I need to refactor fetchAvailability first to store RAW data in a separate state variable.
                                                return null;
                                            })}

                                            {/* Fallback Text if timeline fails */}
                                            <div style={{ position: 'absolute', width: '100%', textAlign: 'center', lineHeight: '40px', fontSize: '12px', color: '#991b1b', pointerEvents: 'none' }}>
                                                {availableRanges.length > 0 ? 'Click a green slot below to book' : 'No Access / Fully Booked'}
                                            </div>
                                        </div>

                                        {/* Clickable Slots List (Easier/Saffer Implementation than Timeline canvas for now) */}
                                        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {availableRangesRaw.map((r, i) => {
                                                const startStr = new Date(r.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                const endStr = new Date(r.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                return (
                                                    <button key={i}
                                                        onClick={() => {
                                                            // Set inputs to this slot
                                                            const s = new Date(r.start);
                                                            const e = new Date(r.end);
                                                            // Format for datetime-local input: YYYY-MM-DDTHH:mm
                                                            // Adjust for timezone offset to keep local time correct
                                                            const toLocalISO = (date) => {
                                                                const tzOffset = date.getTimezoneOffset() * 60000;
                                                                return new Date(date - tzOffset).toISOString().slice(0, 16);
                                                            };

                                                            setStartDate(toLocalISO(s));
                                                            setEndDate(toLocalISO(e));
                                                        }}
                                                        style={{
                                                            padding: '6px 12px', borderRadius: '20px', border: '1px solid #22c55e',
                                                            backgroundColor: '#dcfce7', color: '#166534', cursor: 'pointer', fontSize: '0.85em',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title="Click to select this slot"
                                                    >
                                                        {startStr} - {endStr}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From</label>
                                        <input
                                            type="datetime-local"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To</label>
                                        <input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                </div>

                                {bookingError && (
                                    <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                                        {bookingError}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setBookingStep('SELECT')}
                                        className="btn btn-secondary"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreateBooking}
                                        className="btn btn-primary"
                                        disabled={isBookingLoading}
                                        style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                                    >
                                        {isBookingLoading ? 'Processing...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 'PAYMENT' && bookingResponse && (
                            <div>
                                <h4 style={{ marginBottom: '10px', color: '#166534' }}>Step 3: Review & Pay</h4>
                                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eef2ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                                    <h5 style={{ margin: '0 0 10px 0', color: '#3730a3' }}>Booking Summary</h5>
                                    <p><strong>Screen:</strong> {screen.screenName}</p>
                                    <p><strong>Reference:</strong> {bookingResponse.bookingReference}</p>
                                    <p><strong>Time:</strong> {new Date(bookingResponse.startDatetime).toLocaleString()} - {new Date(bookingResponse.endDatetime).toLocaleString()}</p>
                                    <div style={{ marginTop: '10px', borderTop: '1px solid #c7d2fe', paddingTop: '10px', fontSize: '1.2em', fontWeight: 'bold' }}>
                                        Total Price: ₹{bookingResponse.priceAmount.toFixed(2)}
                                    </div>
                                    <small style={{ color: '#64748b' }}>Expires in 15 minutes</small>
                                </div>

                                {bookingError && (
                                    <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                                        {bookingError}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={handlePayment}
                                        className="btn btn-primary"
                                        disabled={isBookingLoading}
                                        style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontSize: '16px', padding: '10px 20px' }}
                                    >
                                        {isBookingLoading ? 'Processing Payment...' : 'Pay Now'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScreenDetail;
