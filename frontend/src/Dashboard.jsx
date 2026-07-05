import React from 'react';
import axios from 'axios';

const card = {
  backgroundColor: '#1a1d2e',
  borderRadius: '12px',
  padding: '36px',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid #2a3048',
  textAlign: 'center',
};

const buttonStyle = {
  padding: '10px 24px',
  marginTop: '24px',
  backgroundColor: '#ff4d5a',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '700',
  fontSize: '0.9rem',
  cursor: 'pointer',
  letterSpacing: '0.05em',
};

{/* Dashboard component that displays a welcome message and provides a logout option. */}
function Dashboard({ username, onLogout }) {
  {/* Send a logout request to the backend and return the user to the login screen. */}
  async function handleLogout() {
    try {
      await axios.post('http://127.0.0.1:5000/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    }

    onLogout();
  }

  return (
    <div style={card}>
      <p style={{ fontSize: '2rem', marginBottom: '8px' }}>✓</p>
      <h2 style={{ color: '#06d6a0', fontSize: '1.2rem', marginBottom: '8px' }}>Access Granted</h2>
      <p style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '4px' }}>Welcome, <strong>{username}</strong></p>
      <p style={{ color: '#7b8db0', fontSize: '0.82rem', marginBottom: '24px' }}>Both authentication factors verified successfully.</p>

      {/* Show a short summary of the authentication steps that passed. */}
      <div
        style={{
          backgroundColor: '#0f1117',
          border: '1px solid #2a3048',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '8px',
          textAlign: 'left',
        }}
      >
        <p style={{ color: '#7b8db0', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Session Info</p>
        <p style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>⬡ Factor 1: Password verified</p>
        <p style={{ color: '#e2e8f0', fontSize: '0.85rem', marginTop: '4px' }}>⬡ Factor 2: OTP verified</p>
        <p style={{ color: '#e2e8f0', fontSize: '0.85rem', marginTop: '4px' }}>⬡ Audit log: Session recorded</p>
      </div>

      <button style={buttonStyle} onClick={handleLogout}>Sign Out</button>
    </div>
  );
}

export default Dashboard;