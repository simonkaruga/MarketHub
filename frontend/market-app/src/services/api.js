import axios from 'axios';

const PRODUCTION_API_URL = import.meta.env.VITE_PRODUCTION_API_URL || 'https://markethub-cjf9.onrender.com/api/v1';
const LOCAL_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Track which API is currently being used
let currentApiUrl = PRODUCTION_API_URL;
let isUsingFallback = false;

const api = axios.create({
  baseURL: currentApiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 second timeout
});

// Function to switch to fallback API
const switchToFallback = () => {
  if (!isUsingFallback) {
    console.log('Switching to local API fallback...');
    isUsingFallback = true;
    currentApiUrl = LOCAL_API_URL;
    api.defaults.baseURL = LOCAL_API_URL;
  }
};

// Function to try production again (can be called periodically)
const tryProduction = () => {
  if (isUsingFallback) {
    console.log('Attempting to reconnect to production API...');
    isUsingFallback = false;
    currentApiUrl = PRODUCTION_API_URL;
    api.defaults.baseURL = PRODUCTION_API_URL;
  }
};

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

// Response interceptor to handle errors and fallback
api.interceptors.response.use(
  (response) => {
    // If we successfully got a response from production, stay on production
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized
    if (error.response?.status === 401 && !originalRequest._retry401) {
      originalRequest._retry401 = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors or 503 (service unavailable) - try fallback
    const isNetworkError = !error.response;
    const isServiceUnavailable = error.response?.status === 503;
    const isTimeout = error.code === 'ECONNABORTED';

    if ((isNetworkError || isServiceUnavailable || isTimeout) && !originalRequest._retryFallback && !isUsingFallback) {
      originalRequest._retryFallback = true;
      switchToFallback();

      // Retry the request with fallback URL
      originalRequest.baseURL = LOCAL_API_URL;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Export utilities for manual control
export const apiUtils = {
  switchToFallback,
  tryProduction,
  getCurrentUrl: () => currentApiUrl,
  isUsingFallback: () => isUsingFallback
};

export default api;
