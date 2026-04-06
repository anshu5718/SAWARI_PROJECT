import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api';
import BookingCancel from '../users/BookingCancel';
import { useNavigate } from 'react-router-dom';
const STATUS_STYLES = {
  approved:  { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a', dot: '#4a8a2a' },
  pending:   { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a', dot: '#a07800' },
  completed: { bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8', dot: '#3a5ab0' },
  rejected:  { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a', dot: '#a03030' },
  cancelled: { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a', dot: '#a03030' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

function UserBookings() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);

  const canCancel = (r) => {
    if (['rejected', 'cancelled'].includes(r.status)) return false;
    const startDate = new Date(r.start_date);
    const today = new Date();
    const daysUntilStart = (startDate - today) / (1000 * 60 * 60 * 24);
    return daysUntilStart > 2;
  };

  const handleKhaltiPayment = async (reservationId) => {
    try {
      const data = await apiRequest(`/create-payment/${reservationId}/`, {
        method: 'POST',
      });
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        console.error('No payment URL returned:', data);
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  const fetchBookings = () => {
    apiRequest('/user-booking/')
      .then(data => setReservations(data.reservations || []))
      .catch(err => console.error('Error fetching bookings:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <main
      className="min-h-screen  px-8 py-10 max-w-7xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Back button */}
      <button
          onClick={() => navigate('/viewer-homepage')}
          className="flex items-center gap-2 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
      >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back 
      </button>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Customer</p>
        <h1
          className="text-3xl font-bold text-[#f0ede8] tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Your bookings
        </h1>
      </div>

      {/* Cancel confirmation card */}
      {cancelId && (
        <div className="mb-6">
          <BookingCancel
            reservationId={cancelId}
            onCancelSuccess={() => { setCancelId(null); fetchBookings(); }}
            onDismiss={() => setCancelId(null)}
          />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className=" border border-[#1e1e1e] rounded-xl h-16 animate-pulse" />
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
            You haven't made any reservations. Browse available vehicles to get started.
          </p>
        </div>
      )}

      {/* Bookings list */}
      {!loading && reservations.length > 0 && (
        <div className="flex flex-col gap-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className=" border border-[#1e1e1e] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#2a2a2a] transition-colors"
            >
              {/* Booking ID */}
              <div className="shrink-0 w-12 text-center">
                <span className="text-xs text-[#333] font-mono">#{r.id}</span>
              </div>

              {/* Vehicle + dates */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f0ede8] truncate">
                  {r.vehicle}
                </p>
                <p className="text-xs text-[#444] mt-0.5">
                  {formatDate(r.start_date)} → {formatDate(r.end_date)}
                </p>
              </div>

              {/* Status & Payment Badges */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <StatusBadge status={r.status} />

                {/* Check if payment is successful via either field */}
                {(r.payment_status === 'completed' || r.is_paid === true) ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ background: '#0a1400', border: '1px solid #2a4a1a', color: '#8bc34a' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a8a2a]" />
                    Paid
                  </span>
                ) : (
                  <span className="text-xs text-[#333]">
                    {r.payment_status || 'Unpaid'}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {r.status === 'approved' && r.payment_status !== 'completed' && (
                  <button
                    onClick={() => handleKhaltiPayment(r.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-black transition-all hover:opacity-90"
                    style={{ background: '#e8c84a' }}
                  >
                    Pay with Khalti
                  </button>
                )}

                {canCancel(r) && (
                  <button
                    onClick={() => setCancelId(r.id)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#e05a4a] border border-[#3a1a1a] hover:bg-[#1e0e0e] transition-all"
                  >
                    Cancel
                  </button>
                )}

                {r.status === 'pending' && (
                  <span className="text-xs text-[#444]">Waiting approval</span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default UserBookings;
