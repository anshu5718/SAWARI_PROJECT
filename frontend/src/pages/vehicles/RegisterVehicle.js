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
    name: '',
    vehicle_type: 'car',
    capacity: '',
    registration_number: '',
    description: '',
    cost_per_day: '',
    citizenship_number: '',
    license_number: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Manual image validation (avoids hidden-input browser focus bug)
    if (!image) {
      setError('Please upload a vehicle photo.');
      return;
    }

    setLoading(true);

    const data = new FormData();
    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    // Append image separately
    data.append('vehicle_image', image);

    try {
      const response = await fetch('https://nisha.pythonanywhere.com/api/register-vehicle/', {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: {
          // No Content-Type — browser sets multipart/form-data + boundary automatically
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });

      const result = await response.json();

      if (result.success) {
        navigate('/driver-homepage');
      } else {
        setError(
          result.message ||
          (result.errors ? JSON.stringify(result.errors) : 'Registration failed. Please try again.')
        );
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors';
  const labelClass = 'text-xs uppercase tracking-widest text-[#555]';

  return (
    <main
      className="min-h-screen bg-[#0f0f0f] px-4 py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-xl mx-auto">
        {/* Back button */}
        <button
            onClick={() => navigate('/driver-homepage')}
            className="flex items-center gap-2 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back 
        </button>
        
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Driver</p>
          <h1
            className="text-2xl font-bold text-[#f0ede8] tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Register a vehicle
          </h1>
          <p className="text-sm text-[#555] mt-1">
            Fill in your vehicle details. Your listing will be reviewed before going live.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Vehicle Info ── */}
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-[#444]">Vehicle info</p>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Vehicle name</label>
              <input
                name="name"
                value={formData.name}
                placeholder="e.g. Toyota Hiace 2020"
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* Vehicle type toggle */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Vehicle type</label>
              <div className="grid grid-cols-4 gap-2">
                {VEHICLE_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, vehicle_type: value }))}
                    className="py-2 rounded-lg text-xs font-medium transition-all border"
                    style={{
                      background: formData.vehicle_type === value ? '#e8c84a' : '#0f0f0f',
                      color: formData.vehicle_type === value ? '#0f0f0f' : '#555',
                      borderColor: formData.vehicle_type === value ? '#e8c84a' : '#2a2a2a',
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
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  placeholder="4"
                  min="1"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Cost per day (NPR)</label>
                <input
                  type="number"
                  name="cost_per_day"
                  value={formData.cost_per_day}
                  placeholder="2000"
                  min="1"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Registration number</label>
              <input
                name="registration_number"
                value={formData.registration_number}
                placeholder="e.g. BA 1 KHA 1234"
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Description{' '}
                <span className="text-[#333] normal-case">(optional)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                placeholder="Brief description of your vehicle..."
                onChange={handleChange}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </section>

          {/* ── Vehicle Photo ── */}
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-xs uppercase tracking-widest text-[#444]">Vehicle photo</p>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-[#0f0f0f] border border-[#2a2a2a] text-[#888] text-xs px-3 py-1 rounded-lg hover:text-white transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border border-dashed border-[#2a2a2a] rounded-xl cursor-pointer hover:border-[#444] transition-colors">
                <svg
                  width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="#444" strokeWidth="1.5"
                  className="mb-2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <span className="text-xs text-[#444]">Click to upload a photo</span>
                {/* ✅ No `required` here — validated manually in handleSubmit */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Show filename after selection */}
            {image && (
              <p className="text-xs text-[#555] truncate">{image.name}</p>
            )}
          </section>

          {/* ── Documents ── */}
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-[#444]">Your documents</p>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Citizenship number</label>
              <input
                name="citizenship_number"
                value={formData.citizenship_number}
                placeholder="e.g. 12-34-56-78901"
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>License number</label>
              <input
                name="license_number"
                value={formData.license_number}
                placeholder="e.g. 12-345-678"
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#e8c84a' }}
          >
            {loading ? 'Submitting…' : 'Submit for review'}
          </button>

        </form>
      </div>
    </main>
  );
}

export default RegisterVehicle;
