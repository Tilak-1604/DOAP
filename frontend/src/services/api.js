

// This file is the single communication layer between:

// 👉 Frontend (React UI)
// 👉 Backend (Spring Boot APIs)


import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
// before sending the request to the backend, we add the token to the headers
// so that the backend can authenticate the request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.url, 'Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    // if the request is rejected, we return the error
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
// if the response is rejected, we return the error
// if the response is rejected because the token is expired or invalid, we remove the token from the local storage and redirect to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
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

// Screen API
export const screenAPI = {
  // Get all screens (ADMIN sees all, SCREEN_OWNER sees only their own)
  getAllScreens: async (params) => {
    const response = await api.get('/api/screens', { params });
    return response.data;
  },

  // Add new screen
  addScreen: async (screenData) => {
    const response = await api.post('/api/screens', screenData);
    return response.data;
  },

  // Approve screen (ADMIN only)
  approveScreen: async (screenId, status) => {
    const response = await api.put(`/api/screens/${screenId}/approval`, { status });
    return response.data;
  },

  // Get single screen by ID
  getScreenById: async (screenId) => {
    const response = await api.get(`/api/screens/${screenId}`);
    return response.data;
  },

  // Update screen details
  updateScreen: async (screenId, screenData) => {
    const response = await api.put(`/api/screens/${screenId}`, screenData);
    return response.data;
  },

  updateScreenStatus: async (screenId, status) => {
    const response = await api.put(`/api/screens/${screenId}/status`, { status });
    return response.data;
  },
};

// Content API
export const contentAPI = {
  uploadContent: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyContent: async () => {
    const response = await api.get('/api/content/my-content');
    return response.data;
  }
};

// Booking API
export const bookingAPI = {
  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/api/bookings/advertiser');
    return response.data;
  },

  getScreenBookings: async (screenId) => {
    const response = await api.get(`/api/bookings/screen/${screenId}`);
    return response.data;
  },

  getAvailability: async (screenId, date) => {
    const response = await api.get(`/api/bookings/availability`, {
      params: { screenId, date }
    });
    return response.data;
  }
};

export const paymentAPI = {
  pay: async (bookingId) => {
    const response = await api.post(`/api/payments/pay`, null, {
      params: { bookingId }
    });
    return response.data;
  }
};

// Ad Details API
export const adDetailsAPI = {
  saveAdDetails: async (adDetailsData) => {
    const response = await api.post('/api/ad-details', adDetailsData);
    return response.data;
  },

  getDetailsByContentId: async (contentId) => {
    const response = await api.get(`/api/ad-details/content/${contentId}`);
    return response.data;
  }
};

// Recommendation API
export const recommendationAPI = {
  getRecommendations: async (contentId) => {
    const response = await api.get(`/api/recommendations/content/${contentId}`);
    return response.data;
  }
};

export default api;
