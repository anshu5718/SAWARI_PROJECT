import React, { useState } from 'react';
import { getCookie } from './utils';

function BookingCancel({ reservationId, onCancelSuccess, onDismiss }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/booking-cancel/${reservationId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ reservation_id: reservationId }),
      });
      const data = await response.json();
      if (data.success) {
        onCancelSuccess();
      } else {
        setError(data.message || 'Cancellation failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-theme rounded-2xl p-6 max-w-sm w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-error"
        style={{ border: '1px solid var(--error-border)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="var(--error-text)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      </div>

      <h3 className="text-base font-semibold text-theme-primary mb-1"
        style={{ fontFamily: "'Syne', sans-serif" }}>Cancel booking?</h3>
      <p className="text-sm text-theme-muted mb-5 leading-relaxed">
        This will cancel your reservation. This action cannot be undone.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {onDismiss && (
          <button onClick={onDismiss} disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm text-theme-muted border border-theme hover:text-theme-primary hover:border-theme-hover transition-all disabled:opacity-50">
            Keep booking
          </button>
        )}
        <button onClick={handleConfirmCancel} disabled={loading}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error-text)',
          }}>
          {loading ? 'Cancelling...' : 'Yes, cancel'}
        </button>
      </div>
    </div>
  );
}

export default BookingCancel;
