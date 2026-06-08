import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL

if (!BASE_URL) {
  console.error('VITE_BASE_URL is missing')
}


// ---------------------------------------------------------------------------
// AXIOS API INSTANCE

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },

  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
})

// ---------------------------------------------------------------------------
// MEDIA URL HELPER
// ---------------------------------------------------------------------------
export const mediaUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}

// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR — attach access token from memory
// ---------------------------------------------------------------------------

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })

  failedQueue = []
}



api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    const isAuthRoute =
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/register/') ||
      originalRequest.url?.includes('/auth/logout/') ||
      originalRequest.url?.includes('/auth/me/') ||
      originalRequest.url?.includes('/refresh/')

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // FIXED: ensure refresh always hits correct endpoint
        await refreshApi.post('/refresh/')

        processQueue(null)

        return api(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError)

        if (window.location.pathname !== '/login/') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)


const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})


// ---------------------------------------------------------------------------
// RESPONSE INTERCEPTOR — silent token refresh on 401
// When the access token expires the backend returns 401.
// We call /api/token/refresh/ (Django SimpleJWT endpoint) which reads the
// httpOnly refresh-token cookie and returns a new access token in the body.
// We store that in memory and replay the original request once.
// ---------------------------------------------------------------------------




// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------
export const endpoints = {

  items: {
    list:       (params) => api.get('/items/', { params }),
    get:        (id)     => api.get(`/items/${id}/`),
    search:     (query)  => api.get('/items/', { params: { search: query } }),
    categories: ()       => api.get('/categories/'),
    featured:   ()       => api.get('/items/featured/'),
  },

auth: {
  csrf: () => api.get("/auth/csrf/"),

  login: (credentials) =>
    api.post("/auth/login/", credentials),

  logout: () =>
    api.post("/auth/logout/"),

  me: () =>
    api.get("/auth/me/"),

  refreshToken: () =>
    refreshApi.post("/refresh/")
},

  cart: {
    get:    ()                        => api.get('/cart/'),
    add:    (itemId, quantity = 1)    => api.post('/cart/add/', { item_id: itemId, quantity }),
    update: (cartItemId, quantity)    => api.patch(`/cart/items/${cartItemId}/`, { quantity }),
    remove: (cartItemId)              => api.delete(`/cart/items/${cartItemId}/`),
  },

  wishlist: {
    get:    ()       => api.get('/wishlist/'),
    add:    (itemId) => api.post('/wishlist/add/', { item_id: itemId }),
    remove: (itemId) => api.delete(`/wishlist/remove/${itemId}/`),
  },

  classes: {
    list:     ()          => api.get('/lessons/'),
    enroll:   (lessonId)  => api.post(`/lessons/${lessonId}/enroll/`),
    unenroll: (lessonId)  => api.delete(`/lessons/${lessonId}/unenroll/`),
    basket:   ()          => api.get('/course-basket/'),
  },

  profile: {
    get: async () => {
      const res = await api.get('/profile/')
      return { ...res.data, profilepic: mediaUrl(res.data.profilepic) }
    },
    update: (data) => {
      const fd = new FormData()
      for (const key in data) fd.append(key, data[key])
      return api.patch('/profile/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
  },

  testimonials: {
    list:   ()     => api.get('/testimonials/'),
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
    status:   (ref)  => api.get(`/payment-status/${ref}/`),
  },

  stats: {
    overview: () => api.get('/stats/'),
  },

  admin: {
    dashboard: () => api.get('/admin/dashboard/'),

    products: {
      list:   (params)       => api.get('/admin/products/', { params }),
      get:    (id)           => api.get(`/admin/products/${id}/`),
      create: (data)         => api.post('/admin/products/', data),
      update: (id, data)     => api.patch(`/admin/products/${id}/`, data),
      delete: (id)           => api.delete(`/admin/products/${id}/`),
    },

    orders: {
      list:         (params)         => api.get('/admin/orders/', { params }),
      get:          (id)             => api.get(`/admin/orders/${id}/`),
      updateStatus: (id, status)     => api.patch(`/admin/orders/${id}/`, { status }),
    },

    users: {
      list:   (params)       => api.get('/admin/users/', { params }),
      get:    (id)           => api.get(`/admin/users/${id}/`),
      create: (data)         => api.post('/admin/users/', data),
      update: (id, data)     => api.patch(`/admin/users/${id}/`, data),
      delete: (id)           => api.delete(`/admin/users/${id}/`),
    },

    quotes: {
      list:   (params)       => api.get('/admin/quotes/', { params }),
      get:    (id)           => api.get(`/admin/quotes/${id}/`),
      create: (data)         => api.post('/admin/quotes/', data),
      update: (id, data)     => api.patch(`/admin/quotes/${id}/`, data),
      delete: (id)           => api.delete(`/admin/quotes/${id}/`),
      pdf:    (id)           => api.get(`/admin/quotes/${id}/pdf/`, { responseType: 'blob' }),
    },

    tenants: {
      list:   (params)             => api.get('/admin/tenants/', { params }),
      get:    (id)                 => api.get(`/admin/tenants/${id}/`),
      create: (data)               => api.post('/admin/tenants/', data),
      update: (id, data)           => api.patch(`/admin/tenants/${id}/`, data),
      toggle: (id, enabled)        => api.patch(`/admin/tenants/${id}/`, { enabled }),
    },

    upload: (file, folder = 'benkiz') => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      return api.post('/admin/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },

    whatsapp: {
      notify: (orderId, type) => api.post('/admin/whatsapp/notify/', { order_id: orderId, type }),
    },
  },

  mpesa: {
    stkPush: (data)         => api.post('/mpesa/stkpush/', data),
    status:  (checkoutId)   => api.get(`/mpesa/status/${checkoutId}/`),
  },
}

export default api
