import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers badhi api call pela chalshe auto attached jwt token
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

// Response interceptor to handle token expiration
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

// Auth API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Check if user is authenticated (by trying to access a protected endpoint)
  checkAuth: async () => {
    try {
      // Use a simple protected endpoint to check auth
      const response = await api.get('/test/public');
      return { authenticated: true };
    } catch (error) {
      return { authenticated: false };
    }
  },

  // Google OAuth Login
  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },
};

// Test API (for role-based endpoints)
export const testAPI = {
  getAdmin: async () => {
    const response = await api.get('/test/admin');
    return response.data;
  },

  getOwner: async () => {
    const response = await api.get('/test/owner');
    return response.data;
  },

  getAdvertiser: async () => {
    const response = await api.get('/test/advertiser');
    return response.data;
  },

  getPublic: async () => {
    const response = await api.get('/test/public');
    return response.data;
  },
};

export default api;

