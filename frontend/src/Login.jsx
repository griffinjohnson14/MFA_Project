import React, { useState } from 'react';
import axios from 'axios';

const card = {
  backgroundColor: '#1a1d2e',
  borderRadius: '12px',
  padding: '36px',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid #2a3048',
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
  fontSize: '0.95rem',
  outline: 'none',
};

const labelStyle = {
  fontSize: '0.8rem',
  color: '#7b8db0',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
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
  letterSpacing: '0.05em',
};

// Login component for signing in and starting the MFA flow.
function Login({ onSuccess, onRegister }) {
  // State to manage the login form values and feedback.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit the login credentials to the backend for authentication.
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedUsername = username.trim();

    try {
      await axios.post('https://127.0.0.1:5000/login', { username: trimmedUsername, password }, { withCredentials: true });
      onSuccess(trimmedUsername);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={card}>
      <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.2rem' }}>Sign In</h2>

      {/* Display any login error returned by the backend. */}
      {error && <p style={{ color: '#ff4d5a', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</p>}

      {/* Login form for entering username and password. */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ color: '#7b8db0', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>
        No account?{' '}
        <span style={{ color: '#06d6a0', cursor: 'pointer' }} onClick={onRegister}>Register here</span>
      </p>
    </div>
  );
}

export default Login;