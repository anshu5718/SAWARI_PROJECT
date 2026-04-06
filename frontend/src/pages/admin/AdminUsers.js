import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api';
import { useNavigate } from 'react-router-dom';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchUsers = () => {
    apiRequest('/admin/users/')
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (e, id) => {
    e.stopPropagation();
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

  const FILTERS = ['all', 'customer', 'driver', 'admin'];
  const filtered = filter === 'all' ? users : users.filter(u => u.user_type === filter);
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? users.length : users.filter(u => u.user_type === f).length;
    return acc;
  }, {});

  const typeColors = {
    customer: { bg: 'var(--bg-tertiary)', border: 'var(--border-hover)', color: 'var(--text-secondary)' },
    driver:   { bg: 'var(--status-pending-bg)', border: 'var(--status-pending-border)', color: 'var(--status-pending-text)' },
    admin:    { bg: 'var(--status-active-bg)', border: 'var(--status-active-border)', color: 'var(--status-active-text)' },
  };

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Dashboard
      </button>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] mb-1.5 accent">Admin</p>
        <h1 className="text-4xl font-bold text-theme-primary tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Users</h1>
        <p className="text-sm text-theme-muted mt-1">{users.length} total users</p>
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
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-4xl">👤</p>
          <p className="text-sm text-theme-muted">No users found.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Header */}
          <div className="grid grid-cols-12 px-5 py-3 text-[10px] uppercase tracking-widest text-theme-muted"
            style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
            <span className="col-span-1">#</span>
            <span className="col-span-3">User</span>
            <span className="col-span-4">Email</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          <div className="flex flex-col divide-y" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            {filtered.map((u, idx) => {
              const tc = typeColors[u.user_type] || typeColors.customer;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={u.id}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                  className="grid grid-cols-12 px-5 py-4 items-center cursor-pointer transition-all"
                  style={{ background: isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'}
                >
                  {/* ID */}
                  <span className="col-span-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-md w-fit"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    #{u.id}
                  </span>

                  {/* User */}
                  <div className="col-span-3 flex items-center gap-2.5 pr-4">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--accent)', color: '#000' }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-theme-primary truncate">{u.username}</span>
                  </div>

                  {/* Email */}
                  <div className="col-span-4 pr-4">
                    <span className="text-xs text-theme-secondary truncate block">{u.email}</span>
                  </div>

                  {/* Role */}
                  <div className="col-span-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full capitalize font-semibold"
                      style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                      {u.user_type}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                      style={u.is_active
                        ? { background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', color: 'var(--status-active-text)' }
                        : { background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }
                      }>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={(e) => handleToggle(e, u.id)}
                      disabled={updating === u.id}
                      className="text-[10px] px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50 font-medium"
                      style={u.is_active
                        ? { borderColor: 'var(--error-border)', color: 'var(--error-text)', background: 'transparent' }
                        : { borderColor: 'var(--status-active-border)', color: 'var(--status-active-text)', background: 'transparent' }
                      }
                    >
                      {updating === u.id ? '...' : u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
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

export default AdminUsers;
