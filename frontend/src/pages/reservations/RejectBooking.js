import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../api';

const REJECT_REASONS = [
  'Vehicle unavailable on selected dates',
  'Unable to accommodate request',
  'Maintenance required',
  'Other',
];

function RejectBooking() {
  const navigate = useNavigate();
  const { reservationId } = useParams();
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reason = selected === 'Other' ? custom : selected;

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please select or enter a reason.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await apiRequest(`/reject-booking/${reservationId}/`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      if (data.success) {
        navigate('/driver-homepage');
      } else {
        setError(data.message || 'Rejection failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen  flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-sm">

        {/* Icon */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#1e0e0e', border: '1px solid #3a1a1a' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e05a4a" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <h1
            className="text-xl font-bold text-[#f0ede8] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Reject booking #{reservationId}?
          </h1>
          <p className="text-sm text-[#555] mt-1">
            Select a reason to let the customer know why.
          </p>
        </div>

        {/* Card */}
        <div className=" border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5">

          {error && (
            <div className="px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
              {error}
            </div>
          )}

          {/* Reason options */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-[#555]">Reason</label>
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelected(r)}
                className="text-left px-4 py-3 rounded-lg text-sm transition-all border"
                style={{
                  background: selected === r ? '#1e0e0e' : '#0f0f0f',
                  borderColor: selected === r ? '#5a2a2a' : '#2a2a2a',
                  color: selected === r ? '#e05a4a' : '#555',
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Custom reason input */}
          {selected === 'Other' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-[#555]">
                Describe the reason
              </label>
              <textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Enter your reason..."
                rows={3}
                className="w-full  border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => navigate('/driver-homepage/')}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm text-[#555] border border-[#2a2a2a] hover:text-[#f0ede8] hover:border-[#444] transition-all disabled:opacity-50"
            >
              Go back
            </button>
            <button
              onClick={handleReject}
              disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#3a1a1a', border: '1px solid #5a2a2a', color: '#e05a4a' }}
            >
              {loading ? 'Rejecting...' : 'Confirm rejection'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

export default RejectBooking;
