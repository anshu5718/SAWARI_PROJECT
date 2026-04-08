import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';


function Login() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = data.redirect_url;
      } else {
        setError(data?.message || 'Invalid username or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-theme-primary"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-10">
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>Welcome back</h1>
          <p className="text-sm text-theme-muted mt-1">Sign in to your Sawari account</p>
        </div>

        <div className="card-theme rounded-2xl p-7">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">{error}</div>
          )}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Username</label>
              <input type="text" name="username" onChange={handleChange}
                placeholder="your_username" className="input-theme" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest text-theme-muted">Password</label>
                <a href="/forgot-password" className="text-xs text-theme-muted hover:text-theme-secondary transition-colors no-underline">
                  Forgot password?
                </a>
              </div>
              <input type="password" name="password" onChange={handleChange}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="input-theme" />
            </div>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn-accent w-full py-2.5 text-sm mt-1">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-theme-muted mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="accent hover:opacity-80 transition-opacity no-underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
