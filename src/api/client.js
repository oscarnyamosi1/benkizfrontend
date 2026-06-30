
// api.js
import axios from "axios";

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
const API_PATH = import.meta.env.VITE_API_PATH || '/api';

if (!import.meta.env.VITE_BASE_URL) {
  console.warn("⚠️ VITE_BASE_URL is not set, using default: http://localhost:8000");
}

// ---------------------------------------------------------------------------
// TOKEN MANAGEMENT
// ---------------------------------------------------------------------------
const TOKEN_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
};

export const tokenManager = {
  getAccess: () => localStorage.getItem(TOKEN_KEYS.ACCESS),
  getRefresh: () => localStorage.getItem(TOKEN_KEYS.REFRESH),
  
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    if (refresh) localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  },
  
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEYS.ACCESS),
};

// ---------------------------------------------------------------------------
// AXIOS INSTANCES
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: `${API_PATH}`,
  withCredentials: true,
  timeout: 30000,
});

// Separate instance for refresh to avoid interceptor loops
const refreshApi = axios.create({
  baseURL: `${API_PATH}`,
  withCredentials: true,
  timeout: 10000,
});

// ---------------------------------------------------------------------------
// MEDIA URL HELPER (FIXED)
// ---------------------------------------------------------------------------
export const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

// ---------------------------------------------------------------------------
// REFRESH TOKEN (IMPROVED)
// ---------------------------------------------------------------------------
let refreshPromise = null;

async function refreshToken() {
  // Prevent multiple concurrent refresh requests
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refresh = tokenManager.getRefresh();
      
      if (!refresh) {
        throw new Error('No refresh token available');
      }

      const { data } = await refreshApi.post('/auth/refresh/', { refresh });
      
      if (!data.access) {
        throw new Error('Invalid refresh response');
      }

      // Store new tokens
      tokenManager.setTokens(data.access, data.refresh || refresh);
      
      return data.access;
    } catch (error) {
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR (FIXED - WAS MISSING)
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccess();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set default content type if not specified
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// RESPONSE INTERCEPTOR (IMPROVED)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If no config or no response, reject
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    // Only handle 401 errors
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';

    // Don't attempt refresh on auth endpoints
    const authEndpoints = [
      '/auth/login/',
      '/auth/logout/',
      '/auth/me/',
      '/auth/refresh/',
      '/auth/register/', // ✅ Added
    ];
    
    if (authEndpoints.some(endpoint => url.includes(endpoint))) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loop
    if (originalRequest._retry) {
      tokenManager.clearTokens();
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Get new access token
      const newAccess = await refreshToken();
      
      // Update the failed request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear tokens and redirect
      tokenManager.clearTokens();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    }
  }
);

// ---------------------------------------------------------------------------
// AUTH HELPER FUNCTIONS
// ---------------------------------------------------------------------------
export const authHelpers = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      tokenManager.setTokens(access, refresh);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refresh = tokenManager.getRefresh();
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      // Don't redirect here - let the component handle it
    }
  },

  register: async (data) => {
    try {
      const response = await api.post('/auth/register/', data);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // ✅ Throw instead of return
    }
  },

  me: async () => {
    try {
      const response = await api.get('/auth/me/');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// ---------------------------------------------------------------------------
// ENDPOINTS (FIXED)
// ---------------------------------------------------------------------------
export const endpoints = {
  items: {
    list: (params) => api.get('/items/', { params }),
    get: (id) => api.get(`/items/${id}/`),
    search: (query) => api.get('/items/', { params: { search: query } }),
    categories: () => api.get('/categories/'),
    featured: () => api.get('/items/featured/'),
  },

  auth: authHelpers,

  admin: {
    dashboard: () => api.get('/admin/dashboard/'),

    products: {
      list: (params) => api.post('/admin/products/', { params }),
      get: (id) => api.get(`/admin/products/${id}/`),
      create: (data) => api.post('/admin/products/create/', data),
      update: (id, data) => api.patch(`/admin/products/${id}/`, data),
      delete: (id) => api.delete(`/admin/products/${id}/`),
    },
  },

  cart: {
    get: () => api.get('/cart/'),
    add: (itemId, quantity = 1) => 
      api.post('/cart/add/', { item_id: itemId, quantity }),
    update: (cartItemId, quantity) => 
      api.patch(`/cart/items/${cartItemId}/`, { quantity }),
    remove: (cartItemId) => 
      api.delete(`/cart/items/${cartItemId}/`),
  },

  wishlist: {
    get: () => api.get('/wishlist/'),
    add: (itemId) => api.post('/wishlist/add/', { item_id: itemId }),
    remove: (itemId) => api.delete(`/wishlist/remove/${itemId}/`),
  },

  team: {
    list: () => api.get('/team/'),
  },

  testimonials: {
    list: () => api.get('/testimonials/'),
  },

  profile: {
    get: async () => {
      const res = await api.get('/profile/');
      return {
        ...res.data,
        profilepic: mediaUrl(res.data.profilepic),
      };
    },
    update: (data) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      return api.patch('/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  checkout: {
    complete: (data) => api.post('/checkout/', data),
    status: (ref) => api.get(`/payment-status/${ref}/`),
  },

  mpesa: {
    stkPush: (data) => api.post('/mpesa/stkpush/', data),
    status: (id) => api.get(`/mpesa/status/${id}/`),
  },
};

// ---------------------------------------------------------------------------
// EXPORT
// ---------------------------------------------------------------------------
export default api;