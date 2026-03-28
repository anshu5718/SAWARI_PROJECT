import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

const STATUS_STYLES = {
  available: { bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8', dot: '#3a5ab0' },
  pending:   { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a', dot: '#a07800' },
  approved:  { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a', dot: '#4a8a2a' },
  completed: { bg: '#141414', border: '#2a2a2a', text: '#555',    dot: '#333'    },
  cancelled: { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a', dot: '#a03030' },
};

const STATUSES = ['available', 'pending', 'approved', 'completed'];

function DriverBookings() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  const canCancel = (r) => {
  if (['rejected', 'cancelled'].includes(r.status)) return false;
  const startDate = new Date(r.start_date);
  const today = new Date();
  const daysUntilStart = (startDate - today) / (1000 * 60 * 60 * 24);
  return daysUntilStart > 2;
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setUpdating(id);
    try {
      await apiRequest(`/booking-cancel/${id}/`, { method: 'POST' });
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setUpdating(null);
    }
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
      await apiRequest(`/update-status/${id}/`, {
        method: 'POST',
        body: JSON.stringify({ action: status }),
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
    <main
      className="w-full px-8 py-10"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Back button */}
      <button
          onClick={() => navigate('/driver-homepage')}
          className="flex items-center gap-2 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
      >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back 
      </button>
      
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Driver</p>
        <h1
          className="text-3xl font-bold text-[#f0ede8] tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Booking requests
        </h1>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && reservations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 bg-[#1a1a1a]">
            📋
          </div>
          <h2
            className="text-lg font-semibold text-[#f0ede8] mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            No bookings yet
          </h2>
          <p className="text-sm text-[#444] max-w-xs">
            Booking requests for your vehicles will appear here.
          </p>
        </div>
      )}

      {/* Reservations list */}
      {!loading && reservations.length > 0 && (
        <div className="flex flex-col gap-3">
          {reservations.map((res) => {
            const style = STATUS_STYLES[res.status] || STATUS_STYLES.pending;
            const isUpdating = updating === res.id;

            return (
              <div
                key={res.id}
                className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#2a2a2a] transition-colors"
              >
                {/* Booking ID */}
                <div className="shrink-0 w-12">
                  <span className="text-xs text-[#333] font-mono">#{res.id}</span>
                </div>

                {/* Vehicle + customer info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f0ede8] truncate">
                    {res.vehicle_type || res.vehicle_name || 'Vehicle'}
                  </p>
                  <p className="text-xs text-[#444] mt-0.5">
                    {res.customer_name && <span>{res.customer_name} · </span>}
                    {formatDate(res.start_date)} → {formatDate(res.end_date)}
                  </p>
                </div>

                {/* Current status badge */}
                <div className="shrink-0">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                    style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
                    {res.status}
                  </span>
                </div>

                {/* Status updater */}
                <div className="shrink-0 flex items-center gap-2">
                  <select
                    value={res.status}
                    onChange={(e) => handleUpdate(res.id, e.target.value)}
                    disabled={isUpdating || ['cancelled', 'rejected'].includes(res.status)}
                    className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-[#888] outline-none focus:border-[#e8c84a] transition-colors disabled:opacity-50 capitalize"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>

                  {isUpdating && (
                    <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8c84a" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2">
                  {canCancel(res) && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      disabled={isUpdating}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#e05a4a] border border-[#3a1a1a] hover:bg-[#1e0e0e] transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}

                  {res.status !== 'completed' && res.status !== 'rejected' && res.status !== 'cancelled' && (
                    <button
                      onClick={() => navigate(`/reject-booking/${res.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#e05a4a] border border-[#3a1a1a] hover:bg-[#1e0e0e] transition-all"
                    >
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
