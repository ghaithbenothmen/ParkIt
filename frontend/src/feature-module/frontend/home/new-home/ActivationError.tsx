// src/pages/ActivationError.js
import React from 'react';
import { Link } from 'react-router-dom';

const ActivationError = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Activation Failed</h1>
      <p>The activation link is invalid or has expired. Please try registering again.</p>
      <Link to="/home" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
        Go to Register
      </Link>
    </div>
  );
};

export default ActivationError;