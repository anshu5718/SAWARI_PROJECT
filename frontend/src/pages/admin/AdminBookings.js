import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  approved:  { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a' },
  pending:   { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a' },
  completed: { bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8' },
  cancelled: { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a' },
};

const FILTERS = ['all', 'pending', 'approved', 'completed', 'cancelled'];

function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
  apiRequest('/admin/bookings/')
    .then(data => {
      setBookings(data.bookings || []);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-8 py-10 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-8">
        {/* Back button */}
        <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back 
        </button>
        <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Admin</p>
        <h1 className="text-3xl font-bold text-[#f0ede8] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Bookings
        </h1>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border"
            style={{
              background: filter === f ? '#e8c84a' : '#141414',
              color: filter === f ? '#0f0f0f' : '#555',
              borderColor: filter === f ? '#e8c84a' : '#2a2a2a',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-[#444]">No bookings found.</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((b) => {
          const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
          return (
            <div key={b.id} className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#2a2a2a] transition-colors">
              <span className="text-xs text-[#333] font-mono shrink-0">#{b.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f0ede8] truncate">{b.vehicle}</p>
                <p className="text-xs text-[#444] mt-0.5">
                  {b.user} · {formatDate(b.start_date)} → {formatDate(b.end_date)}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md capitalize shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                {b.status}
              </span>
              <span className="text-xs text-[#444] shrink-0 capitalize">
                {b.payment_status || 'unpaid'}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default AdminBookings;
