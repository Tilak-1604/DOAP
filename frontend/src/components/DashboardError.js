import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardError.css';

const DashboardError = ({
    message = "Something went wrong while loading the data.",
    status,
    onRetry
}) => {
    const navigate = useNavigate();

    const is403 = status === 403;

    return (
        <div className="dashboard-error-container">
            <div className="error-content">
                <div className="error-icon">{is403 ? '🚫' : '⚠️'}</div>
                <h2 className="error-title">
                    {is403 ? 'Access Restricted' : 'Oops! An Error Occurred'}
                </h2>
                <p className="error-message">
                    {is403
                        ? "You don't have the necessary permissions to view this section. Please contact your administrator if you believe this is a mistake."
                        : message}
                </p>

                <div className="error-actions">
                    {onRetry && !is403 && (
                        <button className="btn-retry" onClick={onRetry}>
                            🔄 Try Again
                        </button>
                    )}
                    <button className="btn-back" onClick={() => navigate('/owner/dashboard')}>
                        🏠 Back to Dashboard
                    </button>
                    {is403 && (
                        <button className="btn-login" onClick={() => navigate('/login')}>
                            🔑 Re-login to Refresh Roles
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardError;
