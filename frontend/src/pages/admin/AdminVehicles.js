import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  const fetchVehicles = () => {
    apiRequest('/admin/vehicles/')
      .then(data => setVehicles(data.vehicles || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleKyc = async (id, action) => {
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

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-8 py-10 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back 
      </button>
      
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Admin</p>
        <h1 className="text-3xl font-bold text-[#f0ede8] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Vehicles
        </h1>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && vehicles.length === 0 && (
        <p className="text-sm text-[#444]">No vehicles found.</p>
      )}

      <div className="flex flex-col gap-3">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#2a2a2a] transition-colors">

            {/* Image */}
            {v.vehicle_image ? (
              <img src={v.vehicle_image} alt={v.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="12" rx="2"/>
                  <path d="M16 7l-2-4H10L8 7"/>
                </svg>
              </div>
            )}

            {/* Info — clickable */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(`/admin/vehicles/${v.id}`)}
            >
              <p className="text-sm font-medium text-[#f0ede8] hover:text-[#e8c84a] transition-colors">
                {v.name}
              </p>
              <p className="text-xs text-[#444] mt-0.5">
                {v.owner} · {v.vehicle_type} · {v.registration_number}
              </p>
              <p className="text-xs text-[#333] mt-0.5">
                Citizenship: {v.citizenship_number} · License: {v.license_number}
              </p>
            </div>

            {/* KYC status */}
            <span
              className="text-xs px-2.5 py-1 rounded-md shrink-0"
              style={v.kyc_approved
                ? { background: '#0a1400', border: '1px solid #2a4a1a', color: '#8bc34a' }
                : { background: '#1a1400', border: '1px solid #3a2a00', color: '#e8c84a' }
              }
            >
              {v.kyc_approved ? 'Approved' : 'Pending'}
            </span>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {!v.kyc_approved && (
                <button
                  onClick={() => handleKyc(v.id, 'approve')}
                  disabled={updating === v.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-black transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#e8c84a' }}
                >
                  Approve
                </button>
              )}
              {v.kyc_approved && (
                <button
                  onClick={() => handleKyc(v.id, 'reject')}
                  disabled={updating === v.id}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#e05a4a] border border-[#3a1a1a] hover:bg-[#1e0e0e] transition-all disabled:opacity-50"
                >
                  Revoke
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminVehicles;
