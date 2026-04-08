import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../users/utils';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCSRF = async () => {
      await fetch('http://localhost:8000/api/csrf/', {
        credentials: 'include',
      });
    };

    getCSRF();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/update-user/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      
      localStorage.setItem('user', JSON.stringify(data));


      navigate('/profile/edit');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-)' }}>
        Edit Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          color: '#000000',
          
        }}
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
            style={{ background: 'var(--accent)', color: 'black' }}
          >
            {user?.username?.[0]?.toUpperCase() || 'S'}
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            @{user?.username}
          </p>
        </div>

        {/* Full Name */}
        <input
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 rounded-xl"
          placeholder="Full Name"
          
        />

        {/* Email */}
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 rounded-xl"
          placeholder="Email"
        />

        {/* Phone */}
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 rounded-xl"
          placeholder="Phone"
        />

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/profile/edit')}
            className="flex-1 px-4 py-3 rounded-xl"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl"
            style={{
              background: 'var(--border-hover)',
              color: 'black',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
