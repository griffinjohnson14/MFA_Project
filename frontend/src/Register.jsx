import React, { useState } from 'react';
import axios from 'axios';

// Register component for user registration.
function Register({ onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle input changes and update form data state.
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
        // Send a POST request to the backend API for user registration.
        const response = await axios.post('http://127.0.0.1:5000/register', formData);
        setMessage(response.data.message);

        // Simulate a delay before calling the onSuccess callback to transition to the login screen.
        setTimeout(() => onSuccess(), 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  }

  