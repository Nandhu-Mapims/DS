import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const JWT_KEY = 'ds-workflow-token';
const USER_KEY = 'ds-workflow-user';

export function getStoredToken() {
  try {
    return localStorage.getItem(JWT_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(JWT_KEY, token);
    else localStorage.removeItem(JWT_KEY);
  } catch (_) {}
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}

export function clearAuth() {
  setStoredToken(null);
  setStoredUser(null);
}

// Request: attach JWT
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Response: 401 → clear token and optionally redirect to login
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      clearAuth();
      window.dispatchEvent(new CustomEvent('ds-unauthorized'));
    }
    return Promise.reject(err);
  }
);

export default api;
