import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'

  useEffect(() => {
    const pidx = searchParams.get('pidx');

    fetch(`http://localhost:8000/api/payment-success/?pidx=${pidx}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setTimeout(() => navigate('/my-bookings'), 2500);
        } else {
          setStatus('failed');
          setTimeout(() => navigate('/my-bookings'), 3000);
        }
      })
      .catch(() => {
        setStatus('failed');
        setTimeout(() => navigate('/my-bookings'), 3000);
      });
  }, [searchParams, navigate]);

  return (
    <main
      className="min-h-screen  flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-col items-center text-center max-w-xs">

        {/* Verifying state */}
        {status === 'verifying' && (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[#1a1a1a]">
              <svg
                className="animate-spin"
                width="24" height="24" viewBox="0 0 24 24"
                fill="none" stroke="#e8c84a" strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h1
              className="text-xl font-bold text-[#f0ede8] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Verifying payment
            </h1>
            <p className="text-sm text-[#444]">Please wait while we confirm your transaction...</p>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: '#0a1400', border: '1px solid #2a4a1a' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8bc34a" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h1
              className="text-xl font-bold text-[#f0ede8] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Payment confirmed
            </h1>
            <p className="text-sm text-[#555] mb-6">
              Your booking has been paid successfully. Redirecting you to your bookings...
            </p>
            <div className="w-full h-0.5 bg-[#1e1e1e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: '#8bc34a',
                  width: '100%',
                  animation: 'shrink 2.5s linear forwards',
                }}
              />
            </div>
          </>
        )}

        {/* Failed state */}
        {status === 'failed' && (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: '#1e0e0e', border: '1px solid #3a1a1a' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e05a4a" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <h1
              className="text-xl font-bold text-[#f0ede8] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Payment failed
            </h1>
            <p className="text-sm text-[#555] mb-6">
              We couldn't verify your payment. Redirecting you back to your bookings...
            </p>
            <div className="w-full h-0.5 bg-[#1e1e1e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: '#e05a4a',
                  width: '100%',
                  animation: 'shrink 3s linear forwards',
                }}
              />
            </div>
          </>
        )}

      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </main>
  );
}

export default PaymentSuccess;
