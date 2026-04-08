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
    start_date: '', end_date: '', purpose: '', pickup_location: '', dropoff_location: '',
  });

  useEffect(() => {
    fetch(`http://localhost:8000/api/viewer-homepage/`, { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        const found = (Array.isArray(json) ? json : []).find(v => String(v.id) === String(id));
        if (found) setVehicle(found);
        else setError('Vehicle not found.');
      })
      .catch(() => setError('Failed to load vehicle details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const days = formData.start_date && formData.end_date
    ? Math.max(0, Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalCost = vehicle ? days * parseFloat(vehicle.cost_per_day || 0) : 0;

  const handleSubmit = async () => {
    setError('');
    if (!formData.start_date || !formData.end_date) { setError('Please select both start and end dates.'); return; }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) { setError('End date must be after start date.'); return; }
    if (!formData.pickup_location.trim()) { setError('Please enter a pickup location.'); return; }
    if (!formData.dropoff_location.trim()) { setError('Please enter a drop-off location.'); return; }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/book-vehicle/', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({ vehicle_id: parseInt(id), ...formData }),
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm text-theme-muted">Loading vehicle...</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-theme-primary">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--status-active-text)" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-theme-primary" style={{ fontFamily: "'Syne', sans-serif" }}>
          Booking submitted!
        </h2>
        <p className="text-sm text-theme-muted">Redirecting to your bookings...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen px-4 py-12 bg-theme-primary" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-xl mx-auto">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors mb-8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-theme-muted mb-2">Reservation</p>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>Book vehicle</h1>
        </div>

        {/* Vehicle summary */}
        {vehicle && (
          <div className="card-theme rounded-2xl overflow-hidden mb-6">
            {vehicle.vehicle_image ? (
              <img src={vehicle.vehicle_image} alt={vehicle.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-theme-tertiary flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="var(--border-hover)" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="12" rx="2"/>
                  <path d="M16 7l-2-4H10L8 7"/>
                  <circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
                </svg>
              </div>
            )}
            <div className="p-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-theme-primary"
                  style={{ fontFamily: "'Syne', sans-serif" }}>{vehicle.name}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {vehicle.vehicle_type && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-theme-tertiary text-theme-muted border border-theme">
                      {vehicle.vehicle_type}
                    </span>
                  )}
                  {vehicle.capacity && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-theme-tertiary text-theme-muted border border-theme">
                      {vehicle.capacity} seats
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-theme-muted">per day</p>
                <p className="text-lg font-bold accent" style={{ fontFamily: "'Syne', sans-serif" }}>
                  NPR {parseFloat(vehicle.cost_per_day).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-error border border-error text-error text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-6">

          {/* Dates */}
          <div className="card-theme rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-theme-muted">Rental period</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-theme-muted">Start date</label>
                <input type="date" name="start_date" value={formData.start_date}
                  onChange={handleChange} min={new Date().toISOString().split('T')[0]}
                  className="input-theme" style={{ colorScheme: 'auto' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-theme-muted">End date</label>
                <input type="date" name="end_date" value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  className="input-theme" style={{ colorScheme: 'auto' }} />
              </div>
            </div>
            {days > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'var(--status-pending-bg)', border: '1px solid var(--status-pending-border)' }}>
                <p className="text-xs text-theme-muted">
                  {days} day{days !== 1 ? 's' : ''} × NPR {parseFloat(vehicle?.cost_per_day || 0).toLocaleString()}
                </p>
                <p className="text-base font-bold accent" style={{ fontFamily: "'Syne', sans-serif" }}>
                  NPR {totalCost.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="card-theme rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-theme-muted">Locations</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Pickup location</label>
              <input type="text" name="pickup_location" value={formData.pickup_location}
                onChange={handleChange} placeholder="e.g. Thamel, Kathmandu" className="input-theme" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">Drop-off location</label>
              <input type="text" name="dropoff_location" value={formData.dropoff_location}
                onChange={handleChange} placeholder="e.g. Lakeside, Pokhara" className="input-theme" />
            </div>
          </div>

          {/* Purpose */}
          <div className="card-theme rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-theme-muted">Trip details</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-theme-muted">
                Purpose <span className="text-theme-muted normal-case opacity-50">(optional)</span>
              </label>
              <textarea name="purpose" value={formData.purpose}
                placeholder="e.g. Family trip to Pokhara..."
                onChange={handleChange} rows={3}
                className="input-theme resize-none" />
            </div>
          </div>

          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="btn-accent w-full py-3 text-sm rounded-xl">
            {submitting ? 'Submitting...' : 'Confirm booking'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default BookVehicle;
