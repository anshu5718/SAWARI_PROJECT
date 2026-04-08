import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { getCookie } from '../users/utils';

function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_per_day: '',
    vehicle_image: null,
  });

  useEffect(() => {
    apiRequest(`/edit-vehicle/${id}/`)
      .then(data => {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          cost_per_day: data.cost_per_day || '',
          vehicle_image: null,
        });
        if (data.vehicle_image) setImagePreview(data.vehicle_image);
      })
      .catch(() => setError('Failed to load vehicle details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, vehicle_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/edit-vehicle/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          cost_per_day: parseFloat(formData.cost_per_day),
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || 'Update failed. Please try again.');
        return;
      }
      if (formData.vehicle_image) {
        const form = new FormData();
        form.append('vehicle_image', formData.vehicle_image);
        await fetch(`http://localhost:8000/api/edit-vehicle-image/${id}/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          body: form,
        });
      }
      setSuccess(true);
      setTimeout(() => navigate('/driver-homepage', { state: { refresh: true } }), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm text-theme-muted">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              color: 'var(--accent)',
            }}
          >
            ✓
          </div>
          <h2 className="text-xl font-bold text-theme-primary" style={{ fontFamily: "'Syne', sans-serif" }}>
            Vehicle updated!
          </h2>
          <p className="text-sm text-theme-muted">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-primary transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-3"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              color: 'var(--accent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Driver
          </span>
          <h1 className="text-3xl font-bold text-theme-primary tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Edit vehicle
          </h1>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'color-mix(in srgb, #e05a4a 10%, transparent)',
              border: '1px solid color-mix(in srgb, #e05a4a 30%, transparent)',
              color: '#e05a4a',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Image upload */}
          <div className="card-theme rounded-2xl overflow-hidden">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Vehicle" className="w-full h-48 object-cover" />
                <label
                  htmlFor="vehicle_image"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             text-xs font-medium cursor-pointer bg-theme-secondary border-theme border
                             text-theme-muted hover:text-theme-primary transition-all"
                  style={{ backdropFilter: 'blur(4px)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Change photo
                </label>
              </div>
            ) : (
              <label
                htmlFor="vehicle_image"
                className="w-full h-48 flex flex-col items-center justify-center gap-2 cursor-pointer
                           bg-theme-secondary hover:bg-theme-tertiary transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-theme-muted">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p className="text-xs text-theme-muted">Click to upload photo</p>
              </label>
            )}
            <input id="vehicle_image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          {/* Fields */}
          <div className="card-theme rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
              <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">Vehicle details</p>
            </div>

            {[
              { label: 'Vehicle name', name: 'name', type: 'text', placeholder: 'e.g. Kathmandu Explorer' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-theme-muted">{label}</label>
                <input
                  type={type} name={name} value={formData[name]}
                  onChange={handleChange} placeholder={placeholder} required
                  className="w-full bg-theme-secondary border-theme border rounded-xl px-4 py-2.5
                             text-sm text-theme-primary placeholder-theme-muted outline-none
                             focus:border-theme-hover transition-colors"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Description</label>
              <textarea
                name="description" value={formData.description}
                onChange={handleChange} rows={3}
                placeholder="Describe your vehicle..."
                className="w-full bg-theme-secondary border-theme border rounded-xl px-4 py-2.5
                           text-sm text-theme-primary placeholder-theme-muted outline-none
                           focus:border-theme-hover transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Cost per day (NPR)</label>
              <input
                type="number" name="cost_per_day" value={formData.cost_per_day}
                onChange={handleChange} placeholder="e.g. 5000" min="0" required
                className="w-full bg-theme-secondary border-theme border rounded-xl px-4 py-2.5
                           text-sm text-theme-primary placeholder-theme-muted outline-none
                           focus:border-theme-hover transition-colors"
              />
            </div>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--accent)',
              color: '#000',
              boxShadow: '0 2px 12px color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditVehicle;
