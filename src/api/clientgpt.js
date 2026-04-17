import axios from 'axios';

// Backend base URL
const BASE_URL = 'http://127.0.0.1:8000/api';

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------
// JWT Interceptor
// -----------------------------
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt'); // access token
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Optional: refresh JWT on 401 responses
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/token/refresh/`, { refresh });
          localStorage.setItem('jwt', res.data.access);
          originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch () {
          localStorage.removeItem('jwt');
          localStorage.removeItem('refresh');
          window.location.href = '/login'; // redirect to login
        }
      }
    }
    return Promise.reject(err);
  }
);

// -----------------------------
// Helper: construct full media URL
// -----------------------------
export const mediaUrl = (path) =>
  path ? (path.startsWith('http') ? path : `${BASE_URL}/media/${path}`) : null;

// -----------------------------
// Endpoints
// -----------------------------
export const endpoints = {
  auth: {
    login: async (data) => {
      const res = await axios.post(`${BASE_URL}/token/`, data);
      localStorage.setItem('jwt', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      return res.data;
    },
    logout: () => {
      localStorage.removeItem('jwt');
      localStorage.removeItem('refresh');
      return Promise.resolve();
    },
    me: () => api.get('/auth/me/'),
  },

  profile: {
    get: async () => {
      const res = await api.get('/profile/');
      // attach full media URL for profile picture
      const profile = res.data;
      profile.profilepic = mediaUrl(profile.profilepic);
      return profile;
    },
    update: (data) => {
      // if updating files, use FormData
      const formData = new FormData();
      for (let key in data) {
        formData.append(key, data[key]);
      }
      return api.patch('/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  items: {
    list: (params) => api.get('/items/', { params }),
    get: (id) => api.get(`/items/${id}/`),
    search: (query) => api.get('/items/', { params: { search: query } }),
    categories: () => api.get('/categories/'),
    featured: () => api.get('/items/featured/'),
  },

  cart: {
    get: () => api.get('/cart/'),
    add: (itemId, quantity = 1) => api.post('/cart/add/', { item_id: itemId, quantity }),
    update: (cartItemId, quantity) => api.patch(`/cart/items/${cartItemId}/`, { quantity }),
    remove: (cartItemId) => api.delete(`/cart/items/${cartItemId}/`),
  },

  wishlist: {
    get: () => api.get('/wishlist/'),
    add: (itemId) => api.post('/wishlist/add/', { item_id: itemId }),
    remove: (itemId) => api.delete(`/wishlist/remove/${itemId}/`),
  },

  classes: {
    list: () => api.get('/lessons/'),
    enroll: (lessonId) => api.post(`/lessons/${lessonId}/enroll/`),
    unenroll: (lessonId) => api.delete(`/lessons/${lessonId}/unenroll/`),
    basket: () => api.get('/course-basket/'),
  },

  testimonials: {
    list: () => api.get('/testimonials/'),
    create: (data) => api.post('/testimonials/', data),
  },

  team: {
    list: () => api.get('/team/'),
  },

  locations: {
    list: () => api.get('/locations/'),
  },

  contact: {
    send: (data) => api.post('/contact/', data),
  },

  checkout: {
    complete: (data) => api.post('/checkout/', data),
    status: (ref) => api.get(`/payment-status/${ref}/`),
  },

  stats: {
    overview: () => api.get('/stats/'),
  },
};

export default api;