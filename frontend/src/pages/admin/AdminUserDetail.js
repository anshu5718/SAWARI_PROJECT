import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchUser = () => {
    apiRequest(`/admin/users/${id}/`)
      .then(data => {
        setUser(data.user);
        setBookings(data.bookings || []);
        setVehicles(data.vehicles || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleToggle = async () => {
    setUpdating(true);
    try {
      await apiRequest(`/admin/deactivate-user/${id}/`, { method: 'POST' });
      fetchUser();
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-sm text-[#444]">User not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-8 py-10 max-w-4xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/admin/users')}
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
          <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Admin · Users</p>
          <h1 className="text-3xl font-bold text-[#f0ede8] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            {user.username}
          </h1>
        </div>
        <button
          onClick={handleToggle}
          disabled={updating}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={user.is_active
            ? { background: '#1e0e0e', border: '1px solid #3a1a1a', color: '#e05a4a' }
            : { background: '#0a1400', border: '1px solid #2a4a1a', color: '#8bc34a' }
          }
        >
          {updating ? 'Updating...' : user.is_active ? 'Deactivate user' : 'Activate user'}
        </button>
      </div>

      {/* User info */}
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-[#444] mb-5">Account info</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'User ID',     value: `#${user.id}` },
            { label: 'Username',    value: user.username },
            { label: 'Email',       value: user.email },
            { label: 'User type',   value: user.user_type },
            { label: 'Status',      value: user.is_active ? 'Active' : 'Inactive' },
            { label: 'Date joined', value: formatDate(user.date_joined) },
            { label: 'Last login',  value: formatDate(user.last_login) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
              <p className="text-xs uppercase tracking-widest text-[#444]">{label}</p>
              <p className="text-sm text-[#f0ede8] capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Driver — vehicle listings */}
      {user.user_type === 'driver' && (
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 mb-6">
          <p className="text-xs uppercase tracking-widest text-[#444] mb-5">
            Vehicle listings ({vehicles.length})
          </p>
          {vehicles.length === 0 && (
            <p className="text-sm text-[#444]">No vehicles registered.</p>
          )}
          <div className="flex flex-col gap-3">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
                {v.vehicle_image ? (
                  <img src={v.vehicle_image} alt={v.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                      <rect x="2" y="7" width="20" height="12" rx="2"/>
                      <path d="M16 7l-2-4H10L8 7"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0ede8] truncate">{v.name}</p>
                  <p className="text-xs text-[#444] mt-0.5">
                    {v.vehicle_type} · {v.capacity} seats · NPR {v.cost_per_day}/day
                  </p>
                  <p className="text-xs text-[#333] mt-0.5">
                    Reg: {v.registration_number} · Citizenship: {v.citizenship_number} · License: {v.license_number}
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-md shrink-0"
                  style={v.kyc_approved
                    ? { background: '#0a1400', border: '1px solid #2a4a1a', color: '#8bc34a' }
                    : { background: '#1a1400', border: '1px solid #3a2a00', color: '#e8c84a' }
                  }
                >
                  {v.kyc_approved ? 'KYC Approved' : 'KYC Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer — booking history */}
      {user.user_type === 'customer' && (
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-[#444] mb-5">
            Booking history ({bookings.length})
          </p>
          {bookings.length === 0 && (
            <p className="text-sm text-[#444]">No bookings found.</p>
          )}
          <div className="flex flex-col gap-3">
            {bookings.map((b) => {
              const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
              return (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
                  <span className="text-xs text-[#333] font-mono shrink-0">#{b.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0ede8] truncate">{b.vehicle}</p>
                    <p className="text-xs text-[#444] mt-0.5">
                      {formatDate(b.start_date)} → {formatDate(b.end_date)}
                    </p>
                    <p className="text-xs text-[#333] mt-0.5">
                      {b.pickup_location} → {b.dropoff_location}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-md capitalize shrink-0"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                  >
                    {b.status}
                  </span>
                  <span className="text-xs text-[#444] shrink-0">
                    NPR {b.amount || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </main>
  );
}

export default AdminUserDetail;
