import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function OtpConfirmation() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/otp-confirmation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        credentials: 'include',
        body: JSON.stringify({ otp: otp.join('') }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/set-new-password', { state: { userId: data.user_id } });
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
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
            style={{ fontFamily: "'Syne', sans-serif" }}>Check your email</h1>
          <p className="text-sm text-theme-muted mt-1 text-center">
            Enter the 6-digit code we sent you
          </p>
        </div>

        <div className="card-theme rounded-2xl p-7">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">{error}</div>
          )}
          <div className="flex flex-col gap-6">
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input key={i} ref={(el) => (inputs.current[i] = el)}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-semibold input-theme !px-0"
                />
              ))}
            </div>
            <button type="button" onClick={handleVerify}
              disabled={loading || otp.join('').length < 6}
              className="btn-accent w-full py-2.5 text-sm">
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-theme-muted mt-6">
          Didn't receive a code?{' '}
          <Link to="/forgot-password" className="accent hover:opacity-80 transition-opacity no-underline">Try again</Link>
        </p>
      </div>
    </main>
  );
}

export default OtpConfirmation;
