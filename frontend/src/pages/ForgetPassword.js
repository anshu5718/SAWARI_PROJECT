import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ data: { email } }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/otp-confirmation');
      } else {
        setError(data.message || 'Could not send OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'var(--bg-primary)',
        fontFamily: "'Inter', sans-serif"
      }}
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
            Reset your password
          </h1>
          <p className="text-sm text-[#555] mt-1 text-center">
            Enter your email and we'll send you a one-time code
          </p>
        </div>

        {/* Form card */}
        <div className=" border border-[#1e1e1e] rounded-2xl p-7">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full  border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ background: '#e8c84a' }}
            >
              {loading ? 'Sending code...' : 'Send OTP'}
            </button>

          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[#444] mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-[#e8c84a] hover:opacity-80 transition-opacity no-underline">
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}

export default ForgotPassword;
