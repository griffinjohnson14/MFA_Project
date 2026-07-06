import React, { useState } from 'react';
import axios from 'axios';

const card = {
  backgroundColor: '#1a1d2e',
  borderRadius: '12px',
  padding: '36px',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid #2a3048'
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  marginTop: '6px',
  backgroundColor: '#0f1117',
  border: '1px solid #2a3048',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '1.4rem',
  fontFamily: 'monospace',
  letterSpacing: '0.3em',
  textAlign: 'center',
  outline: 'none'
};

const buttonStyle = {
  width: '100%',
  padding: '11px',
  marginTop: '20px',
  backgroundColor: '#06d6a0',
  color: '#0f1117',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '700',
  fontSize: '0.95rem',
  cursor: 'pointer',
  letterSpacing: '0.05em'
};

// VerifyOTP component for handling two-factor authentication code submission.
function VerifyOTP({ onSuccess }) {
  // State to manage the OTP input, error feedback, and loading state.
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit the OTP to the backend for verification.
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Send the OTP to the backend for verification.
    try {
      await axios.post('https://127.0.0.1:5000/verify-otp', { otp }, { withCredentials: true });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={card}>
      <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.2rem', textAlign: 'center' }}>Verify Your Identity</h2>
      <p style={{ color: '#7b8db0', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' }}>Enter the 6-digit code sent to your email address.</p>

      {/* Display error feedback if verification fails. */}
      {error && <p style={{ color: '#ff4d5a', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</p>}

      {/* Verification form for entering the OTP code. */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.8rem', color: '#7b8db0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Verification Code</label>
          <input
            style={inputStyle}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="000000"
            required
          />
        </div>

        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
    </div>
  );
}

export default VerifyOTP;