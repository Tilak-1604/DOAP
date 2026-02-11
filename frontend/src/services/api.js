

// This file is the single communication layer between:

// 👉 Frontend (React UI)
// 👉 Backend (Spring Boot APIs)


import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

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
      console.warn(`Auth Error: ${error.response.status} at ${error.config?.url}.`);

      if (error.response?.status === 401) {
        // Only redirect on 401 (Unauthorized) for now
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.error("FORBIDDEN: You don't have permission to access this resource. Check the backend logs for 'Setting authentication' line.");
      }
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

  getMyContent: () => api.get('/api/content/my-content').then(res => res.data),
  getMyMetadata: () => api.get('/api/content/my-metadata').then(res => res.data),
  deleteContent: (id) => api.delete(`/api/content/${id}`)
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
  },
  getSlots: async (screenId, date) => {
    const response = await api.get(`/api/bookings/screen/${screenId}/slots`, { params: { date } });
    return response.data;
  },
  downloadInvoice: async (bookingId) => {
    const response = await api.get(`/api/bookings/${bookingId}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Payment API
export const paymentAPI = {
  getRazorpayKey: async () => {
    const response = await api.get(`/api/payments/razorpay-key`);
    return response.data;
  },

  createOrder: async (bookingId) => {
    const response = await api.post(`/api/payments/create-order`, null, {
      params: { bookingId }
    });
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await api.post(`/api/payments/verify`, paymentData);
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/api/payments/my-history');
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

export const ownerAPI = {
  getDashboard: () => api.get('/api/screen-owner/dashboard').then(res => res.data),
  getBookings: () => api.get('/api/screen-owner/bookings').then(res => res.data),
  getEarnings: () => api.get('/api/screen-owner/earnings').then(res => res.data),
  getInsights: () => api.get('/api/screen-owner/insights').then(res => res.data),
};

export const userAPI = {
  updateProfile: async (data) => {
    const response = await api.put('/api/users/profile', data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.put('/api/users/password', data);
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/api/admin/dashboard/stats').then(res => res.data),

  // User Management
  getAllUsers: () => api.get('/api/admin/users').then(res => res.data),
  getUsersByRole: (role) => api.get(`/api/admin/users/by-role/${role}`).then(res => res.data),
  activateUser: (userId) => api.put(`/api/admin/users/${userId}/activate`).then(res => res.data),
  blockUser: (userId) => api.put(`/api/admin/users/${userId}/block`).then(res => res.data),

  // Screen Management
  getAllScreens: () => api.get('/api/admin/screens').then(res => res.data),
  getPendingScreens: () => api.get('/api/admin/screens/pending').then(res => res.data),
  getDoapScreens: () => api.get('/api/admin/screens/doap').then(res => res.data),
  addDoapScreen: (screenData) => api.post('/api/admin/screens/doap', screenData).then(res => res.data),
  approveScreen: (screenId) => api.put(`/api/admin/screens/${screenId}/approve`).then(res => res.data),
  rejectScreen: (screenId) => api.put(`/api/admin/screens/${screenId}/reject`).then(res => res.data),
  suspendScreen: (screenId) => api.put(`/api/admin/screens/${screenId}/suspend`).then(res => res.data),

  // Bookings
  getAllBookings: () => api.get('/api/admin/bookings').then(res => res.data),
  getBookingDetails: (bookingId) => api.get(`/api/admin/bookings/${bookingId}`).then(res => res.data),

  // Revenue
  getRevenueBreakdown: () => api.get('/api/admin/revenue/breakdown').then(res => res.data),

  // Settings
  getSettings: () => api.get('/api/admin/settings').then(res => res.data),
  updateSettings: (settings) => api.put('/api/admin/settings', settings).then(res => res.data),

  // Reporting
  getPlatformSummary: () => api.get('/api/admin/reports/summary').then(res => res.data),
  exportReport: (type, start, end) => api.get(`/api/admin/reports/export/${type}`, {
    params: { start, end },
    responseType: 'blob' // Important for CSV downloads
  }),
};

export default api;

