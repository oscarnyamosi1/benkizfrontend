import axios from 'axios';

// -----------------------------
// ENV
// -----------------------------
const BASE_URL = import.meta.env.VITE_BASE_URL;

// -----------------------------
// MEDIA HELPER (🔥 FIXED)
// -----------------------------
export const mediaUrl = (path) => {
  if (!path) return null;

  // already full URL
  if (path.startsWith('http')) return path;

  // ensure no double slashes
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// -----------------------------
// AXIOS INSTANCE
// -----------------------------
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------
// JWT INTERCEPTOR
// -----------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// -----------------------------
// RESPONSE INTERCEPTOR (REFRESH)
// -----------------------------
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = localStorage.getItem('refresh');
      if (!refresh) return Promise.reject(err);

      try {
        const res = await axios.post(
          `${BASE_URL}/api/token/refresh/`,
          { refresh }
        );

        localStorage.setItem('jwt', res.data.access);
        original.headers['Authorization'] = `Bearer ${res.data.access}`;

        return api(original);
      } catch (e) {
        localStorage.clear();
      }
    }

    return Promise.reject(err);
  }
);

// -----------------------------
// SAFE REQUEST WRAPPER
// -----------------------------
const safe = async (req) => {
  try {
    const res = await req;
    return res.data;
  } catch (err) {
    console.error("API ERROR:", err?.response || err.message);
    return null;
  }
};

// -----------------------------
// ENDPOINTS (ONLY CRITICAL FIX SHOWN)
// -----------------------------
export const endpoints = {
  profile: {
    get: async () => {
      const data = await safe(api.get('/profile/'));
      if (!data) return null;

      return {
        ...data,
        profilepic: mediaUrl(data.profilepic), // 🔥 FIXED
      };
    },
  },
};

export default api;