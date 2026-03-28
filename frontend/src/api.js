// src/api.js
import { getCookie } from './pages/users/utils';
const API_BASE = "http://localhost:8000/api";

export const apiRequest = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`API ${response.status} on ${url}:`, text);
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
};
