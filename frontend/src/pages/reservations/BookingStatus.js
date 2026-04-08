import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

const STATUS_STYLES = {
  available: { bg: 'var(--bg-tertiary)',        border: 'var(--border)',                text: 'var(--text-secondary)' },
  pending:   { bg: 'var(--status-pending-bg)',  border: 'var(--status-pending-border)', text: 'var(--status-pending-text)' },
  approved:  { bg: 'var(--status-active-bg)',   border: 'var(--status-active-border)',  text: 'var(--status-active-text)' },
  completed: { bg: 'var(--bg-tertiary)',         border: 'var(--border)',                text: 'var(--text-secondary)' },
};

const STATUSES = ['pending', 'approved', 'completed'];

function BookingStatus() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiRequest(`/booking-status/?reservation_id=${reservationId}`)
      .then(data => { setReservation(data); setSelected(data.status); })
      .catch(err => console.error('Error fetching reservation:', err));
  }, [reservationId]);

  const handleUpdate = async () => {
    setError(''); setSaved(false); setLoading(true);
    try {
      const result = await apiRequest(`/booking-status/?reservation_id=${reservationId}`, {
        method: 'POST',
        body: JSON.stringify({ action: selected }),
      });
      if (result.success) {
        setReservation(prev => ({ ...prev, status: selected }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.message || 'Update failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  if (!reservation) return (
    <main className="w-full px-8 py-10 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-4 bg-theme-tertiary rounded w-24" />
        <div className="h-8 bg-theme-tertiary rounded w-64" />
        <div className="h-48 card-theme rounded-2xl mt-4" />
      </div>
    </main>
  );

  const style = STATUS_STYLES[reservation.status] || STATUS_STYLES.pending;

  return (
    <main className="w-full px-8 py-10 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
        <p className="text-xs uppercase tracking-[0.18em] text-theme-muted mb-2">Reservation #{reservationId}</p>
        <h1 className="text-3xl font-bold text-theme-primary tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}>Booking details</h1>
      </div>

      {/* Details card */}
      <div className="card-theme rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-theme-muted mb-1">Vehicle</p>
            <p className="text-lg font-semibold text-theme-primary"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {reservation.vehicle_type || reservation.vehicle_name || '—'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize"
            style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.text }} />
            {reservation.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-theme pt-5">
          {[
            { label: 'Customer', value: reservation.user_name },
            { label: 'Phone',    value: reservation.phone || '—' },
            { label: 'From',     value: formatDate(reservation.start_date) },
            { label: 'To',       value: formatDate(reservation.end_date) },
            { label: 'Payment',  value: reservation.payment_status || '—' },
            { label: 'Total',    value: reservation.total_cost ? `NPR ${reservation.total_cost}` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-widest text-theme-muted mb-0.5">{label}</p>
              <p className="text-sm text-theme-primary capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Update status card */}
      <div className="card-theme rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-theme-muted mb-4">Update status</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">{error}</div>
        )}
        {saved && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
            style={{ background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', color: 'var(--status-active-text)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Status updated successfully
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => {
              const st = STATUS_STYLES[s];
              return (
                <button key={s} type="button" onClick={() => setSelected(s)}
                  className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border"
                  style={{
                    background: selected === s ? st.bg : 'var(--bg-primary)',
                    borderColor: selected === s ? st.border : 'var(--border-hover)',
                    color: selected === s ? st.text : 'var(--text-muted)',
                  }}>
                  {s}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleUpdate}
              disabled={loading || selected === reservation.status}
              className="btn-accent px-6 py-2.5 text-sm disabled:opacity-50">
              {loading ? 'Updating...' : 'Save changes'}
            </button>
            <button type="button" onClick={() => navigate(`/reject-booking`)}
              className="px-6 py-2.5 rounded-lg text-sm transition-all"
              style={{ color: 'var(--error-text)', border: '1px solid var(--error-border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--error-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Reject booking
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default BookingStatus;
