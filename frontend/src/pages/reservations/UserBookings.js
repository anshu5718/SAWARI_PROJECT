import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api';
import BookingCancel from '../users/BookingCancel';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  approved:  { bg: 'var(--status-active-bg)',   border: 'var(--status-active-border)',  text: 'var(--status-active-text)' },
  pending:   { bg: 'var(--status-pending-bg)',  border: 'var(--status-pending-border)', text: 'var(--status-pending-text)' },
  completed: { bg: 'var(--bg-tertiary)',        border: 'var(--border)',                text: 'var(--text-secondary)' },
  rejected:  { bg: 'var(--error-bg)',           border: 'var(--error-border)',          text: 'var(--error-text)' },
  cancelled: { bg: 'var(--error-bg)',           border: 'var(--error-border)',          text: 'var(--error-text)' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.text }} />
      {status}
    </span>
  );
}

function UserBookings() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);

  const canCancel = (r) => {
    if (['rejected', 'cancelled'].includes(r.status)) return false;
    const daysUntilStart = (new Date(r.start_date) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntilStart > 2;
  };

  const handleKhaltiPayment = async (id) => {
    try {
      const data = await apiRequest(`/create-payment/${id}/`, { method: 'POST' });
      if (data.payment_url) window.location.href = data.payment_url;
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  const fetchBookings = () => {
    apiRequest('/user-booking/')
      .then(data => setReservations(data.reservations || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <main className="w-full px-8 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Back */}
      <button
        onClick={() => navigate('/viewer-homepage')}
        className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-theme-muted mb-2">Customer</p>
        <h1 className="text-3xl font-bold text-theme-primary tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          Your bookings
        </h1>
      </div>

      {/* Cancel UI */}
      {cancelId && (
        <div className="mb-6">
          <BookingCancel
            reservationId={cancelId}
            onCancelSuccess={() => { setCancelId(null); fetchBookings(); }}
            onDismiss={() => setCancelId(null)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-theme rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && reservations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 bg-theme-tertiary">
            📋
          </div>
          <h2 className="text-lg font-semibold text-theme-primary mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            No bookings yet
          </h2>
          <p className="text-sm text-theme-muted max-w-xs">
            You haven't made any reservations yet.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && reservations.length > 0 && (
        <div className="flex flex-col gap-3">
          {reservations.map((r) => {
            const isPaid = r.payment_status === 'completed' || r.is_paid;

            return (
              <div key={r.id}
                className="card-theme rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-theme-hover transition-colors"
                onClick={() => navigate(`/booking-details/${r.id}`)}
                style={{ cursor: 'pointer' }}
              >

                {/* ID */}
                <div className="shrink-0 w-12">
                  <span className="text-xs text-theme-muted font-mono">#{r.id}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-primary truncate">
                    {r.vehicle}
                  </p>
                  <p className="text-xs text-theme-muted mt-0.5">
                    {formatDate(r.start_date)} → {formatDate(r.end_date)}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={r.status} />

                  {isPaid ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                      style={{
                        background: 'var(--status-active-bg)',
                        border: '1px solid var(--status-active-border)',
                        color: 'var(--status-active-text)'
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Paid
                    </span>
                  ) : (
                    <span className="text-xs text-theme-muted">
                      {r.payment_status || 'Unpaid'}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">

                  {r.status === 'approved' && !isPaid && (
                    <button
                      onClick={() => handleKhaltiPayment(r.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: 'var(--accent)',
                        color: 'var(--bg-primary)'
                      }}
                    >
                      Pay
                    </button>
                  )}

                  {canCancel(r) && (
                    <button
                      onClick={() => setCancelId(r.id)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        color: 'var(--error-text)',
                        border: '1px solid var(--error-border)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--error-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Cancel
                    </button>
                  )}

                  {r.status === 'pending' && (
                    <span className="text-xs text-theme-muted">
                      Waiting approval
                    </span>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </main>
  );
}

export default UserBookings;
