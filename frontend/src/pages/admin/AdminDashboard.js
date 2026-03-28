import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest('/admin/dashboard/')
      .then(d => setData(d))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Vehicles',  value: data?.total_vehicles  ?? '—' },
    { label: 'Pending KYC',     value: data?.pending_kyc     ?? '—' },
    { label: 'Total Bookings',  value: data?.total_bookings  ?? '—' },
    { label: 'Customers',       value: data?.total_users     ?? '—' },
    { label: 'Drivers',         value: data?.total_drivers   ?? '—' },
  ];

  const STATUS_STYLES = {
    approved:  { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a' },
    pending:   { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a' },
    completed: { bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8' },
    cancelled: { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a' },
    rejected:  { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a' },
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-8 py-10 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-[#f0ede8] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Vehicles',  path: '/admin/vehicles' },
            { label: 'Bookings',  path: '/admin/bookings' },
            { label: 'Users',     path: '/admin/users' },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="px-4 py-2 rounded-lg text-sm border border-[#2a2a2a] text-[#888] hover:text-[#f0ede8] hover:border-[#444] transition-all bg-[#141414]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 flex flex-col gap-1">
              <p className="text-xs uppercase tracking-widest text-[#444]">{label}</p>
              <p className="text-3xl font-bold text-[#f0ede8]" style={{ fontFamily: "'Syne', sans-serif" }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recent bookings */}
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-[#444] mb-5">Recent bookings</p>
        {!loading && data?.recent_bookings?.length === 0 && (
          <p className="text-sm text-[#444]">No bookings yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {data?.recent_bookings?.map((r) => {
            const s = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
            return (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
                <span className="text-xs text-[#333] font-mono shrink-0">#{r.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0ede8] truncate">{r.vehicle}</p>
                  <p className="text-xs text-[#444]">{r.user} · {r.start_date} → {r.end_date}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md capitalize" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                  {r.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </main>
  );
}

export default AdminDashboard;
