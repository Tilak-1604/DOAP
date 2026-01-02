import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        // Show user-friendly error message
        const errorMessage = result.error || 'Invalid email or password';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
    }

    setLoading(false);
  };

  // Google Sign-In success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    
    try {
      // credentialResponse.credential is the ID token
      if (!credentialResponse.credential) {
        setError('Google ID Token is required');
        setLoading(false);
        return;
      }

      const result = await googleLogin(credentialResponse.credential);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    }
    
    setLoading(false);
  };

  // Google Sign-In error handler
  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to DOAP</h2>
        <p className="subtitle">Digital Out-of-Home Advertising Platform</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

