import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL

if (!BASE_URL) {
  console.error("❌ VITE_BASE_URL is missing")
}

// -----------------------------
// API INSTANCE
// -----------------------------
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// -----------------------------
// MEDIA HELPER (🔥 FIXED - WAS MISSING)
// -----------------------------
const mediaUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}

// -----------------------------
// JWT INTERCEPTOR
// -----------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// -----------------------------
// ENDPOINTS
// -----------------------------
export const endpoints = {
  items: {
    list: (params) => api.get('/items/', { params }),
    get: (id) => api.get(`/items/${id}/`),
    search: (query) => api.get('/items/', { params: { search: query } }),
    categories: () => api.get('/categories/'),
    featured: () => api.get('/items/featured/'),
  },

  auth: {
    login: async (data) => {
      const res = await axios.post(`${BASE_URL}/api/token/`, data)
      localStorage.setItem('jwt', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      return res.data
    },

    logout: () => {
      localStorage.removeItem('jwt')
      localStorage.removeItem('refresh')
      return Promise.resolve()
    },

    me: () => api.get('/auth/me/'),
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
    add: (itemId) =>
      api.post('/wishlist/add/', { item_id: itemId }),
    remove: (itemId) =>
      api.delete(`/wishlist/remove/${itemId}/`),
  },

  classes: {
    list: () => api.get('/lessons/'),
    enroll: (lessonId) =>
      api.post(`/lessons/${lessonId}/enroll/`),
    unenroll: (lessonId) =>
      api.delete(`/lessons/${lessonId}/unenroll/`),
    basket: () => api.get('/course-basket/'),
  },

  profile: {
    get: async () => {
      const res = await api.get('/profile/')
      const profile = res.data

      return {
        ...profile,
        profilepic: mediaUrl(profile.profilepic), // 🔥 FIXED
      }
    },

    update: (data) => {
      const formData = new FormData()

      for (let key in data) {
        formData.append(key, data[key])
      }

      return api.patch('/profile/', formData)
    },
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
}

export default api