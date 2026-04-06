// src/components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
      style={{
        background: isDark ? '#141414' : '#f5f5f5',
        borderColor: isDark ? '#2a2a2a' : '#e0e0e0',
        color: isDark ? '#888' : '#555',
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun icon */}
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        style={{ opacity: isDark ? 0.4 : 1, color: isDark ? '#888' : '#e8c84a' }}
      >
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>

      {/* Toggle pill */}
      <div
        className="relative w-8 h-4 rounded-full transition-all"
        style={{ background: isDark ? '#2a2a2a' : '#e8c84a' }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
          style={{
            background: isDark ? '#888' : '#fff',
            left: isDark ? '2px' : '18px',
          }}
        />
      </div>

      {/* Moon icon */}
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        style={{ opacity: isDark ? 1 : 0.4, color: isDark ? '#e8c84a' : '#888' }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  );
}

export default ThemeToggle;
