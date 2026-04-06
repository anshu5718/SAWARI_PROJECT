import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { useStatusStyles } from '../../constants/statusStyles';

function AdminVehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { isDark } = useTheme();
  const STATUS_STYLES = useStatusStyles(isDark);

  const fetchVehicle = useCallback(() => {
    apiRequest(`/admin/vehicles/${id}/`)
      .then(data => { setVehicle(data.vehicle || null); setBookings(data.bookings || []); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchVehicle(); }, [fetchVehicle]);

  const handleKyc = async (action) => {
    setUpdating(true);
    try {
      await apiRequest(`/admin/${action}-kyc/${id}/`, { method: 'POST' });
      fetchVehicle();
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
  const formatShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!vehicle) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-theme-muted">Vehicle not found.</p>
    </div>
  );

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-4xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      <button onClick={() => navigate('/admin/vehicles')} className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Vehicles
      </button>

      {/* Hero header */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
        {vehicle.vehicle_image && (
          <div className="relative">
            <img src={vehicle.vehicle_image} alt={vehicle.name} className="w-full h-56 object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 60%)' }} />
          </div>
        )}
        <div className="p-6 flex items-start justify-between gap-4 flex-wrap"
          style={{ background: 'var(--bg-secondary)', borderTop: vehicle.vehicle_image ? '1px solid var(--border)' : 'none' }}>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] accent mb-1">Admin · Vehicles</p>
            <h1 className="text-3xl font-bold text-theme-primary tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              {vehicle.name}
            </h1>
            <p className="text-xs text-theme-muted mt-1">{vehicle.vehicle_type} · {vehicle.capacity} seats · NPR {vehicle.cost_per_day}/day</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={vehicle.kyc_approved
                ? { background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', color: 'var(--status-active-text)' }
                : { background: 'var(--status-pending-bg)', border: '1px solid var(--status-pending-border)', color: 'var(--status-pending-text)' }
              }>
              {vehicle.kyc_approved ? 'KYC Approved' : 'KYC Pending'}
            </span>
            <button
              onClick={() => handleKyc(vehicle.kyc_approved ? 'reject' : 'approve')}
              disabled={updating}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={vehicle.kyc_approved
                ? { background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }
                : { background: 'var(--accent)', color: '#000', border: 'none' }
              }
            >
              {updating ? 'Updating...' : vehicle.kyc_approved ? 'Revoke KYC' : 'Approve KYC'}
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle info */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
          <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">Vehicle Info</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Vehicle ID',          value: `#${vehicle.id}` },
            { label: 'Owner',               value: vehicle.owner },
            { label: 'Registration',        value: vehicle.registration_number },
            { label: 'Cost per day',        value: `NPR ${vehicle.cost_per_day}` },
            { label: 'Active',              value: vehicle.is_active ? 'Yes' : 'No' },
            { label: 'Submitted at',        value: formatDate(vehicle.kyc_submitted_at) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-widest text-theme-muted">{label}</p>
              <p className="text-sm text-theme-primary font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KYC Documents */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
          <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">KYC Documents</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Citizenship number', value: vehicle.citizenship_number },
            { label: 'License number',     value: vehicle.license_number },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-widest text-theme-muted">{label}</p>
              <p className="text-sm text-theme-primary font-mono font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {vehicle.description && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
            <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">Description</p>
          </div>
          <p className="text-sm text-theme-secondary leading-relaxed">{vehicle.description}</p>
        </div>
      )}

      {/* Booking history */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
          <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">
            Booking History ({bookings.length})
          </p>
        </div>
        {bookings.length === 0
          ? <p className="text-sm text-theme-muted">No bookings for this vehicle.</p>
          : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] uppercase tracking-widest text-theme-muted"
                style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                <span className="col-span-1">#</span>
                <span className="col-span-3">Customer</span>
                <span className="col-span-4">Dates</span>
                <span className="col-span-2 text-center">Status</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              {bookings.map((b, idx) => {
                const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                const isEven = idx % 2 === 0;
                return (
                  <div key={b.id} className="grid grid-cols-12 px-4 py-3.5 items-center"
                    style={{
                      background: isEven ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                      borderBottom: idx < bookings.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                    <span className="col-span-1 text-xs font-mono text-theme-muted">#{b.id}</span>
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: 'var(--accent)', color: '#000' }}>
                        {b.user?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs text-theme-secondary truncate">{b.user}</span>
                    </div>
                    <div className="col-span-4">
                      <p className="text-xs text-theme-secondary">{formatShort(b.start_date)}</p>
                      <p className="text-xs text-theme-muted">→ {formatShort(b.end_date)}</p>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className="text-[10px] px-2.5 py-1 rounded-full capitalize font-semibold"
                        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                        {b.status}
                      </span>
                    </div>
                    <p className="col-span-2 text-xs text-theme-secondary text-right">NPR {b.amount || '—'}</p>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}

export default AdminVehicleDetail;
