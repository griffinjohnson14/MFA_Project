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
  fontSize: '0.95rem',
  outline: 'none'
};

const labelStyle = {
  fontSize: '0.8rem',
  color: '#7b8db0',
  letterSpacing: '0.06em',
  textTransform: 'uppercase'
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

function Login({ onSuccess, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);