import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const csrfToken = getCookie('csrftoken');

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
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
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen  flex items-center justify-center "
      style={{
        background: 'var(--bg-primary)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <img src="/img/sawari_white.png" alt="Sawari" className="h-12 w-auto mb-4" style={{ filter: 'brightness(0) saturate(100%) invert(80%) sepia(60%) saturate(500%) hue-rotate(5deg) brightness(105%)' }} />
          <h1
            className="text-2xl font-bold text-[#f0ede8] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-[#555] mt-1">Sign in to your Sawari account</p>
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
                Username
              </label>
              <input
                type="text"
                name="username"
                onChange={handleChange}
                placeholder="your_username"
                required
                className="w-full  border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest text-[#555]">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-[#444] hover:text-[#888] transition-colors no-underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                placeholder="••••••••"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>

        {/* Footer links */}
        <p className="text-center text-sm text-[#444] mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#e8c84a] hover:opacity-80 transition-opacity no-underline">
            Sign up
          </Link>
        </p>

      </div>
    </main>
  );
}

export default Login;
