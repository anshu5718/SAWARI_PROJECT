import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useStatusStyles } from '../../constants/statusStyles';

const FILTERS = ['all', 'pending', 'approved', 'completed', 'cancelled'];

function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { isDark } = useTheme();
  const STATUS_STYLES = useStatusStyles(isDark);

  useEffect(() => {
    apiRequest('/admin/bookings/')
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
        else if (data.bookings) setBookings(data.bookings);
        else setBookings([]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length;
    return acc;
  }, {});

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Back */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] mb-1.5 accent">Admin</p>
        <h1 className="text-4xl font-bold text-theme-primary tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Bookings
        </h1>
        <p className="text-sm text-theme-muted mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Filter pills with counts */}
      <div className="flex gap-2 flex-wrap mb-8">
        {FILTERS.map(f => {
          const active = filter === f;
          const s = !active && f !== 'all' ? STATUS_STYLES[f] : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all border"
              style={{
                background: active ? 'var(--accent)' : 'var(--bg-secondary)',
                color: active ? '#000' : s ? s.text : 'var(--text-secondary)',
                borderColor: active ? 'var(--accent)' : s ? s.border : 'var(--border-hover)',
              }}
            >
              {f}
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                style={{
                  background: active ? 'rgba(0,0,0,0.15)' : 'var(--bg-tertiary)',
                  color: active ? '#000' : 'var(--text-muted)',
                }}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl h-20 animate-pulse"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-4xl">📭</p>
          <p className="text-sm text-theme-muted">No bookings found for this filter.</p>
        </div>
      )}

      {/* Bookings table-style list */}
      {!loading && filtered.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-12 px-5 py-3 text-[10px] uppercase tracking-widest text-theme-muted"
            style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}
          >
            <span className="col-span-1">#</span>
            <span className="col-span-4">Vehicle</span>
            <span className="col-span-3">Customer</span>
            <span className="col-span-2">Dates</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-right">Payment</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col divide-y" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            {filtered.map((b, idx) => {
              const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
              const ps = STATUS_STYLES[b.payment_status] || STATUS_STYLES.pending;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/admin/bookings/${b.id}`)}
                  className="grid grid-cols-12 px-5 py-4 items-center cursor-pointer transition-all"
                  style={{
                    background: isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    borderColor: 'var(--border)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'}
                >
                  {/* ID */}
                  <span
                    className="col-span-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-md w-fit"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    #{b.id}
                  </span>

                  {/* Vehicle */}
                  <div className="col-span-4 min-w-0 pr-4">
                    <p className="text-sm font-medium text-theme-primary truncate">{b.vehicle}</p>
                  </div>

                  {/* Customer */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: 'var(--accent)', color: '#000' }}
                    >
                      {b.user?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-theme-secondary truncate">{b.user}</span>
                  </div>

                  {/* Dates */}
                  <div className="col-span-2">
                    <p className="text-xs text-theme-secondary">{formatDate(b.start_date)}</p>
                    <p className="text-xs text-theme-muted">→ {formatDate(b.end_date)}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full capitalize font-semibold whitespace-nowrap"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Payment */}
                  <div className="col-span-1 flex justify-end">
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full capitalize font-semibold whitespace-nowrap"
                      style={{ background: ps.bg, border: `1px solid ${ps.border}`, color: ps.text }}
                    >
                      {b.payment_status || 'unpaid'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminBookings;
