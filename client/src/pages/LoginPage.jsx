// LoginPage.jsx — User login form

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If the user was redirected here from a protected page, send them back after login
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);  // Save token + user in context and localStorage
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin(email, password) {
    setForm({ email, password });
    setError('');
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🛒</span>
          <h1>Welcome Back</h1>
          <p>Sign in to your ShopSmart account</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-large"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="demo-credentials-box">
          <div className="demo-header">
            <span>💡 <strong>Quick Demo Login</strong></span>
            <small>1-click fill for testing</small>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-demo btn-demo-admin"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@shopsmart.com', 'admin123')}
            >
              🛡️ 1-Click Admin (admin@shopsmart.com)
            </button>
            <button
              type="button"
              className="btn btn-demo btn-demo-customer"
              disabled={loading}
              onClick={() => handleQuickLogin('john@example.com', 'customer123')}
            >
              👤 1-Click Customer (john@example.com)
            </button>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
