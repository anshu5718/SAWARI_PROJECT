import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { useStatusStyles } from '../../constants/statusStyles';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const STATUS_STYLES = useStatusStyles(isDark);

  useEffect(() => {
    apiRequest('/admin/dashboard/')
      .then(d => setData(d))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Vehicles', value: data?.total_vehicles ?? '—', icon: '🚗', sub: 'registered' },
    { label: 'Pending KYC',    value: data?.pending_kyc    ?? '—', icon: '📋', sub: 'awaiting review' },
    { label: 'Total Bookings', value: data?.total_bookings ?? '—', icon: '📅', sub: 'all time' },
    { label: 'Customers',      value: data?.total_users    ?? '—', icon: '👤', sub: 'active users' },
    { label: 'Drivers',        value: data?.total_drivers  ?? '—', icon: '🪪', sub: 'onboarded' },
  ];

  const navButtons = [
    { label: 'Vehicles', path: '/admin/vehicles', icon: '🚘' },
    { label: 'Bookings', path: '/admin/bookings', icon: '📆' },
    { label: 'Users',    path: '/admin/users',    icon: '👥' },
  ];

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-10 max-w-7xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] mb-1.5 accent">Admin</p>
          <h1
            className="text-4xl font-bold tracking-tight text-theme-primary"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Dashboard
          </h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          {navButtons.map(({ label, path, icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                         bg-theme-secondary border-theme text-theme-secondary border
                         hover:border-theme-hover transition-all"
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-32 animate-pulse bg-theme-secondary border-theme border"
              />
            ))
          : stats.map(({ label, value, icon, sub }) => (
              <div
                key={label}
                className="card-theme rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Accent glow — uses CSS var, no hardcoded color */}
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-20"
                  style={{ background: 'var(--accent)' }}
                />

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-medium uppercase tracking-wider accent">
                    {sub}
                  </span>
                </div>

                <div>
                  <p
                    className="text-4xl font-bold leading-none accent"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {value}
                  </p>
                  <p className="text-xs uppercase tracking-widest mt-1 text-theme-muted">
                    {label}
                  </p>
                </div>

                {/* Bottom accent bar */}
                <div
                  className="absolute bottom-0 left-0 h-0.5 w-2/3 opacity-50"
                  style={{ background: 'linear-gradient(to right, var(--accent), transparent)' }}
                />
              </div>
            ))}
      </div>

      {/* ── Recent Bookings ── */}
      <div className="card-theme rounded-2xl p-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 rounded-full bg-accent" />
          <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">
            Recent Bookings
          </p>
        </div>

        {!loading && data?.recent_bookings?.length === 0 && (
          <p className="text-sm text-theme-muted">No bookings yet.</p>
        )}

        <div className="flex flex-col gap-2">
          {data?.recent_bookings?.map((r) => {
            const s = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
            return (
              <div
                key={r.id}
                onClick={() => navigate(`/admin/bookings/${r.id}`)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-theme
                           bg-theme-tertiary hover:border-theme-hover transition-all cursor-pointer"
              >
                {/* ID badge */}
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md shrink-0
                                 bg-theme-primary border-theme border text-theme-muted">
                  #{r.id}
                </span>

                {/* Vehicle + user */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-theme-primary">{r.vehicle}</p>
                  <p className="text-xs mt-0.5 text-theme-muted">
                    {r.user} · {r.start_date} → {r.end_date}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className="text-xs px-3 py-1 rounded-full capitalize font-medium shrink-0"
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    color: s.text,
                  }}
                >
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
