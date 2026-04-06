import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

const STATUS_STYLES = {
  available: { bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8', dot: '#3a5ab0' },
  pending:   { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a', dot: '#a07800' },
  approved:  { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a', dot: '#4a8a2a' },
  completed: { bg: '#141414', border: '#2a2a2a', text: '#555',    dot: '#333'    },
};

const STATUSES = ['pending', 'approved', 'completed'];

function BookingStatus() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiRequest(`/booking-status/?reservation_id=${reservationId}`)
      .then(data => {
        setReservation(data);
        setSelected(data.status);
      })
      .catch(err => console.error('Error fetching reservation:', err));
  }, [reservationId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);

    try {
      const result = await apiRequest(`/booking-status/?reservation_id=${reservationId}`, {
        method: 'POST',
        body: JSON.stringify({ action: selected }),
      });

      if (result.success) {
        setReservation(prev => ({ ...prev, status: selected }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.message || 'Update failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // Loading skeleton
  if (!reservation) return (
    <main
      className="w-full px-8 py-10 max-w-2xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-4 bg-[#1e1e1e] rounded w-24" />
        <div className="h-8 bg-[#1e1e1e] rounded w-64" />
        <div className="h-48  border border-[#1e1e1e] rounded-2xl mt-4" />
      </div>
    </main>
  );

  const style = STATUS_STYLES[reservation.status] || STATUS_STYLES.pending;

  return (
    <main
      className="w-full px-8 py-10 max-w-2xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
        <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Reservation #{reservationId}</p>
        <h1
          className="text-3xl font-bold text-[#f0ede8] tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Booking details
        </h1>
      </div>

      {/* Details card */}
      <div className=" border border-[#1e1e1e] rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#444] mb-1">Vehicle</p>
            <p
              className="text-lg font-semibold text-[#f0ede8]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {reservation.vehicle_type || reservation.vehicle_name || '—'}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize"
            style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
            {reservation.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-[#1e1e1e] pt-5">
          {[
            { label: 'Customer', value: reservation.user_name },
            { label: 'Phone',    value: reservation.phone || '—' },
            { label: 'From',     value: formatDate(reservation.start_date) },
            { label: 'To',       value: formatDate(reservation.end_date) },
            { label: 'Payment',  value: reservation.payment_status || '—' },
            { label: 'Total',    value: reservation.total_cost ? `NPR ${reservation.total_cost}` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-widest text-[#444] mb-0.5">{label}</p>
              <p className="text-sm text-[#f0ede8] capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Update status card */}
      <div className=" border border-[#1e1e1e] rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-[#444] mb-4">Update status</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[#0a1400] border border-[#2a4a1a] text-[#8bc34a] text-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Status updated successfully
          </div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => {
              const st = STATUS_STYLES[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelected(s)}
                  className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border"
                  style={{
                    background: selected === s ? st.bg : '#0f0f0f',
                    borderColor: selected === s ? st.border : '#2a2a2a',
                    color: selected === s ? st.text : '#555',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || selected === reservation.status}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#e8c84a' }}
            >
              {loading ? 'Updating...' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/reject-booking`)}
              className="px-6 py-2.5 rounded-lg text-sm text-[#e05a4a] border border-[#3a1a1a] hover:bg-[#1e0e0e] transition-all"
            >
              Reject booking
            </button>
          </div>
        </form>
      </div>

    </main>
  );
}

export default BookingStatus;
