import React, { useState } from 'react';
import './login.css';

const baseUrl = 'http://localhost:5000/api/auth';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); 
        alert('Login successful!');
        window.location.href = '/fill';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-body">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Please enter your login and password!</p>

          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="login-input"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="login-input"
            onChange={handleChange}
          />

          <p className="login-forgot">
            <a href="#!">Forgot password?</a>
          </p>

          <button className="login-button" onClick={handleLogin}>Login</button>

          <p className="login-signup">
            Don't have an account? <a href="/register" className="text-white-50 fw-bold">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;