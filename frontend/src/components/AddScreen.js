import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { screenAPI } from '../services/api';
import './AddScreen.css';

const AddScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Location State
  const [pincodeStatus, setPincodeStatus] = useState('IDLE'); // IDLE, LOADING, SUCCESS, ERROR
  const [areaOptions, setAreaOptions] = useState([]);
  const [isOtherArea, setIsOtherArea] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    screenName: '',
    description: '',
    pincode: '',
    area: '', // Selected from dropdown
    customArea: '', // If "Other" selected
    landmark: '',
    city: '',
    state: '',
    country: 'India',

    // Tech Specs
    screenType: 'LED',
    orientation: 'LANDSCAPE',
    screenWidth: '',
    screenHeight: '',
    resolutionWidth: '',
    resolutionHeight: '',

    // Time Specs (HH:mm format 24h)
    activeFrom: '06:00',
    activeTo: '23:00',
  });

  const suggestions = {
    resolutions: [
      { label: 'Full HD (1920x1080)', w: 1920, h: 1080 },
      { label: '4K (3840x2160)', w: 3840, h: 2160 },
      { label: 'HD (1280x720)', w: 1280, h: 720 },
    ]
  };

  // Effect to validate PIN code when it reaches 6 digits
  useEffect(() => {
    if (formData.pincode.length === 6) {
      if (/^\d+$/.test(formData.pincode)) {
        fetchPincodeDetails(formData.pincode);
      } else {
        setError('PIN Code must contain numbers only.');
        setPincodeStatus('ERROR');
      }
    } else if (formData.pincode.length < 6) {
      // Reset if user clears/edits
      if (pincodeStatus === 'SUCCESS' || pincodeStatus === 'ERROR') {
        resetLocationFields();
      }
    }
  }, [formData.pincode]);

  const resetLocationFields = () => {
    setFormData(prev => ({
      ...prev,
      city: '',
      state: '',
      area: '',
      customArea: ''
    }));
    setAreaOptions([]);
    setPincodeStatus('IDLE');
    setError('');
  };

  const fetchPincodeDetails = async (pin) => {
    setPincodeStatus('LOADING');
    setError('');

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success') {
        const postOffices = data[0].PostOffice;
        if (postOffices && postOffices.length > 0) {
          // Auto-fill logic
          const district = postOffices[0].District;
          const state = postOffices[0].State;
          const country = postOffices[0].Country;

          // Extract areas
          const areas = postOffices.map(po => po.Name);

          setFormData(prev => ({
            ...prev,
            city: district,
            state: state,
            country: country
          }));

          setAreaOptions(areas);
          setPincodeStatus('SUCCESS');
        } else {
          throw new Error('No post office data found.');
        }
      } else {
        throw new Error('Invalid PIN code.');
      }
    } catch (err) {
      console.error(err);
      resetLocationFields();
      setPincodeStatus('ERROR');
      setError('Invalid PIN code. Location cannot be fetched.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Number only restriction for Pincode
    if (name === 'pincode') {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 6) return; // Limit to 6
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Special handling for Area dropdown
    if (name === 'area') {
      setIsOtherArea(value === 'Other');
    }

    if (error) setError('');
  };

  // Specific handler for orientation
  const handleOrientationChange = (value) => {
    setFormData(prev => ({ ...prev, orientation: value }));
  };

  const handleResolutionSelect = (res) => {
    setFormData(prev => ({
      ...prev,
      resolutionWidth: res.w,
      resolutionHeight: res.h
    }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.screenName) {
        setError('Screen Name is required.');
        return false;
      }
      if (pincodeStatus !== 'SUCCESS') {
        setError('Please enter a valid PIN code.');
        return false;
      }
      if (!formData.area) {
        setError('Please select an Area / Locality.');
        return false;
      }
      if (isOtherArea && !formData.customArea) {
        setError('Please specify the Area.');
        return false;
      }
      if (!formData.description) {
        setError('Screen Description is mandatory.');
        return false;
      }
    }
    return true;
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Construct final address line
    const finalArea = isOtherArea ? formData.customArea : formData.area;
    const finalAddress = formData.landmark
      ? `${formData.landmark}, ${finalArea}`
      : finalArea;

    try {
      const payload = {
        ...formData,
        address: finalAddress, // Combined field for backend
        screenWidth: Number(formData.screenWidth) || 0,
        screenHeight: Number(formData.screenHeight) || 0,
        resolutionWidth: Number(formData.resolutionWidth) || 0,
        resolutionHeight: Number(formData.resolutionHeight) || 0,
        // Send times directly. LocalTime in Java expects "HH:mm" or "HH:mm:ss"
        activeFrom: formData.activeFrom,
        activeTo: formData.activeTo,
        latitude: null,
        longitude: null,
      };

      await screenAPI.addScreen(payload);
      navigate('/screens');

    } catch (err) {
      console.error(err);
      setError('Failed to add screen. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="add-screen-container">
      <div className="add-screen-card">
        <h2>Add New Screen</h2>
        <p className="subtitle">
          {currentStep === 1 && "Step 1: Basic Information & Verified Location"}
          {currentStep === 2 && "Step 2: Technical Specifications"}
          {currentStep === 3 && "Step 3: Review & Submit"}
        </p>

        {/* Wizard Progress */}
        <div className="form-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
            <div className="step-label">Basic Info</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
            <div className="step-label">Tech Details</div>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={(e) => e.preventDefault()}>

          {/* STEP 1: Basic Info & Location */}
          {currentStep === 1 && (
            <div className="form-section">
              <div className="form-group">
                <label>Screen Name *</label>
                <input
                  name="screenName"
                  value={formData.screenName}
                  onChange={handleChange}
                  placeholder="e.g. Times Square LED - North Side"
                  autoFocus
                />
              </div>

              {/* PIN Code Section */}
              <div className="form-group">
                <label>PIN Code *</label>
                <div className="pincode-wrapper" style={{ position: 'relative' }}>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                    className={pincodeStatus === 'ERROR' ? 'input-error' : ''}
                  />
                  {pincodeStatus === 'LOADING' && <span className="pincode-loader">Verifying...</span>}
                  {pincodeStatus === 'SUCCESS' && <span className="pincode-success">✓ Verified</span>}
                </div>
                {pincodeStatus === 'ERROR' && <div className="helper-text error-text">Invalid PIN code. Location cannot be fetched.</div>}
                <div className="helper-text">We verify this to prevent fake locations.</div>
              </div>

              {/* Verified Location Fields - LOCKED */}
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label>City / District</label>
                    <input name="city" value={formData.city} readOnly className="read-only-input" />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label>State</label>
                    <input name="state" value={formData.state} readOnly className="read-only-input" />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label>Country</label>
                    <input name="country" value={formData.country} readOnly className="read-only-input" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Area / Locality *</label>
                <select name="area" value={formData.area} onChange={handleChange} disabled={pincodeStatus !== 'SUCCESS'}>
                  <option value="">-- Select Area --</option>
                  {areaOptions.map((area, idx) => (
                    <option key={idx} value={area}>{area}</option>
                  ))}
                  <option value="Other">Other / Not listed</option>
                </select>
              </div>

              {isOtherArea && (
                <div className="form-group">
                  <label>Specify Area Name *</label>
                  <input
                    name="customArea"
                    value={formData.customArea}
                    onChange={handleChange}
                    placeholder="Enter your locality name"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Street / Landmark / Full Address <span className="helper-text">(Optional)</span></label>
                <input
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Metro Station, Opposite Mall"
                />
              </div>

              <div className="form-group">
                <label>Screen Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the screen clearly: surroundings, visibility, nearby landmarks, traffic flow, and why this screen is effective for advertising."
                />
                <div className="helper-text">This information helps advertisers and AI systems understand the real-world impact of this screen.</div>
              </div>


            </div>
          )}

          {/* STEP 2: Tech Specs */}
          {currentStep === 2 && (
            <div className="form-section">
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label>Screen Type *</label>
                    <select name="screenType" value={formData.screenType} onChange={handleChange}>
                      <option value="LED">LED (Standard)</option>
                      <option value="LCD">LCD / Digital Signage</option>
                      <option value="BILLBOARD">Digital Billboard</option>
                      <option value="PROJECTION">Projector</option>
                    </select>
                  </div>
                </div>

                {/* NEW TIME PICKERS - LocalTime Compatible */}
                <div className="form-col">
                  <div className="form-group">
                    <label>Active Hours (Start - End)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="time"
                          name="activeFrom"
                          value={formData.activeFrom}
                          onChange={handleChange}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <span style={{ color: '#666' }}>to</span>
                      <div style={{ flex: 1 }}>
                        <input
                          type="time"
                          name="activeTo"
                          value={formData.activeTo}
                          onChange={handleChange}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Orientation *</label>
                <div className="radio-cards">
                  <label className={`radio-card ${formData.orientation === 'LANDSCAPE' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="orientation"
                      value="LANDSCAPE"
                      checked={formData.orientation === 'LANDSCAPE'}
                      onChange={() => handleOrientationChange('LANDSCAPE')}
                    />
                    <div className="radio-card-content">
                      <strong>Landscape</strong>
                      <span className="helper-text">Horizontal</span>
                    </div>
                  </label>
                  <label className={`radio-card ${formData.orientation === 'PORTRAIT' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="orientation"
                      value="PORTRAIT"
                      checked={formData.orientation === 'PORTRAIT'}
                      onChange={() => handleOrientationChange('PORTRAIT')}
                    />
                    <div className="radio-card-content">
                      <strong>Portrait</strong>
                      <span className="helper-text">Vertical</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Resolution (Pixels) *</label>
                <div className="form-row" style={{ marginBottom: '10px' }}>
                  <input
                    type="number"
                    name="resolutionWidth"
                    placeholder="Width"
                    value={formData.resolutionWidth}
                    onChange={handleChange}
                    className="form-col"
                  />
                  <span style={{ paddingTop: '15px' }}>x</span>
                  <input
                    type="number"
                    name="resolutionHeight"
                    placeholder="Height"
                    value={formData.resolutionHeight}
                    onChange={handleChange}
                    className="form-col"
                  />
                </div>
                <div className="suggestions">
                  <small>Quick Select: </small>
                  {suggestions.resolutions.map(res => (
                    <button
                      key={res.label}
                      onClick={() => handleResolutionSelect(res)}
                      className="btn-link"
                      type="button"
                      style={{ fontSize: '12px', marginRight: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {currentStep === 3 && (
            <div className="form-section">
              <div className="review-section">

                <div className="review-item">
                  <div className="review-label">Screen Name</div>
                  <div className="review-value">{formData.screenName}</div>
                </div>
                <div className="review-item">
                  <div className="review-label">Location</div>
                  <div className="review-value">
                    {isOtherArea ? formData.customArea : formData.area}, {formData.city}, {formData.state} - {formData.pincode}
                    <br />
                    <small>{formData.landmark}</small>
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-label">Type</div>
                  <div className="review-value">{formData.screenType}</div>
                </div>
                <div className="review-item">
                  <div className="review-label">Hours</div>
                  <div className="review-value">{formData.activeFrom} - {formData.activeTo}</div>
                </div>
                <div className="review-item">
                  <div className="review-label">Format</div>
                  <div className="review-value">{formData.orientation} ({formData.resolutionWidth}x{formData.resolutionHeight}px)</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p>By submitting, you confirm that the technical details provided are accurate.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={prevStep}
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/screens')}
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
              >
                Next Step
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Screen'}
              </button>
            )}
          </div>
        </form>
      </div >
    </div >
  );
};

export default AddScreen;
