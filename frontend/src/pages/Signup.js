import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '', phone_number: '', user_type: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const response = await fetch('http://localhost:8000/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Signup failed. Please try again.');
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
            style={{ fontFamily: "'Syne', sans-serif" }}>Create an account</h1>
          <p className="text-sm text-theme-muted mt-1">Join Sawari today</p>
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
              <label className="text-xs uppercase tracking-widest text-theme-muted">Email</label>
              <input type="email" name="email" onChange={handleChange}
                placeholder="you@example.com" className="input-theme" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Password</label>
              <input type="password" name="password" onChange={handleChange}
                placeholder="••••••••" className="input-theme" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Phone number</label>
              <input type="text" name="phone_number" onChange={handleChange}
                placeholder="+977 98XXXXXXXX" className="input-theme" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-theme-muted">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {['customer', 'driver'].map((type) => (
                  <button key={type} type="button"
                    onClick={() => setFormData({ ...formData, user_type: type })}
                    className="py-2.5 rounded-lg text-sm font-medium capitalize transition-all border"
                    style={{
                      background: formData.user_type === type ? 'var(--accent)' : 'var(--bg-primary)',
                      color: formData.user_type === type ? '#000' : 'var(--text-muted)',
                      borderColor: formData.user_type === type ? 'var(--accent)' : 'var(--border-hover)',
                    }}>
                    {type === 'customer' ? '🧍 Customer' : '🚗 Driver'}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn-accent w-full py-2.5 text-sm mt-1">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-theme-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="accent hover:opacity-80 transition-opacity no-underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;
