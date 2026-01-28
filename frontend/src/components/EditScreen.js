import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { screenAPI } from '../services/api';
import './AddScreen.css'; // Reuse existing styles

const EditScreen = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // We keep the full original data to satisfy DTO validation for non-editable fields
    const [originalData, setOriginalData] = useState(null);

    const [formData, setFormData] = useState({
        screenName: '',
        description: '',
        address: '',
    });

    useEffect(() => {
        loadScreen();
    }, [id]);

    const loadScreen = async () => {
        try {
            setLoading(true);
            const data = await screenAPI.getScreenById(id);
            setOriginalData(data);
            setFormData({
                screenName: data.screenName,
                description: data.description,
                address: data.address, // "Address" in DTO matches
            });
        } catch (err) {
            setError('Failed to load screen details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Merge original data with updates to satisfy @NotNull constraints in DTO
            // The backend will enforce what actually gets updated in the DB
            const payload = {
                ...originalData,
                ...formData,
                // Ensure explicit match for critical fields if structure differs
                // screenName, description, address, category are in both
            };

            await screenAPI.updateScreen(id, payload);
            navigate('/screens');
        } catch (err) {
            console.error(err);
            setError('Failed to update screen. ' + (err.response?.data?.message || err.message));
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading screen details...</div>;

    return (
        <div className="add-screen-container">
            <div className="add-screen-card">
                <h2>Edit Screen</h2>
                <p className="subtitle">Update details for {originalData?.screenName}</p>

                {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* Editable Fields */}
                    <div className="form-section">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#444' }}>Editable Information</h3>

                        <div className="form-group">
                            <label>Screen Name</label>
                            <input
                                name="screenName"
                                value={formData.screenName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Address / Landmark</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Street address or landmark"
                            />
                            <div className="helper-text">You can update the street address or landmark. City/State/PIN cannot be changed.</div>
                        </div>



                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>
                    </div>

                    {/* Read-Only Fields */}
                    <div className="form-section" style={{ opacity: 0.7, background: '#f9f9f9' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#444' }}>Non-Editable Information</h3>

                        <div className="form-row">
                            <div className="form-col">
                                <div className="form-group">
                                    <label>City</label>
                                    <input value={originalData?.city || ''} readOnly className="read-only-input" />
                                </div>
                            </div>
                            <div className="form-col">
                                <div className="form-group">
                                    <label>PIN Code</label>
                                    <input value={originalData?.pincode || ''} readOnly className="read-only-input" />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-col">
                                <div className="form-group">
                                    <label>State</label>
                                    <input value={originalData?.state || ''} readOnly className="read-only-input" />
                                </div>
                            </div>
                            <div className="form-col">
                                <div className="form-group">
                                    <label>Country</label>
                                    <input value={originalData?.country || ''} readOnly className="read-only-input" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Owner Role</label>
                            <input value={originalData?.ownerRole || ''} readOnly className="read-only-input" />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/screens')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditScreen;
