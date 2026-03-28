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
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (fields.password1 !== fields.password2) {
      setError('Passwords do not match.');
      return;
    }

    if (fields.password1.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/set-new-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
          email: fields.email,
          password1: fields.password1,
          password2: fields.password2,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    fields.password2.length > 0 && fields.password1 === fields.password2;
  const passwordsMismatch =
    fields.password2.length > 0 && fields.password1 !== fields.password2;

  return (
    <main
      className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-black mb-4"
            style={{ background: '#e8c84a', fontFamily: "'Syne', sans-serif" }}
          >
            S
          </div>
          <h1
            className="text-2xl font-bold text-[#f0ede8] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Set new password
          </h1>
          <p className="text-sm text-[#555] mt-1 text-center">
            Verify your email and choose a strong password
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-7">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={fields.email}
                onChange={(e) => setFields({ ...fields, email: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[#1e1e1e] -mx-7" />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">
                New password
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                required
                onChange={(e) => setFields({ ...fields, password1: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                required
                onChange={(e) => setFields({ ...fields, password2: e.target.value })}
                className="w-full bg-[#0f0f0f] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none transition-colors"
                style={{
                  border: passwordsMatch
                    ? '1px solid #4a8a2a'
                    : passwordsMismatch
                    ? '1px solid #8a2a2a'
                    : '1px solid #2a2a2a',
                }}
              />
              {passwordsMatch && (
                <p className="text-xs text-[#4a8a2a]">Passwords match</p>
              )}
              {passwordsMismatch && (
                <p className="text-xs text-[#e05a4a]">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordsMismatch || !fields.password1 || !fields.email}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ background: '#e8c84a' }}
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>

          </form>
        </div>

      </div>
    </main>
  );
}

export default SetNewPassword;
