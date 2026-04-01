import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function OtpConfirmation() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
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

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const updated = [...otp];
    updated[index] = value.slice(-1); // one digit per box
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

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpString = otp.join('');

    try {
      const response = await fetch('http://nisha.pythonanywhere.com/api/otp-confirmation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ otp: otpString }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/set-new-password', { state: { userId: data.user_id } });
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
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
            Check your email
          </h1>
          <p className="text-sm text-[#555] mt-1 text-center">
            Enter the 6-digit code we sent you
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-7">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="flex flex-col gap-6">

            {/* 6-box OTP input */}
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-semibold bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-[#f0ede8] outline-none focus:border-[#e8c84a] transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#e8c84a' }}
            >
              {loading ? 'Verifying...' : 'Verify code'}
            </button>

          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[#444] mt-6">
          Didn't receive a code?{' '}
          <Link to="/forgot-password" className="text-[#e8c84a] hover:opacity-80 transition-opacity no-underline">
            Try again
          </Link>
        </p>

      </div>
    </main>
  );
}

export default OtpConfirmation;
