import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL;


export const MEDIA_URL = `${BASE_URL}/media`

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  // withCredentials: true,            chat gpt doesnt include this in explanation
  headers: { 'Content-Type': 'application/json' },
})


// -----------------------------
// JWT Interceptor
// -----------------------------
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt'); // access token
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});


// api.interceptors.request.use(config => {
//   const csrfToken = getCookie('csrftoken')
//   if (csrfToken) config.headers['X-CSRFToken'] = csrfToken
//   return config
// })                          
// this one uses csrf but the top one uses jwt tokens       ##################

// function getCookie(name) {
//   const value = `; ${document.cookie}`
//   const parts = value.split(`; ${name}=`)
//   if (parts.length === 2) return parts.pop().split(';').shift()
//   return null
// }
// this gets csrf from page or document cookies ##############################


export const endpoints = {
  items: {
    list: (params) => api.get('/items/', { params }),
    get: (id) => api.get(`/items/${id}/`),
    search: (query) => api.get('/items/', { params: { search: query } }),
    categories: () => api.get('/categories/'),
    featured: () => api.get('/items/featured/'),
  },
  // auth: {
  //   login: (data) => api.post('/auth/login/', data),
  //   logout: () => api.post('/auth/logout/'),
  //   register: (data) => api.post('/auth/register/', data),
  //   me: () => api.get('/auth/me/'),
  //   csrfToken: () => api.get('/auth/csrf/'),
  // },
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
  // profile: {
  //   get: () => api.get('/profile/'),
  //   update: (data) => api.patch('/profile/', data),
  // },

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



export default api;