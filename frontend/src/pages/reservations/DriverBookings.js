import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

const STATUS_STYLES = {
  available: { bg: 'var(--bg-tertiary)',        border: 'var(--border)',                text: 'var(--text-secondary)' },
  pending:   { bg: 'var(--status-pending-bg)',  border: 'var(--status-pending-border)', text: 'var(--status-pending-text)' },
  approved:  { bg: 'var(--status-active-bg)',   border: 'var(--status-active-border)',  text: 'var(--status-active-text)' },
  completed: { bg: 'var(--bg-tertiary)',         border: 'var(--border)',                text: 'var(--text-secondary)' },
  cancelled: { bg: 'var(--error-bg)',            border: 'var(--error-border)',          text: 'var(--error-text)' },
};

const STATUSES = ['available', 'pending', 'approved', 'completed'];

function DriverBookings() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  const canCancel = (r) => {
    if (['rejected', 'cancelled'].includes(r.status)) return false;
    const daysUntilStart = (new Date(r.start_date) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntilStart > 2;
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setUpdating(id);
    try {
      await apiRequest(`/booking-cancel/${id}/`, { method: 'POST' });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    } catch (err) { console.error('Cancel failed:', err); }
    finally { setUpdating(null); }
  };

  const fetchReservations = () => {
    apiRequest('/driver-bookings/')
      .then(data => setReservations(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching reservations:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleUpdate = async (id, status) => {
    setUpdating(id);
    try {
      const res = await apiRequest(`/update-status/${id}/`, {
        method: 'PATCH', 
        body: JSON.stringify({ action: status })
      });

      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );

    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <main className="w-full px-8 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>

      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </button>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-theme-muted mb-2">Driver</p>
        <h1 className="text-3xl font-bold text-theme-primary tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}>Booking requests</h1>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-theme rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && reservations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 bg-theme-tertiary">📋</div>
          <h2 className="text-lg font-semibold text-theme-primary mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}>No bookings yet</h2>
          <p className="text-sm text-theme-muted max-w-xs">Booking requests for your vehicles will appear here.</p>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <div className="flex flex-col gap-3">
          {reservations.map((res) => {
            const style = STATUS_STYLES[res.status] || STATUS_STYLES.pending;
            const isUpdating = updating === res.id;
            return (
              <div key={res.id}
                className="card-theme rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-theme-hover transition-colors"
                style={{ cursor: 'pointer' }}>

                <div className="shrink-0 w-12">
                  <span className="text-xs text-theme-muted font-mono"onClick={() => navigate(`/booking-details/${res.id}`)}>#{res.id}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-primary truncate">
                    {res.vehicle || 'Vehicle'}
                  </p>
                  <p className="text-xs text-theme-muted mt-0.5">
                    {res.customer_name && <span>{res.customer_name} · </span>}
                    {formatDate(res.start_date)} → {formatDate(res.end_date)}
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                    style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.text }} />
                    {res.status}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <select value={res.status}
                    onChange={(e) => handleUpdate(res.id, e.target.value)}
                    disabled={isUpdating || ['cancelled', 'rejected'].includes(res.status)}
                    className="input-theme py-1.5 text-xs disabled:opacity-50 capitalize"
                    style={{ width: 'auto' }}>
                    {STATUSES.map(s => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                  {isUpdating && (
                    <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="var(--accent)" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {canCancel(res) && (
                    <button onClick={() => handleCancel(res.id)} disabled={isUpdating}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
                      style={{ color: 'var(--error-text)', border: '1px solid var(--error-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--error-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Cancel
                    </button>
                  )}
                  {!['completed', 'rejected', 'cancelled'].includes(res.status) && (
                    <button onClick={() => navigate(`/reject-booking/${res.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{ color: 'var(--error-text)', border: '1px solid var(--error-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--error-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Reject
                    </button>
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

export default DriverBookings;
