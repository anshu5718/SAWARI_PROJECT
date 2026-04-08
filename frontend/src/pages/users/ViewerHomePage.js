import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useStatusStyles } from '../../constants/statusStyles';

const VEHICLE_ICONS = {
  car: '🚗', van: '🚐', bus: '🚌', truck: '🚛',
};

function ViewerHomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const STATUS_STYLES = useStatusStyles(isDark);

  useEffect(() => {
    fetch('http://localhost:8000/api/viewer-homepage/', { credentials: 'include' })
      .then(res => res.json())
      .then(json => { if (Array.isArray(json)) setVehicles(json); })
      .catch(err => console.error('Error fetching vehicles:', err))
      .finally(() => setLoading(false));
  }, []);

  const vehicleTypes = ['all', ...new Set(vehicles.map(v => v.vehicle_type).filter(Boolean))];

  const filtered = vehicles.filter(v => {
    const matchesSearch =
      search === '' ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicle_type?.toLowerCase().includes(search.toLowerCase()) ||
      v.registration_number?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || v.vehicle_type === filter;
    return matchesSearch && matchesFilter;
  });

  const isBooked = (status) => ['approved', 'pending', 'completed'].includes(status);

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-10 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="mb-10">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-3"
          style={{
            background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
            color: 'var(--accent)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          Browse
        </span>
        <h1
          className="text-4xl font-bold tracking-tight text-theme-primary mb-2"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Available Vehicles
        </h1>
        <p className="text-sm text-theme-muted mb-8">
          Find and book the perfect vehicle for your trip
        </p>

        {/* ── Search + Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            
            <input
              type="text"
              placeholder="Search by name, type, registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-theme p-4 w-full ml-2  "
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className="px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                style={filter === type ? {
                  background: 'var(--accent)',
                  color: '#000',
                  border: '1px solid var(--accent)',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 35%, transparent)',
                } : {
                  background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
                  color: 'var(--accent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                }}
              >
                {type === 'all' ? 'All' : `${VEHICLE_ICONS[type] || '🚘'} ${type}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading Skeletons ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-theme-secondary border-theme border">
              <div className="h-52 bg-theme-tertiary" />
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-theme-tertiary rounded w-1/3" />
                  <div className="h-4 bg-theme-tertiary rounded w-1/4" />
                </div>
                <div className="h-3 bg-theme-tertiary rounded w-full" />
                <div className="h-3 bg-theme-tertiary rounded w-3/4" />
                <div className="h-9 bg-theme-tertiary rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-16 h-16 p-2 rounded-2xl flex items-center justify-center text-2xl mb-5 mr-2 relative overflow-hidden"
            style={{
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            }}
          >
            🔍 
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full blur-xl opacity-40"
              style={{ background: 'var(--accent)' }} />
          </div>
          <h2 className="text-lg font-semibold text-theme-primary mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            No vehicles found
          </h2>
          <p className="text-sm text-theme-muted max-w-xs">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No vehicles are available right now. Check back soon.'}
          </p>
        </div>
      )}

      {/* ── Section label ── */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
          <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">
            {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      {/* ── Vehicle Grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((vehicle) => {
            const booked = isBooked(vehicle.current_status);
            const s = STATUS_STYLES[vehicle.current_status] || STATUS_STYLES.pending;

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
                      className="w-full h-52 object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-52 bg-theme-secondary flex items-center justify-center">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.2" className="text-theme-muted">
                        <rect x="2" y="7" width="20" height="12" rx="2" />
                        <path d="M16 7l-2-4H10L8 7" />
                        <circle cx="7" cy="19" r="2" /><circle cx="17" cy="19" r="2" />
                      </svg>
                    </div>
                  )}

                  {/* Price badge on image */}
                  {vehicle.cost_per_day && (
                    <div
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: 'var(--accent)',
                        color: '#000',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      NPR {vehicle.cost_per_day}<span className="font-normal opacity-70">/day</span>
                    </div>
                  )}

                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <h3
                    className="text-base font-semibold text-theme-primary leading-tight"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {vehicle.name}
                  </h3>

                  {vehicle.description && (
                    <p className="text-sm text-theme-muted leading-relaxed line-clamp-2">
                      {vehicle.description}
                    </p>
                  )}

                  {/* Meta pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {vehicle.vehicle_type && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-theme-secondary border-theme border text-theme-muted">
                        {VEHICLE_ICONS[vehicle.vehicle_type] || '🚘'} {vehicle.vehicle_type}
                      </span>
                    )}
                    {vehicle.capacity && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-theme-secondary border-theme border text-theme-muted">
                        {vehicle.capacity} seats
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-4 border-t border-theme">
                    {booked ? (
                      <div
                        className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
                        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                        {vehicle.current_status.charAt(0).toUpperCase() + vehicle.current_status.slice(1)}
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/book/${vehicle.id}`)}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                        style={{
                          background: 'var(--accent)',
                          color: '#000',
                          boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)',
                        }}
                      >
                        Book now →
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom accent bar on hover */}
                <div
                  className="absolute bottom-0 left-0 h-[3px] w-2/3 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
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

export default ViewerHomePage;
