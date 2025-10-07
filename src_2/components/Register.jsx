/*
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNext = () => {
    if (!formData.username || !formData.phone) {
      setMessage("❌ Name and phone are required.");
      return;
    }
    setMessage('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post('http://${process.env.REACT_APP_API_BASE_URL}/register', formData);
      setMessage(`✅ ${response.data.message}`);
      setTimeout(() => navigate("/settings"), 1500);
    } catch (error) {
      if (error.response) {
        setMessage(`❌ ${error.response.data.detail}`);
      } else {
        setMessage("❌ Registration failed.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Register</h2>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Full Name"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
              />
              <button type="button" onClick={handleNext} style={styles.primaryButton}>
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
              />
              <div style={styles.buttonRow}>
                <button type="button" onClick={handleBack} style={styles.secondaryButton}>← Back</button>
                <button type="submit" style={styles.primaryButton}>Register</button>
              </div>
            </>
          )}
        </form>

        {message && (
          <p style={{ color: message.startsWith("✅") ? "green" : "red", marginTop: '1rem', fontWeight: '500' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    height:"500px"
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '1.75rem',
    color: '#343a40',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '5px',
    border: '1px solid #ced4da',
    fontSize: '1rem',
  },
  // primaryButton: {
  //   width: '100%',
  //   padding: '0.75rem',
  //   border: 'none',
  //   borderRadius: '5px',
  //   backgroundColor: '#28a745',
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   cursor: 'pointer',
  //   marginTop: '0.5rem',
  // },
  // secondaryButton: {
  //   flex: 1,
  //   padding: '0.75rem',
  //   border: 'none',
  //   borderRadius: '5px',
  //   backgroundColor: '#6c757d',
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   cursor: 'pointer',
  //   marginRight: '0.5rem',
  // },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  primaryButton: {
    width: '100%',
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#28a745',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  secondaryButton: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#6c757d',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },  
};

export default Register;

*/

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNext = () => {
    if (!formData.username || !formData.phone) {
      setMessage("❌ Name and phone are required.");
      return;
    }
    setMessage('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post('http://${process.env.REACT_APP_API_BASE_URL}/register', formData);
      setMessage(`✅ ${response.data.message}`);
      setTimeout(() => navigate("/settings", { state: { uid: response.data.user_id } }), 1500);
    } catch (error) {
      if (error.response) {
        setMessage(`❌ ${error.response.data.detail}`);
      } else {
        setMessage("❌ Registration failed.");
      }
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2 className="register-heading">Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          {step === 1 && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Full Name"
                value={formData.username}
                onChange={handleChange}
                className="register-input"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="register-input"
              />
              <button type="button" onClick={handleNext} className="register-button">
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="register-input"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="register-input"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="register-input"
              />
              <div className="register-button-row">
                <button type="button" onClick={handleBack} className="register-secondary-button">
                  ← Back
                </button>
                <button type="submit" className="register-button">
                  Register
                </button>
              </div>
            </>
          )}
        </form>

        {message && (
          <p
            className="register-message"
            style={{ color: message.startsWith("✅") ? "green" : "#dc3545" }}
          >
            {message}
          </p>
        )}

        {/* Sign In link for both steps */}
        <div className="login-links">
          <Link to="/" className="login-link">
            Already registered? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
