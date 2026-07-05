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

{/* Register component for user registration and account creation. */}
function Register({ onSuccess }) {
  {/* State to manage the registration form data and submission feedback. */}
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    email: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  {/* Handle input changes and update form data state. */}
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  {/* Submit the registration details to the backend API. */}
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/register', formData, { withCredentials: true });
      setMessage(response.data.message);
      setTimeout(() => onSuccess?.(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={card}>
      <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.2rem' }}>Create Account</h2>

      {/* Display success feedback after a successful registration. */}
      {message && <p style={{ color: '#06d6a0', fontSize: '0.85rem', marginBottom: '16px' }}>{message}</p>}

      {/* Display error feedback if registration fails. */}
      {error && <p style={{ color: '#ff4d5a', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</p>}

      {/* Registration form with input fields for username, password, phone number, and email. */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Username</label>
          <input name="username" style={inputStyle} value={formData.username} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Password</label>
          <input name="password" style={inputStyle} type="password" value={formData.password} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Phone</label>
          <input name="phone" style={inputStyle} value={formData.phone} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Email</label>
          <input name="email" style={inputStyle} type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

export default Register;
