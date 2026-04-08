import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { useStatusStyles } from '../../constants/statusStyles';

function DriverHomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [bookingStats, setBookingStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const STATUS_STYLES = useStatusStyles(isDark);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiRequest('/driver-homepage/'),
      apiRequest('/driver-bookings/'),
    ])
      .then(([vehicleData, bookingData]) => {
        setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
        const bookings = Array.isArray(bookingData) ? bookingData : [];
        setBookingStats({
          total:     bookings.length,
          pending:   bookings.filter(b => b.status === 'pending').length,
          approved:  bookings.filter(b => b.status === 'approved').length,
          completed: bookings.filter(b => b.status === 'completed').length,
        });
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [location.state?.refresh]);

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-10 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          {/* Accent pill eyebrow */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-3"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              color: 'var(--accent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Driver
          </span>
          <h1
            className="text-4xl font-bold tracking-tight text-theme-primary"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Your Vehicles
          </h1>
          <p className="text-sm text-theme-muted mt-1.5">
            Manage and track all your registered vehicles
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => navigate('/driver-bookings')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-theme-secondary border-theme text-theme-secondary border
                       hover:border-theme-hover transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            My Bookings
          </button>
          <button
            onClick={() => navigate('/register-vehicle')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'var(--accent)',
              color: '#000',
              boxShadow: '0 2px 12px color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Register Vehicle
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total',     value: bookingStats.total,     sub: 'all bookings' },
            { label: 'Pending',   value: bookingStats.pending,   sub: 'awaiting review' },
            { label: 'Approved',  value: bookingStats.approved,  sub: 'active' },
            { label: 'Completed', value: bookingStats.completed, sub: 'all time' },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: 'color-mix(in srgb, var(--accent) 6%, var(--bg-primary, white))',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              }}
            >
              {/* Corner glow */}
              <div
                className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-25 pointer-events-none"
                style={{ background: 'var(--accent)' }}
              />

              {/* Top row: label + sub */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-theme-muted">
                  {label}
                </span>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
                    color: 'var(--accent)',
                    border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                  }}
                >
                  {sub}
                </span>
              </div>

              <p
                className="text-5xl font-bold leading-none accent"
                style={{ fontFamily: "'Syne', sans-serif", color: 'var(--accent)' }}
              >
                {value}
              </p>

              {/* Bottom accent bar */}
              <div
                className="absolute bottom-0 left-0 h-[3px] w-3/4 opacity-60"
                style={{ background: 'linear-gradient(to right, var(--accent), transparent)' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Section label ── */}
      {!loading && vehicles.length > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
          <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">
            All Vehicles
          </p>
        </div>
      )}

      {/* ── Loading Grid ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-theme-secondary border-theme border">
              <div className="h-48 bg-theme-tertiary" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-4 bg-theme-tertiary rounded w-2/3" />
                <div className="h-3 bg-theme-tertiary rounded w-full" />
                <div className="h-3 bg-theme-tertiary rounded w-1/2" />
                <div className="h-9 bg-theme-tertiary rounded mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5 relative overflow-hidden"
            style={{
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            }}
          >
            🚗
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full blur-xl opacity-40"
              style={{ background: 'var(--accent)' }} />
          </div>
          <h2 className="text-lg font-semibold text-theme-primary mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            No vehicles yet
          </h2>
          <p className="text-sm text-theme-muted max-w-xs mb-6">
            You haven't registered any vehicles. Add one to start receiving bookings.
          </p>
          <button
            onClick={() => navigate('/register-vehicle')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'var(--accent)',
              color: '#000',
              boxShadow: '0 2px 12px color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Register your first vehicle
          </button>
        </div>
      )}

      {/* ── Vehicle Grid ── */}
      {!loading && vehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => {
            const status = vehicle.current_status;
            const showStatus = status && ['approved', 'pending', 'completed'].includes(status);
            const s = STATUS_STYLES[status] || STATUS_STYLES.pending;

            return (
              <div
                key={vehicle.id}
                className="card-theme rounded-2xl overflow-hidden flex flex-col relative group hover:border-theme-hover transition-all"
              >
                {/* Accent glow on hover */}
                <div
                  className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-15 pointer-events-none transition-opacity duration-300"
                  style={{ background: 'var(--accent)' }}
                />

                {/* Image */}
                <div className="relative overflow-hidden">
                  {vehicle.vehicle_image ? (
                    <img
                      src={vehicle.vehicle_image}
                      alt={vehicle.name}
                      className="w-full h-48 object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-theme-secondary flex items-center justify-center">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.2" className="text-theme-muted">
                        <rect x="2" y="7" width="20" height="12" rx="2" />
                        <path d="M16 7l-2-4H10L8 7" />
                        <circle cx="7" cy="19" r="2" /><circle cx="17" cy="19" r="2" />
                      </svg>
                    </div>
                  )}

                  {/* Edit overlay — shows on hover */}
                  <button
                    onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                               text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity
                               bg-theme-secondary border-theme border text-theme-muted hover:text-theme-primary"
                    style={{ backdropFilter: 'blur(8px)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>

                  {/* Status pill overlaid on image */}
                  {showStatus && (
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text, backdropFilter: 'blur(4px)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="text-base font-semibold text-theme-primary mb-1"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {vehicle.name}
                  </h3>

                  {vehicle.description && (
                    <p className="text-sm text-theme-muted leading-relaxed mb-3 line-clamp-2">
                      {vehicle.description}
                    </p>
                  )}

                  {/* Meta pills */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {vehicle.vehicle_type && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-theme-secondary border-theme border text-theme-muted">
                        {vehicle.vehicle_type}
                      </span>
                    )}
                    {vehicle.capacity && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-theme-secondary border-theme border text-theme-muted">
                        {vehicle.capacity} seats
                      </span>
                    )}
                  </div>

                  <div className="border-t border-theme mb-4 mt-auto" />

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
                                 bg-theme-secondary border-theme border text-theme-muted
                                 hover:text-theme-primary hover:border-theme-hover transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/delete-vehicle/${vehicle.id}`)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-90"
                      style={{
                        background: 'color-mix(in srgb, #e05a4a 10%, transparent)',
                        border: '1px solid color-mix(in srgb, #e05a4a 30%, transparent)',
                        color: '#e05a4a',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Bottom accent bar — shows on hover */}
                <div
                  className="absolute bottom-0 left-0 h-0.5 w-2/3 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to right, var(--accent), transparent)' }}
                />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default DriverHomePage;
