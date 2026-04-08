import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/otp-confirmation');
      } else {
        setError(data.message || 'Could not send OTP. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-theme-primary"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-10">
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>Reset your password</h1>
          <p className="text-sm text-theme-muted mt-1 text-center">
            Enter your email and we'll send you a one-time code
          </p>
        </div>

        <div className="card-theme rounded-2xl p-7">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">{error}</div>
          )}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Email address</label>
              <input type="email" placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="input-theme" />
            </div>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn-accent w-full py-2.5 text-sm mt-1">
              {loading ? 'Sending code...' : 'Send OTP'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-theme-muted mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="accent hover:opacity-80 transition-opacity no-underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;
