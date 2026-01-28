import React, { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';
import './ContentSelector.css';

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
            console.log('Fetching user content...');
            const content = await contentAPI.getMyContent();
            console.log('Received content:', content);
            // Filter only APPROVED content
            const approvedContent = content.filter(c => c.status === 'APPROVED');
            console.log('Approved content:', approvedContent);
            setMyContent(approvedContent);
        } catch (err) {
            console.error('Failed to fetch content:', err);
            console.error('Error response:', err.response);

            // Check if it's an authentication error
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
    };

    const handleConfirm = () => {
        if (selectedContent && onContentSelected) {
            onContentSelected(selectedContent);
        }
    };

    if (loading) {
        return <div className="content-selector-loading">Loading your content...</div>;
    }

    if (error) {
        return <div className="content-selector-error">{error}</div>;
    }

    if (myContent.length === 0) {
        return (
            <div className="content-selector-empty">
                <p>📭 You haven't uploaded any content yet.</p>
                <p className="hint">Please create an advertisement first using "Create New Advertisement" from the dashboard.</p>
            </div>
        );
    }

    return (
        <div className="content-selector">
            <h4>Select Your Advertisement Content</h4>
            <p className="selector-description">
                Choose from your previously uploaded and approved content.
            </p>

            <div className="content-grid">
                {myContent.map((content) => (
                    <div
                        key={content.id}
                        className={`content-card ${selectedContent?.id === content.id ? 'selected' : ''}`}
                        onClick={() => handleSelect(content)}
                    >
                        <div className="content-preview">
                            {content.contentType === 'IMAGE' ? (
                                <img src={content.s3Url} alt="Ad content" />
                            ) : (
                                <video src={content.s3Url} />
                            )}
                        </div>
                        <div className="content-info">
                            <div className="content-type-badge">
                                {content.contentType === 'IMAGE' ? '🖼️ Image' : '🎬 Video'}
                            </div>
                            <div className="content-date">
                                Uploaded: {new Date(content.uploadedAt).toLocaleDateString()}
                            </div>
                            {selectedContent?.id === content.id && (
                                <div className="selected-indicator">✓ Selected</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="selector-actions">
                <button
                    className="btn btn-primary"
                    onClick={handleConfirm}
                    disabled={!selectedContent}
                >
                    {selectedContent ? 'Continue with Selected Content' : 'Please Select Content'}
                </button>
            </div>
        </div>
    );
};

export default ContentSelector;
