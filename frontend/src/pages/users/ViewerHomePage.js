import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  approved:  { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a', dot: '#4a8a2a', label: 'Approved' },
  pending:   { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a', dot: '#a07800', label: 'Pending' },
  completed: { bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8', dot: '#3a5ab0', label: 'Completed' },
};

const VEHICLE_ICONS = {
  car: '🚗', van: '🚐', bus: '🚌', truck: '🚛',
};

function ViewerHomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/viewer-homepage/', { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        console.log('Viewer data:', json);
        if (json.vehicles) setVehicles(json.vehicles);
      })
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
      className="min-h-screen bg-[#0f0f0f] px-8 py-10 max-w-7xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Browse</p>
        <h1
          className="text-3xl font-bold text-[#f0ede8] tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Available vehicles
        </h1>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, type, registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors"
          />
        </div>

        {/* Type filter pills
        <div className="flex gap-2 flex-wrap">
          {vehicleTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className="px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all border"
              style={{
                background: filter === type ? '#e8c84a' : '#141414',
                color: filter === type ? '#0f0f0f' : '#555',
                borderColor: filter === type ? '#e8c84a' : '#2a2a2a',
              }}
            >
              {type === 'all' ? 'All' : `${VEHICLE_ICONS[type] || '🚘'} ${type}`}
            </button>
          ))}
        </div> */}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden animate-pulse">
              <div className="h-44 bg-[#1e1e1e]" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 bg-[#1e1e1e] rounded w-2/3" />
                <div className="h-3 bg-[#1e1e1e] rounded w-full" />
                <div className="h-3 bg-[#1e1e1e] rounded w-1/2" />
                <div className="h-8 bg-[#1e1e1e] rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 bg-[#1a1a1a]">
            🔍
          </div>
          <h2
            className="text-lg font-semibold text-[#f0ede8] mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            No vehicles found
          </h2>
          <p className="text-sm text-[#444] max-w-xs">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No vehicles are available right now. Check back soon.'}
          </p>
        </div>
      )}

      {/* Vehicle grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vehicle) => {
            const booked = isBooked(vehicle.current_status);  // ✅ fixed
            const statusStyle = STATUS_STYLES[vehicle.current_status];  // ✅ fixed

            return (
              <div
                key={vehicle.id}
                className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden flex flex-col hover:border-[#2a2a2a] transition-colors"
              >
                {/* Image */}
                {vehicle.vehicle_image ? (  // ✅ fixed
                  <img
                    src={vehicle.vehicle_image}
                    alt={vehicle.name}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-[#1a1a1a] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                      <rect x="2" y="7" width="20" height="12" rx="2"/>
                      <path d="M16 7l-2-4H10L8 7"/>
                      <circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
                    </svg>
                  </div>
                )}

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    className="text-base font-semibold text-[#f0ede8] mb-1"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {vehicle.name}
                  </h3>

                  {vehicle.description && (
                    <p className="text-sm text-[#555] leading-relaxed mb-3 line-clamp-2">
                      {vehicle.description}
                    </p>
                  )}

                  {/* Meta pills */}
                  <div className="flex items-center gap-2 flex-wrap mt-auto mb-4">
                    {vehicle.vehicle_type && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]">
                        {VEHICLE_ICONS[vehicle.vehicle_type] || '🚘'} {vehicle.vehicle_type}
                      </span>
                    )}
                    {vehicle.capacity && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]">
                        {vehicle.capacity} seats
                      </span>
                    )}
                    {vehicle.cost_per_day && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1800] text-[#e8c84a] border border-[#2a2200]">
                        NPR {vehicle.cost_per_day}/day
                      </span>
                    )}
                  </div>

                  {/* CTA button */}
                  {booked ? (
                    <div
                      className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      style={{
                        background: statusStyle.bg,
                        border: `1px solid ${statusStyle.border}`,
                        color: statusStyle.text,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
                      {statusStyle.label}
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/book/${vehicle.id}`)}
                      className="w-full py-2 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90"
                      style={{ background: '#e8c84a' }}
                    >
                      Book now
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

export default ViewerHomePage;
