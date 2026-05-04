import axios from 'axios';

// -----------------------------
// ENV
// -----------------------------
const BASE_URL = import.meta.env.VITE_BASE_URL;

if (!BASE_URL) {
  console.error("❌ VITE_BASE_URL is not defined");
}

// -----------------------------
// MEDIA HELPER (FIXED)
// -----------------------------
export const MEDIA_URL = `${BASE_URL}/media`;

const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_URL}/${path}`;
};

// -----------------------------
// AXIOS INSTANCE
// -----------------------------
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------
// REQUEST INTERCEPTOR (JWT)
// -----------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------
// RESPONSE INTERCEPTOR (REFRESH TOKEN)
// -----------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = localStorage.getItem('refresh');
      if (!refresh) return Promise.reject(error);

      try {
        const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem('jwt', newAccess);

        original.headers['Authorization'] = `Bearer ${newAccess}`;
        return api(original);
      } catch (err) {
        console.error("🔒 Token refresh failed");
        localStorage.clear();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------
// SAFE REQUEST WRAPPER
// -----------------------------
const safeRequest = async (req) => {
  try {
    const res = await req;
    return res.data;
  } catch (err) {
    console.error("API ERROR:", err?.response || err.message);
    return null; // prevents crashes
  }
};

// -----------------------------
// ENDPOINTS
// -----------------------------
export const endpoints = {
  items: {
    list: (params) => safeRequest(api.get('/items/', { params })),
    get: (id) => safeRequest(api.get(`/items/${id}/`)),
    search: (query) =>
      safeRequest(api.get('/items/', { params: { search: query } })),
    categories: () => safeRequest(api.get('/categories/')),
    featured: () => safeRequest(api.get('/items/featured/')),
  },

  auth: {
    login: async (data) => {
      try {
        const res = await axios.post(`${BASE_URL}/api/token/`, data);
        localStorage.setItem('jwt', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        return res.data;
      } catch (err) {
        console.error("LOGIN ERROR:", err?.response || err.message);
        return null;
      }
    },

    logout: () => {
      localStorage.removeItem('jwt');
      localStorage.removeItem('refresh');
      return Promise.resolve();
    },

    me: () => safeRequest(api.get('/auth/me/')),
  },

  cart: {
    get: () => safeRequest(api.get('/cart/')),
    add: (itemId, quantity = 1) =>
      safeRequest(api.post('/cart/add/', { item_id: itemId, quantity })),
    update: (cartItemId, quantity) =>
      safeRequest(
        api.patch(`/cart/items/${cartItemId}/`, { quantity })
      ),
    remove: (cartItemId) =>
      safeRequest(api.delete(`/cart/items/${cartItemId}/`)),
  },

  wishlist: {
    get: () => safeRequest(api.get('/wishlist/')),
    add: (itemId) =>
      safeRequest(api.post('/wishlist/add/', { item_id: itemId })),
    remove: (itemId) =>
      safeRequest(api.delete(`/wishlist/remove/${itemId}/`)),
  },

  classes: {
    list: () => safeRequest(api.get('/lessons/')),
    enroll: (lessonId) =>
      safeRequest(api.post(`/lessons/${lessonId}/enroll/`)),
    unenroll: (lessonId) =>
      safeRequest(api.delete(`/lessons/${lessonId}/unenroll/`)),
    basket: () => safeRequest(api.get('/course-basket/')),
  },

  profile: {
    get: async () => {
      const data = await safeRequest(api.get('/profile/'));
      if (!data) return null;

      return {
        ...data,
        profilepic: mediaUrl(data.profilepic),
      };
    },

    update: async (data) => {
      try {
        const formData = new FormData();
        for (let key in data) {
          formData.append(key, data[key]);
        }

        const res = await api.patch('/profile/', formData);
        return res.data;
      } catch (err) {
        console.error("PROFILE UPDATE ERROR:", err);
        return null;
      }
    },
  },

  testimonials: {
    list: () => safeRequest(api.get('/testimonials/')),
    create: (data) => safeRequest(api.post('/testimonials/', data)),
  },

  team: {
    list: () => safeRequest(api.get('/team/')),
  },

  locations: {
    list: () => safeRequest(api.get('/locations/')),
  },

  contact: {
    send: (data) => safeRequest(api.post('/contact/', data)),
  },

  checkout: {
    complete: (data) => safeRequest(api.post('/checkout/', data)),
    status: (ref) =>
      safeRequest(api.get(`/payment-status/${ref}/`)),
  },

  stats: {
    overview: () => safeRequest(api.get('/stats/')),
  },
};

export default api;
