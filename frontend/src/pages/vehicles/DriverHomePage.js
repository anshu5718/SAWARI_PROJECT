import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../../api';

const STATUS_STYLES = {
  approved: { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a', dot: '#4a8a2a' },
  pending:  { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a', dot: '#a07800' },
  completed:{ bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8', dot: '#3a5ab0' },
};

function DriverHomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    apiRequest('/driver-homepage/')
      .then(data => {
        console.log('Driver data:', data);
        setVehicles(data.vehicles || []);
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [location.state?.refresh]);

  return (
    <div className="w-full px-8 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Driver dashboard</p>
          <h1
            className="text-3xl font-bold text-[#f0ede8] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Your vehicles
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/driver-bookings')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-[#2a2a2a] text-[#888] hover:text-[#f0ede8] hover:border-[#444] transition-all bg-[#141414]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            My Bookings
          </button>
          <button
            onClick={() => navigate('/register-vehicle')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90"
            style={{ background: '#e8c84a' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Register Vehicle
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden animate-pulse">
              <div className="h-44 bg-[#1e1e1e]" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 bg-[#1e1e1e] rounded w-2/3" />
                <div className="h-3 bg-[#1e1e1e] rounded w-full" />
                <div className="h-3 bg-[#1e1e1e] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5" style={{ background: '#1a1a1a' }}>
            🚗
          </div>
          <h2 className="text-lg font-semibold text-[#f0ede8] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            No vehicles yet
          </h2>
          <p className="text-sm text-[#444] max-w-xs mb-6">
            You haven't registered any vehicles. Add one to start receiving bookings.
          </p>
          <button
            onClick={() => navigate('/register-vehicle')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90"
            style={{ background: '#e8c84a' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Register your first vehicle
          </button>
        </div>
      )}

      {/* Vehicle grid */}
      {!loading && vehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => {
            const status = vehicle.current_status;
            const showStatus = status && ['approved', 'pending', 'completed'].includes(status);
            const style = STATUS_STYLES[status] || {};

            return (
              <div
                key={vehicle.id}
                className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden flex flex-col hover:border-[#2a2a2a] transition-colors"
              >
                {/* Vehicle image with edit overlay */}
                <div className="relative">
                  {vehicle.vehicle_image ? (
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

                  {/* Edit button overlaid on image */}
                  <button
                    onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-100 opacity-90"
                    style={{ background: 'rgba(20,20,20,0.85)', border: '1px solid #2a2a2a', color: '#888', backdropFilter: 'blur(4px)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                </div>

                {/* Card body */}
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
                  <div className="flex items-center gap-2 mt-auto mb-4 flex-wrap">
                    {vehicle.vehicle_type && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]">
                        {vehicle.vehicle_type}
                      </span>
                    )}
                    {vehicle.capacity && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]">
                        {vehicle.capacity} seats
                      </span>
                    )}
                  </div>

                  {/* Status + Edit + Delete buttons row */}
                  <div className="flex gap-2">
                    {showStatus && (
                      <button
                        onClick={() => navigate(`/driver-bookings`)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
                        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-[#2a2a2a] text-[#888] hover:text-[#f0ede8] hover:border-[#444] transition-all"
                      style={{ background: '#0f0f0f' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => navigate(`/delete-vehicle/${vehicle.id}`)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-[#3a1a1a] text-[#e05a4a] hover:bg-[#1e0e0e] transition-all"
                      style={{ background: '#0f0f0f' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default DriverHomePage;
