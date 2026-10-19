import axios from 'axios';

// Change via .env → VITE_API_URL=https://your-server.com
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trackpro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired/invalid token → back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('trackpro_token');
      localStorage.removeItem('trackpro_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
