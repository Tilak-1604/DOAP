import React, { useState } from 'react';
import { contentAPI } from '../services/api';

const UploadComponent = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setSuccess(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await contentAPI.uploadContent(file);
            setSuccess('Content uploaded and approved successfully!');
            setFile(null); // Reset file input
            if (onUploadSuccess) {
                onUploadSuccess(result);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setError(`Upload failed: ${err.response.data}`);
            } else {
                setError('Upload failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '500px' }}>
            <h3>Upload Content</h3>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
                Supported formats: JPG, PNG, MP4, MOV. Content is analyzed by AI for safety.
                {loading && <strong> Video processing may take up to 2 minutes...</strong>}
            </p>

            <div style={{ marginBottom: '15px' }}>
                <input type="file" onChange={handleFileChange} accept="image/*,video/mp4,video/quicktime" />
            </div>

            {error && (
                <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                    {success}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={loading || !file}
                style={{
                    padding: '10px 20px',
                    backgroundColor: loading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Analyzing & Uploading...' : 'Upload Content'}
            </button>
        </div>
    );
};

export default UploadComponent;
