import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../users/utils';

function BookVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    purpose: '',
    pickup_location: '',
    dropoff_location: '',
  });

  useEffect(() => {
    fetch(`https://bisaka.pythonanywhere.com/api/viewer-homepage/`, { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        const found = (json.vehicles || []).find(v => String(v.id) === String(id));
        if (found) setVehicle(found);
        else setError('Vehicle not found.');
      })
      .catch(() => setError('Failed to load vehicle details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const days = formData.start_date && formData.end_date
    ? Math.max(0, Math.ceil(
        (new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)
      ))
    : 0;

  const totalCost = vehicle ? days * parseFloat(vehicle.cost_per_day || 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.start_date || !formData.end_date) {
      setError('Please select both start and end dates.');
      return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('End date must be after start date.');
      return;
    }
    if (!formData.pickup_location.trim()) {
      setError('Please enter a pickup location.');
      return;
    }
    if (!formData.dropoff_location.trim()) {
      setError('Please enter a drop-off location.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://bisaka.pythonanywhere.com/api/book-vehicle/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
          vehicle_id: parseInt(id),
          start_date: formData.start_date,
          end_date: formData.end_date,
          purpose: formData.purpose,
          pickup_location: formData.pickup_location,
          dropoff_location: formData.dropoff_location,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/my-bookings'), 2000);
      } else {
        setError(result.message || 'Booking failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#333] outline-none focus:border-[#e8c84a] transition-colors';
  const labelClass = 'text-xs uppercase tracking-widest text-[#555]';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e8c84a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#444]">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: '#0a1400', border: '1px solid #2a4a1a' }}
          >
            ✓
          </div>
          <h2 className="text-xl font-bold text-[#f0ede8]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Booking submitted!
          </h2>
          <p className="text-sm text-[#555]">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#444] mb-2">Reservation</p>
          <h1 className="text-2xl font-bold text-[#f0ede8] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Book vehicle
          </h1>
        </div>

        {/* Vehicle summary card */}
        {vehicle && (
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl overflow-hidden mb-6">
            {vehicle.vehicle_image ? (
              <img src={vehicle.vehicle_image} alt={vehicle.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-[#1a1a1a] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="12" rx="2"/>
                  <path d="M16 7l-2-4H10L8 7"/>
                  <circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
                </svg>
              </div>
            )}
            <div className="p-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#f0ede8]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {vehicle.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {vehicle.vehicle_type && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]">
                      {vehicle.vehicle_type}
                    </span>
                  )}
                  {vehicle.capacity && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]">
                      {vehicle.capacity} seats
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[#444]">per day</p>
                <p className="text-lg font-bold" style={{ color: '#e8c84a', fontFamily: "'Syne', sans-serif" }}>
                  NPR {parseFloat(vehicle.cost_per_day).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#1e0e0e] border border-[#3a1a1a] text-[#e05a4a] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Dates */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-[#444]">Rental period</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Start date</label>
                <input
                  type="date" name="start_date" value={formData.start_date}
                  onChange={handleChange} min={new Date().toISOString().split('T')[0]}
                  required className={inputClass} style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>End date</label>
                <input
                  type="date" name="end_date" value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  required className={inputClass} style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {days > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#1a1800', border: '1px solid #2a2200' }}>
                <p className="text-xs text-[#666]">
                  {days} day{days !== 1 ? 's' : ''} × NPR {parseFloat(vehicle?.cost_per_day || 0).toLocaleString()}
                </p>
                <p className="text-base font-bold" style={{ color: '#e8c84a', fontFamily: "'Syne', sans-serif" }}>
                  NPR {totalCost.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-[#444]">Locations</p>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Pickup location</label>
              <input
                type="text"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                placeholder="e.g. Thamel, Kathmandu"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Drop-off location</label>
              <input
                type="text"
                name="dropoff_location"
                value={formData.dropoff_location}
                onChange={handleChange}
                placeholder="e.g. Lakeside, Pokhara"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-[#444]">Trip details</p>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Purpose <span className="text-[#333] normal-case">(optional)</span>
              </label>
              <textarea
                name="purpose" value={formData.purpose}
                placeholder="e.g. Family trip to Pokhara..."
                onChange={handleChange} rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#e8c84a' }}
          >
            {submitting ? 'Submitting...' : 'Confirm booking'}
          </button>

        </form>
      </div>
    </main>
  );
}

export default BookVehicle;
