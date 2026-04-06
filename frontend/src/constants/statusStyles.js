export function useStatusStyles(isDark) {
  const statusStyles = {
    pending: {
      bg:     isDark ? '#1a1400' : '#fdf8e1',
      text:   isDark ? '#e8c84a' : '#856a00',
      border: isDark ? '#3a2a00' : '#e8d88a',
    },
    approved: {
      bg:     isDark ? '#0a1400' : '#eef6e8',
      text:   isDark ? '#8bc34a' : '#33691e',
      border: isDark ? '#2a4a1a' : '#c5e0a8',
    },
    completed: {
      bg:     isDark ? '#0a0a1a' : '#e8f0fc',
      text:   isDark ? '#7a9ae8' : '#1a4fa0',
      border: isDark ? '#1a1a3a' : '#a8c0ee',
    },
    cancelled: {
      bg:     isDark ? '#1e0e0e' : '#fdf0f0',
      text:   isDark ? '#e05a4a' : '#9b2c2c',
      border: isDark ? '#3a1a1a' : '#f0b8b8',
    },
    paid: {
      bg:     isDark ? '#0a1400' : '#eef6e8',
      text:   isDark ? '#8bc34a' : '#33691e',
      border: isDark ? '#2a4a1a' : '#c5e0a8',
    },
    unpaid: {
      bg:     isDark ? '#1a1400' : '#fdf8e1',
      text:   isDark ? '#e8c84a' : '#856a00',
      border: isDark ? '#3a2a00' : '#e8d88a',
    },
  };

  return statusStyles;
}
