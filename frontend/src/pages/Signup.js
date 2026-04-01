import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', user_type: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

    const csrfToken = getCookie('csrftoken');

    try {
      const response = await fetch('http://nisha.pythonanywhere.com/api/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            Create an account
          </h1>
          <p className="text-sm text-[#555] mt-1">Join Sawari today</p>
        </div>

        {/* Form card */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-7">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">Username</label>
              <input
                type="text"
                name="username"
                onChange={handleChange}
                placeholder="your_username"
                required
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">Email</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
              />
            </div>

            {/* User type toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-[#555]">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {['customer', 'driver'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, user_type: type })}
                    className="py-2.5 rounded-lg text-sm font-medium capitalize transition-all border"
                    style={{
                      background: formData.user_type === type ? '#e8c84a' : '#0f0f0f',
                      color: formData.user_type === type ? '#0f0f0f' : '#555',
                      borderColor: formData.user_type === type ? '#e8c84a' : '#2a2a2a',
                    }}
                  >
                    {type === 'customer' ? '🧍 Customer' : '🚗 Driver'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ background: '#e8c84a' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[#444] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#e8c84a] hover:opacity-80 transition-opacity no-underline">
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}

export default Signup;
