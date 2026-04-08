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
    if (!reason.trim()) { setError('Please select or enter a reason.'); return; }
    setError(''); setLoading(true);
    try {
      const data = await apiRequest(`/reject-booking/${reservationId}/`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (data.success) navigate('/driver-homepage');
      else setError(data.message || 'Rejection failed. Please try again.');
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

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--error-text)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-theme-primary tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Reject booking #{reservationId}?
          </h1>
          <p className="text-sm text-theme-muted mt-1">
            Select a reason to let the customer know why.
          </p>
        </div>

        <div className="card-theme rounded-2xl p-6 flex flex-col gap-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">{error}</div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-theme-muted">Reason</label>
            {REJECT_REASONS.map((r) => (
              <button key={r} type="button" onClick={() => setSelected(r)}
                className="text-left px-4 py-3 rounded-lg text-sm transition-all border"
                style={{
                  background: selected === r ? 'var(--error-bg)' : 'var(--bg-primary)',
                  borderColor: selected === r ? 'var(--error-border)' : 'var(--border-hover)',
                  color: selected === r ? 'var(--error-text)' : 'var(--text-muted)',
                }}>
                {r}
              </button>
            ))}
          </div>

          {selected === 'Other' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Describe the reason</label>
              <textarea value={custom} onChange={(e) => setCustom(e.target.value)}
                placeholder="Enter your reason..." rows={3}
                className="input-theme resize-none" />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => navigate('/driver-homepage/')} disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm text-theme-muted border border-theme hover:text-theme-primary hover:border-theme-hover transition-all disabled:opacity-50">
              Go back
            </button>
            <button onClick={handleReject} disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
              {loading ? 'Rejecting...' : 'Confirm rejection'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RejectBooking;
