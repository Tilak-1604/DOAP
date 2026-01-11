import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { screenAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UploadComponent from './UploadComponent';
// import './ScreenDetail.css'; // Add if needed

const ScreenDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout, hasRole } = useAuth();
    const [screen, setScreen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAvailability, setShowAvailability] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

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
                        <p><strong>Category:</strong> {screen.category}</p>
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

                    <div style={{ marginTop: '20px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAvailability(!showAvailability)}
                        >
                            {showAvailability ? 'Hide Availability' : 'Check Availability'}
                        </button>
                    </div>

                    {/* Read-Only Availability View */}
                    {showAvailability && (
                        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <h4>Availability (Next 7 Days)</h4>
                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                                Green = Available, Red = Booked, Grey = Maintenance
                            </p>

                            {/* Mock Calendar Row */}
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {[...Array(7)].map((_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + i);
                                    // Mock logic: randomly active or booked
                                    const isAvailable = true;
                                    return (
                                        <div key={i} style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            border: '1px solid #eee',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ backgroundColor: '#f5f5f5', padding: '5px', fontSize: '12px' }}>
                                                {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                            </div>
                                            <div style={{
                                                height: '40px',
                                                backgroundColor: isAvailable ? '#d4edda' : '#f8d7da',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <span style={{ fontSize: '18px' }}>{isAvailable ? '🟢' : '🔴'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                {/* Booking Flow Trigger */}
                                {hasRole('ADVERTISER') && (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowUploadModal(true)}
                                            style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                                        >
                                            Book Screen
                                        </button>
                                    </>
                                )}
                                {!hasRole('ADVERTISER') && (
                                    <button className="btn btn-secondary" disabled style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                                        Booking (Advertisers Only)
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mock Booking & Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Book Screen: {screen.screenName}</h3>
                            <button onClick={() => setShowUploadModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <p style={{ marginBottom: '20px', color: '#555' }}>
                            Step 1: Upload your content for AI Validation.
                        </p>

                        <UploadComponent onUploadSuccess={(result) => {
                            console.log("Upload Success:", result);
                            alert("Content Approved! Proceeding to Payment (Simulated). Booking Confirmed.");
                            setShowUploadModal(false);
                            // Here we would normally navigate to Payment or Booking Confirmation
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScreenDetail;
