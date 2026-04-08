import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../users/utils';

const VEHICLE_TYPES = [
  { value: 'car',   label: '🚗 Car' },
  { value: 'van',   label: '🚐 Van' },
  { value: 'bus',   label: '🚌 Bus' },
  { value: 'truck', label: '🚛 Truck' },
];

function RegisterVehicle() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', vehicle_type: 'car', capacity: '',
    registration_number: '', description: '',
    cost_per_day: '', citizenship_number: '', license_number: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleRemoveImage = () => { setImage(null); setPreview(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!image) { setError('Please upload a vehicle photo.'); return; }
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append('vehicle_image', image);
    try {
      const response = await fetch('http://localhost:8000/api/register-vehicle/', {
        method: 'POST', body: data, credentials: 'include',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      });
      const result = await response.json();
      if (result.success) {
        navigate('/driver-homepage');
      } else {
        setError(result.message || (result.errors ? JSON.stringify(result.errors) : 'Registration failed.'));
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-theme-secondary border-theme border rounded-xl px-4 py-2.5
    text-sm text-theme-primary placeholder-theme-muted outline-none
    focus:border-theme-hover transition-colors`;
  const labelClass = 'text-xs uppercase tracking-widest text-theme-muted';

  return (
    <main className="min-h-screen px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/driver-homepage')}
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
            Register a vehicle
          </h1>
          <p className="text-sm text-theme-muted mt-1.5">
            Fill in your vehicle details. Your listing will be reviewed before going live.
          </p>
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

          {/* ── Vehicle Info ── */}
          <section className="card-theme rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
              <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">Vehicle info</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Vehicle name</label>
              <input name="name" value={formData.name} placeholder="e.g. Toyota Hiace 2020"
                onChange={handleChange} required className={inputClass} />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Vehicle type</label>
              <div className="grid grid-cols-4 gap-2">
                {VEHICLE_TYPES.map(({ value, label }) => (
                  <button
                    key={value} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, vehicle_type: value }))}
                    className="py-2 rounded-xl text-xs font-medium transition-all"
                    style={formData.vehicle_type === value ? {
                      background: 'var(--accent)', color: '#000',
                      border: '1px solid var(--accent)',
                      boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 35%, transparent)',
                    } : {
                      background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
                      color: 'var(--accent)',
                      border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Capacity (seats)</label>
                <input type="number" name="capacity" value={formData.capacity}
                  placeholder="4" min="1" onChange={handleChange} required className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Cost per day (NPR)</label>
                <input type="number" name="cost_per_day" value={formData.cost_per_day}
                  placeholder="2000" min="1" onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Registration number</label>
              <input name="registration_number" value={formData.registration_number}
                placeholder="e.g. BA 1 KHA 1234" onChange={handleChange} required className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Description <span className="text-theme-muted normal-case">(optional)</span>
              </label>
              <textarea name="description" value={formData.description}
                placeholder="Brief description of your vehicle..." onChange={handleChange}
                rows={3} className={`${inputClass} resize-none`} />
            </div>
          </section>

          {/* ── Vehicle Photo ── */}
          <section className="card-theme rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
              <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">Vehicle photo</p>
            </div>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button" onClick={handleRemoveImage}
                  className="absolute top-2 right-2 text-xs px-3 py-1 rounded-lg transition-colors
                             bg-theme-secondary border-theme border text-theme-muted hover:text-theme-primary"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 rounded-xl cursor-pointer
                                hover:bg-theme-secondary transition-colors"
                style={{ border: '1px dashed color-mix(in srgb, var(--accent) 40%, transparent)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" className="text-theme-muted mb-2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <span className="text-xs text-theme-muted">Click to upload a photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            {image && <p className="text-xs text-theme-muted truncate">{image.name}</p>}
          </section>

          {/* ── Documents ── */}
          <section className="card-theme rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
              <p className="text-xs uppercase tracking-widest font-semibold text-theme-muted">Your documents</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Citizenship number</label>
              <input name="citizenship_number" value={formData.citizenship_number}
                placeholder="e.g. 12-34-56-78901" onChange={handleChange} required className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>License number</label>
              <input name="license_number" value={formData.license_number}
                placeholder="e.g. 12-345-678" onChange={handleChange} required className={inputClass} />
            </div>
          </section>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--accent)',
              color: '#000',
              boxShadow: '0 2px 12px color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          >
            {loading ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default RegisterVehicle;
