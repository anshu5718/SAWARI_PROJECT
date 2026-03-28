import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api';
import { useNavigate } from 'react-router-dom';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = () => {
    apiRequest('/admin/users/')
      .then(data => setUsers(data.users || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id) => {
    setUpdating(id);
    try {
      await apiRequest(`/admin/deactivate-user/${id}/`, { method: 'POST' });
      fetchUsers();
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
          Users
        </h1>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <p className="text-sm text-[#444]">No users found.</p>
      )}

      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#2a2a2a] transition-colors">

            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-black shrink-0"
              style={{ background: '#e8c84a' }}
            >
              {u.username[0].toUpperCase()}
            </div>

            {/* Info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(`/admin/users/${u.id}`)}
            >
              <p className="text-sm font-medium text-[#f0ede8] hover:text-[#e8c84a] transition-colors">
                {u.username}
              </p>
              <p className="text-xs text-[#444] mt-0.5">{u.email} · {u.user_type}</p>
            </div>

            {/* Status */}
            <span
              className="text-xs px-2.5 py-1 rounded-md shrink-0"
              style={u.is_active
                ? { background: '#0a1400', border: '1px solid #2a4a1a', color: '#8bc34a' }
                : { background: '#1e0e0e', border: '1px solid #3a1a1a', color: '#e05a4a' }
              }
            >
              {u.is_active ? 'Active' : 'Inactive'}
            </span>

            {/* Toggle button */}
            <button
              onClick={() => handleToggle(u.id)}
              disabled={updating === u.id}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-all disabled:opacity-50"
              style={u.is_active
                ? { borderColor: '#3a1a1a', color: '#e05a4a', background: 'transparent' }
                : { borderColor: '#2a4a1a', color: '#8bc34a', background: 'transparent' }
              }
            >
              {u.is_active ? 'Deactivate' : 'Activate'}
            </button>

          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminUsers;
