import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { useStatusStyles } from '../../constants/statusStyles';

function AdminBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const STATUS_STYLES = useStatusStyles(isDark);

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(() => {
    apiRequest(`/admin/bookings/${id}/`)
      .then(data => setReservation(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-theme-muted">Booking not found.</p>
      </div>
    );
  }

  const userName = typeof reservation.user === 'object' ? reservation.user.username : reservation.user;
  const vehicleName = typeof reservation.vehicle === 'object' ? reservation.vehicle.name : reservation.vehicle;

  const statusStyle =
    STATUS_STYLES[reservation.status] || STATUS_STYLES.pending;

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-4xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      <button onClick={() => navigate('/admin/bookings')} className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Bookings
      </button>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] mb-1.5 accent">Admin</p>
        <h1 className="text-4xl font-bold text-theme-primary tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Booking #{reservation.id}
        </h1>
        <p className="text-sm text-theme-muted mt-1">{userName || 'Unknown User'} · {vehicleName}</p>
      </div>
      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] accent mb-1">
            Admin · Bookings
          </p>
          <h1
            className="text-3xl font-bold text-theme-primary"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Booking #{reservation.id}
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            {userName || 'Unknown User'} · {vehicleName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Booking Status */}
          <span
            className="text-xs px-3 py-1.5 rounded-full font-semibold capitalize"
            style={{
              background: statusStyle.bg,
              border: `1px solid ${statusStyle.border}`,
              color: statusStyle.text,
            }}
          >
            {reservation.status}
          </span>

          {/* Payment Status */}
          <span
            className="text-xs px-3 py-1.5 rounded-full font-semibold capitalize"
            style={
              reservation.payment_status === 'paid'
                ? {
                    background: 'var(--status-active-bg)',
                    border: '1px solid var(--status-active-border)',
                    color: 'var(--status-active-text)',
                  }
                : {
                    background: 'var(--status-pending-bg)',
                    border: '1px solid var(--status-pending-border)',
                    color: 'var(--status-pending-text)',
                  }
            }
          >
            {reservation.payment_status}
          </span>
        </div>
      </div>

      {/* Booking Info */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-1 h-5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">
            Booking Details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Booking ID', value: `#${reservation.id}` },
            { label: 'User', value: userName || 'Unknown User' },
            { label: 'Vehicle', value: vehicleName },
            { label: 'Start Date', value: formatDate(reservation.start_date) },
            { label: 'End Date', value: formatDate(reservation.end_date) },
            { label: 'Pickup Location', value: reservation.pickup_location },
            { label: 'Dropoff Location', value: reservation.dropoff_location },
            {
              label: 'Amount',
              value: reservation.amount ? `NPR ${reservation.amount}` : '—',
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-xs uppercase tracking-widest text-theme-muted">
                {label}
              </p>
              <p className="text-sm text-theme-primary font-medium">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default AdminBookingDetails;
