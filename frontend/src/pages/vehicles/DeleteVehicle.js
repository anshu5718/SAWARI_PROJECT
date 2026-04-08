import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';

function DeleteVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/edit-vehicle/${id}/`)
      .then(data => setVehicle(data))
      .catch(() => setError('Failed to load vehicle.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const result = await apiRequest(`/delete-vehicle/${id}/`, { method: 'DELETE' });
      if (result.success) {
        navigate('/driver-homepage', { state: { refresh: true } });
      } else {
        setError(result.message || 'Failed to delete vehicle.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-sm">

        {/* Back button */}
        <button
          onClick={() => navigate('/driver-homepage')}
          className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-primary transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>

        {/* Icon + title */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'color-mix(in srgb, #e05a4a 10%, transparent)',
              border: '1px solid color-mix(in srgb, #e05a4a 30%, transparent)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e05a4a" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <h1
            className="text-xl font-bold text-theme-primary"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Delete vehicle?
          </h1>
          <p className="text-sm text-theme-muted mt-2 leading-relaxed">
            You are about to permanently delete{' '}
            <span className="text-theme-primary font-medium">{vehicle?.name}</span>.
            This action cannot be undone and will also remove all associated bookings.
          </p>
        </div>

        {/* Vehicle summary */}
        {vehicle && (
          <div className="card-theme rounded-2xl overflow-hidden mb-5">
            {vehicle.vehicle_image ? (
              <img src={vehicle.vehicle_image} alt={vehicle.name} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-theme-secondary flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-theme-muted">
                  <rect x="2" y="7" width="20" height="12" rx="2"/>
                  <path d="M16 7l-2-4H10L8 7"/>
                  <circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
                </svg>
              </div>
            )}
            <div className="p-4">
              <p className="text-sm font-medium text-theme-primary">{vehicle.name}</p>
              <p className="text-xs text-theme-muted mt-1">NPR {vehicle.cost_per_day}/day</p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'color-mix(in srgb, #e05a4a 10%, transparent)',
              border: '1px solid color-mix(in srgb, #e05a4a 30%, transparent)',
              color: '#e05a4a',
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium
                       bg-theme-secondary border-theme border text-theme-muted
                       hover:text-theme-primary hover:border-theme-hover transition-all disabled:opacity-50"
          >
            Keep vehicle
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:opacity-90"
            style={{
              background: 'color-mix(in srgb, #e05a4a 15%, transparent)',
              border: '1px solid color-mix(in srgb, #e05a4a 40%, transparent)',
              color: '#e05a4a',
            }}
          >
            {deleting ? 'Deleting...' : 'Yes, delete'}
          </button>
        </div>

      </div>
    </main>
  );
}

export default DeleteVehicle;
