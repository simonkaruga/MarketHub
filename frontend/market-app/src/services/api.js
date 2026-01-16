import axios from 'axios';

const PRODUCTION_API_URL = import.meta.env.VITE_PRODUCTION_API_URL;
const USE_PRODUCTION_API = import.meta.env.VITE_USE_PRODUCTION_API === 'true';

const API_URL = USE_PRODUCTION_API ? PRODUCTION_API_URL : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
