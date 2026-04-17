import axios from 'axios'

const api = axios.create({
  baseURL: 'https://benkizbakers.pythonanywhere.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken')
  if (csrfToken) config.headers['X-CSRFToken'] = csrfToken
  return config
})

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

export default api

export const endpoints = {
  items: {
    list: (params) => api.get('/items/', { params }),
    get: (id) => api.get(`/items/${id}/`),
    search: (query) => api.get('/items/', { params: { search: query } }),
    categories: () => api.get('/categories/'),
    featured: () => api.get('/items/featured/'),
  },
  auth: {
    login: (data) => api.post('/auth/login/', data),
    logout: () => api.post('/auth/logout/'),
    register: (data) => api.post('/auth/register/', data),
    me: () => api.get('/auth/me/'),
    csrfToken: () => api.get('/auth/csrf/'),
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
  profile: {
    get: () => api.get('/profile/'),
    update: (data) => api.patch('/profile/', data),
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
