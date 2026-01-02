import React, { useState } from 'react';
import { screenAPI } from '../services/api';
import './ApprovalButtons.css';

const ApprovalButtons = ({ screenId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApproval = async (status) => {
    setError('');
    setLoading(true);

    try {
      await screenAPI.approveScreen(screenId, status);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          `Failed to ${status === 'ACTIVE' ? 'approve' : 'reject'} screen.`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approval-buttons">
      {error && <div className="error-message-small">{error}</div>}
      <div className="approval-actions">
        <button
          onClick={() => handleApproval('ACTIVE')}
          className="btn btn-success btn-sm"
          disabled={loading}
        >
          {loading ? 'Processing...' : '✓ Approve'}
        </button>
        <button
          onClick={() => handleApproval('REJECTED')}
          className="btn btn-danger btn-sm"
          disabled={loading}
        >
          {loading ? 'Processing...' : '✗ Reject'}
        </button>
      </div>
    </div>
  );
};

export default ApprovalButtons;

