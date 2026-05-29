const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Returns authorization headers if token exists in localStorage.
 */
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  },

  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data.user;
  }
};

export const tripService = {
  generateTrip: async (tripParams) => {
    const res = await fetch(`${API_BASE_URL}/trip/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tripParams)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate trip');
    return data;
  },

  getTrips: async () => {
    const res = await fetch(`${API_BASE_URL}/trip`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch saved trips');
    return data;
  },

  getTripById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/trip/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch trip details');
    return data;
  },

  deleteTrip: async (id) => {
    const res = await fetch(`${API_BASE_URL}/trip/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete trip');
    return data;
  },

  regenerateTrip: async (id, editInstruction) => {
    const res = await fetch(`${API_BASE_URL}/trip/${id}/regenerate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ editInstruction })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to regenerate itinerary');
    return data;
  }
};
