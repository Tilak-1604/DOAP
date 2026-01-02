import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { screenAPI } from '../services/api';
import './AddScreen.css';

const AddScreen = () => {
  const [formData, setFormData] = useState({
    screenName: '',
    location: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await screenAPI.addScreen(formData);
      setSuccess('Screen added successfully! Redirecting...');
      setTimeout(() => {
        navigate('/screens');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          'Failed to add screen. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-screen-container">
      <div className="add-screen-card">
        <h2>Add New Screen</h2>
        <p className="subtitle">Create a new digital screen for advertising</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="screenName">Screen Name *</label>
            <input
              type="text"
              id="screenName"
              name="screenName"
              value={formData.screenName}
              onChange={handleChange}
              required
              placeholder="Enter screen name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <textarea
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter screen location (address, area, city)"
              rows="3"
              className="textarea-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter screen description (optional)"
              rows="4"
              className="textarea-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/screens')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Screen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScreen;

