import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadComponent from './UploadComponent';
import AdDetailsForm from './AdDetailsForm';
import './AdvertiserWorkflow.css';

const AdvertiserWorkflow = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedContent, setUploadedContent] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    const handleUploadSuccess = (content) => {
        console.log('Content uploaded successfully:', content);
        setUploadedContent(content);
        setCurrentStep(2);
    };

    const handleAdDetailsSuccess = async (details) => {
        console.log('Ad details saved successfully:', details);

        // Fetch recommendations
        setCurrentStep(3);
        setLoadingRecommendations(true);
        try {
            console.log('🚀 Triggering Recommendation API for content:', uploadedContent.id);
            const { recommendationAPI } = await import('../services/api');
            const recs = await recommendationAPI.getRecommendations(uploadedContent.id);
            console.log('✅ Recommendations received:', recs);
            setRecommendations(recs);
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleViewAllScreens = () => {
        navigate('/screens');
    };

    return (
        <div className="advertiser-workflow-container">
            <div className="workflow-header">
                <h1>🎯 Create Your Advertisement</h1>
                <div className="workflow-steps">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Upload Content</div>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Ad Details</div>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Browse Screens</div>
                    </div>
                </div>
            </div>

            <div className="workflow-content">
                {currentStep === 1 && (
                    <div className="step-content">
                        <UploadComponent onUploadSuccess={handleUploadSuccess} />
                        <div className="info-box">
                            <h3>ℹ️ Content Guidelines</h3>
                            <ul>
                                <li>✅ Product images, food items, services</li>
                                <li>✅ Business logos and branding</li>
                                <li>❌ No human faces or selfies</li>
                                <li>❌ No inappropriate content</li>
                                <li>❌ No documents or ID cards</li>
                            </ul>
                        </div>
                    </div>
                )}

                {currentStep === 2 && uploadedContent && (
                    <div className="step-content">
                        <div className="upload-success-info">
                            <div className="success-icon">✅</div>
                            <h3>Content Validated Successfully!</h3>
                            <p>Your content has been approved by our AI validation system.</p>
                            {uploadedContent.s3Url && (
                                <div className="preview-container">
                                    {uploadedContent.contentType === 'IMAGE' ? (
                                        <img src={uploadedContent.s3Url} alt="Uploaded content" className="content-preview" />
                                    ) : (
                                        <video src={uploadedContent.s3Url} controls className="content-preview" />
                                    )}
                                </div>
                            )}
                        </div>
                        <AdDetailsForm
                            contentId={uploadedContent.id}
                            onSubmitSuccess={handleAdDetailsSuccess}
                        />
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="step-content">
                        <div className="recommendations-section">
                            <h2>🎯 Recommended Screens</h2>
                            {loadingRecommendations ? (
                                <div className="loading-recommendations">
                                    <p>Analyzing your advertisement...</p>
                                </div>
                            ) : recommendations.length > 0 ? (
                                <>
                                    <p className="rec-description">
                                        Found {recommendations.length} screens matching your campaign.
                                    </p>
                                    <div className="recommendations-grid">
                                        {recommendations.slice(0, 6).map((rec, index) => (
                                            <div key={rec.screenId} className="recommendation-card">
                                                <div className="rec-rank">#{index + 1}</div>
                                                <h4>{rec.screenName}</h4>
                                                <p className="rec-location">📍 {rec.location || rec.city}</p>
                                                <div className="rec-score">
                                                    Match: <strong>{(rec.score * 100).toFixed(0)}%</strong>
                                                </div>
                                                <button
                                                    className="btn-view-screen"
                                                    onClick={() => navigate(`/screens/${rec.screenId}`)}
                                                >
                                                    View & Book
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleViewAllScreens}
                                    >
                                        View All Screens
                                    </button>
                                </>
                            ) : (
                                <div className="no-recommendations">
                                    <p>No recommendations available.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleViewAllScreens}
                                    >
                                        Browse All Screens
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="workflow-footer">
                <button
                    className="back-btn"
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AdvertiserWorkflow;
