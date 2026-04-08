import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SetNewPassword() {
  const [fields, setFields] = useState({ email: '', password1: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleSubmit = async () => {
    setError('');
    if (fields.password1 !== fields.password2) { setError('Passwords do not match.'); return; }
    if (fields.password1.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/set-new-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, ...fields }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message || 'Failed to update password. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch   = fields.password2.length > 0 && fields.password1 === fields.password2;
  const passwordsMismatch = fields.password2.length > 0 && fields.password1 !== fields.password2;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-theme-primary"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-10">
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>Set new password</h1>
          <p className="text-sm text-theme-muted mt-1 text-center">
            Verify your email and choose a strong password
          </p>
        </div>

        <div className="card-theme rounded-2xl p-7">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">{error}</div>
          )}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Email address</label>
              <input type="email" placeholder="you@example.com" value={fields.email}
                onChange={(e) => setFields({ ...fields, email: e.target.value })}
                className="input-theme" />
            </div>

            <div className="border-t border-theme -mx-7" />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">New password</label>
              <input type="password" placeholder="Min. 8 characters"
                onChange={(e) => setFields({ ...fields, password1: e.target.value })}
                className="input-theme" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Confirm password</label>
              <input type="password" placeholder="Re-enter your password"
                onChange={(e) => setFields({ ...fields, password2: e.target.value })}
                className="input-theme"
                style={{
                  borderColor: passwordsMatch ? 'var(--status-active-text)' : passwordsMismatch ? 'var(--error-text)' : undefined,
                }}
              />
              {passwordsMatch   && <p className="text-xs" style={{ color: 'var(--status-active-text)' }}>Passwords match ✓</p>}
              {passwordsMismatch && <p className="text-xs text-error">Passwords do not match</p>}
            </div>

            <button type="button" onClick={handleSubmit}
              disabled={loading || passwordsMismatch || !fields.password1 || !fields.email}
              className="btn-accent w-full py-2.5 text-sm mt-1">
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SetNewPassword;
