import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adDetailsAPI } from '../services/api';
import './AdDetailsForm.css';

const AdDetailsForm = ({ contentId, onSubmitSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        adTitle: '',
        businessType: '',
        campaignDescription: '',
        budgetRange: '',
        preferredTimeSlot: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const businessTypes = [
        'Restaurant', 'Hotel', 'Coaching', 'Event', 'Retail',
        'Healthcare', 'Real Estate', 'Automotive', 'Technology', 'Other'
    ];

    const budgetRanges = [
        '1000-5000', '5000-10000', '10000-25000', '25000-50000', '50000+'
    ];

    const timeSlots = [
        'Morning (6 AM - 12 PM)',
        'Afternoon (12 PM - 6 PM)',
        'Evening (6 AM - 12 AM)',
        'Night (12 AM - 6 AM)',
        'All Day'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await adDetailsAPI.saveAdDetails({
                contentId: contentId,
                ...formData
            });

            if (onSubmitSuccess) {
                onSubmitSuccess(result);
            } else {
                navigate('/screens');
            }
        } catch (err) {
            console.error("AdDetails Submission Error:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save ad details';
            if (err.response) {
                console.error("Server Response:", err.response);
                if (err.response.status === 400) {
                    alert("Bad Request: " + JSON.stringify(err.response.data));
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ad-details-form-container">
            <h2>📝 Enter Advertisement Details</h2>
            <p className="form-description">
                Please provide the following details about your advertisement campaign.
            </p>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="ad-details-form">
                <div className="form-group">
                    <label htmlFor="adTitle">Ad Title *</label>
                    <input
                        type="text"
                        id="adTitle"
                        name="adTitle"
                        value={formData.adTitle}
                        onChange={handleChange}
                        placeholder="e.g., Summer Sale 2024"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="businessType">Business Type *</label>
                    <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Business Type</option>
                        {businessTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="campaignDescription">Campaign Description *</label>
                    <textarea
                        id="campaignDescription"
                        name="campaignDescription"
                        value={formData.campaignDescription}
                        onChange={handleChange}
                        placeholder="Describe your campaign goals and target audience..."
                        rows="4"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="budgetRange">Budget Range (₹) *</label>
                    <select
                        id="budgetRange"
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Budget Range</option>
                        {budgetRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="preferredTimeSlot">Preferred Time Slot *</label>
                    <select
                        id="preferredTimeSlot"
                        name="preferredTimeSlot"
                        value={formData.preferredTimeSlot}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Time Slot</option>
                        {timeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdDetailsForm;
