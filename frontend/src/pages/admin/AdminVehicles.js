import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchVehicles = () => {
    apiRequest('/admin/vehicles/')
      .then(data => setVehicles(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleKyc = async (e, id, action) => {
    e.stopPropagation();
    setUpdating(id);
    try {
      await apiRequest(`/admin/${action}-kyc/${id}/`, { method: 'POST' });
      fetchVehicles();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const FILTERS = ['all', 'approved', 'pending'];
  const filtered = filter === 'all' ? vehicles
    : filter === 'approved' ? vehicles.filter(v => v.kyc_approved)
    : vehicles.filter(v => !v.kyc_approved);

  const counts = {
    all: vehicles.length,
    approved: vehicles.filter(v => v.kyc_approved).length,
    pending: vehicles.filter(v => !v.kyc_approved).length,
  };

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Dashboard
      </button>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] mb-1.5 accent">Admin</p>
        <h1 className="text-4xl font-bold text-theme-primary tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Vehicles</h1>
        <p className="text-sm text-theme-muted mt-1">{vehicles.length} total vehicles</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all border"
            style={{
              background: filter === f ? 'var(--accent)' : 'var(--bg-secondary)',
              color: filter === f ? '#000' : 'var(--text-secondary)',
              borderColor: filter === f ? 'var(--accent)' : 'var(--border-hover)',
            }}
          >
            {f}
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{ background: filter === f ? 'rgba(0,0,0,0.15)' : 'var(--bg-tertiary)', color: filter === f ? '#000' : 'var(--text-muted)' }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-4xl">🚗</p>
          <p className="text-sm text-theme-muted">No vehicles found.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Header */}
          <div className="grid grid-cols-12 px-5 py-3 text-[10px] uppercase tracking-widest text-theme-muted"
            style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
            <span className="col-span-1">#</span>
            <span className="col-span-1"></span>
            <span className="col-span-3">Vehicle</span>
            <span className="col-span-2">Owner</span>
            <span className="col-span-1">Type · Reg</span>
            <span className="col-span-1 text-center">KYC</span>
            <span className="col-span-1 text-center">Booked</span>
            <span className="col-span-2 text-right">Action</span>
          </div>

          <div className="flex flex-col divide-y" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            {filtered.map((v, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={v.id}
                  onClick={() => navigate(`/admin/vehicles/${v.id}`)}
                  className="grid grid-cols-12 px-5 py-3.5 items-center cursor-pointer transition-all"
                  style={{ background: isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'}
                >
                  {/* ID */}
                  <span className="col-span-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-md w-fit"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    #{v.id}
                  </span>

                  {/* Image */}
                  <div className="col-span-1">
                    {v.vehicle_image ? (
                      <img src={v.vehicle_image} alt={v.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                          <rect x="2" y="7" width="20" height="12" rx="2"/>
                          <path d="M16 7l-2-4H10L8 7"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="col-span-3 pr-4">
                    <p className="text-sm font-medium text-theme-primary truncate">{v.name}</p>
                    <p className="text-xs text-theme-muted mt-0.5">NPR {v.cost_per_day}/day</p>
                  </div>

                  {/* Owner */}
                  <div className="col-span-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: 'var(--accent)', color: '#000' }}>
                        {v.owner?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs text-theme-secondary truncate">{v.owner}</span>
                    </div>
                  </div>

                  {/* Type · Reg */}
                  <div className="col-span-1 pr-4">
                    <p className="text-xs text-theme-secondary capitalize">{v.vehicle_type}</p>
                    <p className="text-xs text-theme-muted mt-0.5 font-mono">{v.registration_number}</p>
                  </div>

                  {/* KYC */}
                  <div className="col-span-1 flex justify-center">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap"
                      style={v.kyc_approved
                        ? { background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', color: 'var(--status-active-text)' }
                        : { background: 'var(--status-pending-bg)', border: '1px solid var(--status-pending-border)', color: 'var(--status-pending-text)' }
                      }>
                      {v.kyc_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* is_booked */}
                  <div className="col-span-1 flex justify-center">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap"
                      style={v.is_booked
                        ? { background: 'var(--status-pending-bg)', border: '1px solid var(--status-pending-border)', color: 'var(--status-pending-text)' }
                        : { background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', color: 'var(--status-active-text)' }
                      }>
                      {v.is_booked ? 'Booked' : 'Free'}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 flex justify-end gap-2">
                    {!v.kyc_approved ? (
                      <button
                        onClick={(e) => handleKyc(e, v.id, 'approve')}
                        disabled={updating === v.id}
                        className="text-[10px] px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 btn-accent"
                      >
                        {updating === v.id ? '...' : 'Approve'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleKyc(e, v.id, 'reject')}
                        disabled={updating === v.id}
                        className="text-[10px] px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 font-medium"
                        style={{ color: 'var(--error-text)', borderColor: 'var(--error-border)', background: 'transparent' }}
                      >
                        {updating === v.id ? '...' : 'Revoke'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminVehicles;
