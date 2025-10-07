import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://${process.env.REACT_APP_API_BASE_URL}/login`, formData);
      alert("✅ Login successful!");
      localStorage.setItem("uid", res.data.user_id);
      navigate("/chat");
    } catch (err) {
      setError("❌ Login failed. Redirecting to register...");
      setTimeout(() => {
        navigate("/register");
      }, 1500);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2 className="login-heading">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="📧 Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="🔒 Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">Login</button>
        </form>

        {error && <p className="login-error">{error}</p>}

        <div className="login-links">
          <span className="login-link" onClick={() => navigate("/forget-password")}>
            Forgot Password?
          </span>
          <span className="login-link" onClick={() => navigate("/register")}>
            Not a user? Register
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;




