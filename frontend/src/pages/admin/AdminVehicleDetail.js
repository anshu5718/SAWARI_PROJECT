import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

function AdminVehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchVehicle = () => {
    apiRequest(`/admin/vehicles/${id}/`)
      .then(data => {
        setVehicle(data.vehicle);
        setBookings(data.bookings || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicle(); }, [id]);

  const handleKyc = async (action) => {
    setUpdating(true);
    try {
      await apiRequest(`/admin/${action}-kyc/${id}/`, { method: 'POST' });
      fetchVehicle();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  const STATUS_STYLES = {
    approved:  { bg: '#0a1400', border: '#2a4a1a', text: '#8bc34a' },
    pending:   { bg: '#1a1400', border: '#3a2a00', text: '#e8c84a' },
    completed: { bg: '#0a0a1a', border: '#1a1a3a', text: '#7a9ae8' },
    cancelled: { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a' },
    rejected:  { bg: '#1e0e0e', border: '#3a1a1a', text: '#e05a4a' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e8c84a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-sm text-[#444]">Vehicle not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-8 py-10 max-w-4xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/admin/vehicles')}
        className="flex items-center gap-2 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back 
      </button>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Admin · Vehicles</p>
          <h1 className="text-3xl font-bold text-[#f0ede8] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            {vehicle.name}
          </h1>
        </div>
        <button
          onClick={() => handleKyc(vehicle.kyc_approved ? 'reject' : 'approve')}
          disabled={updating}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={vehicle.kyc_approved
            ? { background: '#1e0e0e', border: '1px solid #3a1a1a', color: '#e05a4a' }
            : { background: '#e8c84a', color: '#000' }
          }
        >
          {updating ? 'Updating...' : vehicle.kyc_approved ? 'Revoke KYC' : 'Approve KYC'}
        </button>
      </div>

      {/* Vehicle image */}
      {vehicle.vehicle_image && (
        <div className="rounded-2xl overflow-hidden mb-6 border border-[#1e1e1e]">
          <img src={vehicle.vehicle_image} alt={vehicle.name} className="w-full h-64 object-cover" />
        </div>
      )}

      {/* Vehicle info */}
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-[#444] mb-5">Vehicle info</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Vehicle ID',           value: `#${vehicle.id}` },
            { label: 'Name',                 value: vehicle.name },
            { label: 'Type',                 value: vehicle.vehicle_type },
            { label: 'Capacity',             value: `${vehicle.capacity} seats` },
            { label: 'Cost per day',         value: `NPR ${vehicle.cost_per_day}` },
            { label: 'Registration number',  value: vehicle.registration_number },
            { label: 'Owner',                value: vehicle.owner },
            { label: 'KYC status',           value: vehicle.kyc_approved ? 'Approved' : 'Pending' },
            { label: 'Active',               value: vehicle.is_active ? 'Yes' : 'No' },
            { label: 'Submitted at',         value: formatDate(vehicle.kyc_submitted_at) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
              <p className="text-xs uppercase tracking-widest text-[#444]">{label}</p>
              <p className="text-sm text-[#f0ede8]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KYC Documents */}
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-[#444] mb-5">KYC documents</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Citizenship number', value: vehicle.citizenship_number },
            { label: 'License number',     value: vehicle.license_number },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
              <p className="text-xs uppercase tracking-widest text-[#444]">{label}</p>
              <p className="text-sm text-[#f0ede8] font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {vehicle.description && (
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 mb-6">
          <p className="text-xs uppercase tracking-widest text-[#444] mb-3">Description</p>
          <p className="text-sm text-[#888] leading-relaxed">{vehicle.description}</p>
        </div>
      )}

      {/* Booking history */}
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-[#444] mb-5">
          Booking history ({bookings.length})
        </p>
        {bookings.length === 0 && (
          <p className="text-sm text-[#444]">No bookings for this vehicle.</p>
        )}
        <div className="flex flex-col gap-3">
          {bookings.map((b) => {
            const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
            return (
              <div key={b.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
                <span className="text-xs text-[#333] font-mono shrink-0">#{b.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0ede8] truncate">{b.user}</p>
                  <p className="text-xs text-[#444] mt-0.5">
                    {formatDate(b.start_date)} → {formatDate(b.end_date)}
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-md capitalize shrink-0"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                >
                  {b.status}
                </span>
                <span className="text-xs text-[#444] shrink-0">NPR {b.amount || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

    </main>
  );
}

export default AdminVehicleDetail;
