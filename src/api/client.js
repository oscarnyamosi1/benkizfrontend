// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// if (!BASE_URL) {
//   console.error("VITE_BASE_URL is missing");
// }

// // ---------------------------------------------------------------------------
// // AXIOS API INSTANCE
// // ---------------------------------------------------------------------------

// const api = axios.create({
//   baseURL: `${BASE_URL}/api`,
//   withCredentials: true,
// });

// // ---------------------------------------------------------------------------
// // MEDIA URL HELPER
// // ---------------------------------------------------------------------------

// export const mediaUrl = (path) => {
//   if (!path) return null;
//   if (path.startsWith("http")) return path;
//   return `${BASE_URL}${path}`;
// };

// // ---------------------------------------------------------------------------
// // REFRESH TOKEN FUNCTION (FIXED)
// // ---------------------------------------------------------------------------

// async function refreshToken() {
//   const refresh = localStorage.getItem("refresh");

//   if (!refresh) throw new Error("No refresh token found");

//   const res = await api.post("/auth/refresh/", { refresh });

//   localStorage.setItem("access", res.data.access);

//   return res.data.access;
// }

// // ---------------------------------------------------------------------------
// // REQUEST INTERCEPTOR (attach access token)
// // ---------------------------------------------------------------------------

// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const original = err.config;

//     if (!original || err.response?.status !== 401) {
//       return Promise.reject(err);
//     }

//     const url = original.url || "";

//     if (
//       url.includes("/auth/login/") ||
//       url.includes("/auth/logout/") ||
//       url.includes("/auth/me/") ||
//       url.includes("/auth/refresh/")
//     ) {
//       return Promise.reject(err);
//     }

//     if (original._retry) {
//       return Promise.reject(err);
//     }

//     original._retry = true;

//     try {
//       const newAccess = await refreshToken();

//       original.headers.Authorization = `Bearer ${newAccess}`;

//       return api(original);
//     } catch (e) {
//       localStorage.removeItem("access");
//       localStorage.removeItem("refresh");
//       window.location.href = "/login";
//       return Promise.reject(e);
//     }
//   }
// );

// // ---------------------------------------------------------------------------
// // RESPONSE INTERCEPTOR (SAFE REFRESH FLOW)
// // ---------------------------------------------------------------------------

// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const original = err.config;

//     if (!original || err.response?.status !== 401) {
//       return Promise.reject(err);
//     }

//     const url = original.url || "";

//     // prevent loop on auth endpoints
//     if (
//       url.includes("/auth/refresh/") ||
//       url.includes("/auth/login/") ||
//       url.includes("/auth/logout/")
//     ) {
//       return Promise.reject(err);
//     }

//     // prevent retry loop
//     if (original._retry) {
//       return Promise.reject(err);
//     }

//     original._retry = true;

//     try {
//       const newAccess = await refreshToken();

//       original.headers.Authorization = `Bearer ${newAccess}`;

//       return api(original);
//     } catch (refreshError) {
//       localStorage.removeItem("access");
//       localStorage.removeItem("refresh");

//       window.location.href = "/login";

//       return Promise.reject(refreshError);
//     }
//   }
// );

// // ---------------------------------------------------------------------------
// // ENDPOINTS
// // ---------------------------------------------------------------------------

// export const endpoints = {
//   items: {
//     list: (params) => api.get("/items/", { params }),
//     get: (id) => api.get(`/items/${id}/`),
//     search: (query) => api.get("/items/", { params: { search: query } }),
//     categories: () => api.get("/categories/"),
//     featured: () => api.get("/items/featured/"),
//   },
  
//   auth: {
//     login: async (credentials) => {
//       const res = await api.post("/auth/login/", credentials);

//       localStorage.setItem("access", res.data.access);
//       localStorage.setItem("refresh", res.data.refresh);

//       return res;
//     },

//     logout: () => api.post("/auth/logout/"),

//     me: () => api.get("/auth/me/"),
//   },

//   admin: {
//     dashboard: () => api.get('/admin/dashboard/'),

//     products: {
//       list:   (params)       => api.post('/admin/products/', { params }),
//       get:    (id)           => api.get(`/admin/products/${id}/`),
//       create: (data)         => api.create('/admin/products/create/', data),
//       update: (id, data)     => api.patch(`/admin/products/edit/`, data),
//       delete: (id)           => api.delete(`/admin/products/${id}/`),
//     },
//   },

//   cart: {
//     get: () => api.get("/cart/"),
//     add: (itemId, quantity = 1) =>
//       api.post("/cart/add/", { item_id: itemId, quantity }),
//     update: (cartItemId, quantity) =>
//       api.patch(`/cart/items/${cartItemId}/`, { quantity }),
//     remove: (cartItemId) => api.delete(`/cart/items/${cartItemId}/`),
//   },

//   wishlist: {
//     get: () => api.get("/wishlist/"),
//     add: (itemId) => api.post("/wishlist/add/", { item_id: itemId }),
//     remove: (itemId) => api.delete(`/wishlist/remove/${itemId}/`),
//   },

//   profile: {
//     get: async () => {
//       const res = await api.get("/profile/");
//       return {
//         ...res.data,
//         profilepic: mediaUrl(res.data.profilepic),
//       };
//     },

//     update: (data) => {
//       const fd = new FormData();
//       Object.keys(data).forEach((k) => fd.append(k, data[k]));

//       return api.patch("/profile/", fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     },
//   },

//   checkout: {
//     complete: (data) => api.post("/checkout/", data),
//     status: (ref) => api.get(`/payment-status/${ref}/`),
//   },

//   mpesa: {
//     stkPush: (data) => api.post("/mpesa/stkpush/", data),
//     status: (id) => api.get(`/mpesa/status/${id}/`),
//   },
// };

// export default api;



import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// if (!BASE_URL) {
//   console.error("VITE_BASE_URL is missing");
// }

// ---------------------------------------------------------------------------
// AXIOS INSTANCES
// ---------------------------------------------------------------------------
const apiPath = import.meta.env.VITE_API_PATH || '/api'

const api = axios.create({
  baseURL: apiPath,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: apiPath,
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// MEDIA URL HELPER
// ---------------------------------------------------------------------------

export const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

// ---------------------------------------------------------------------------
// REFRESH TOKEN
// ---------------------------------------------------------------------------

async function refreshToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("No refresh token");
  }

  const { data } = await refreshApi.post("/auth/refresh/", {
    refresh,
  });

  localStorage.setItem("access", data.access);

  return data.access;
}

// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// RESPONSE INTERCEPTOR
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    // Never refresh these endpoints
    if (
      url.includes("/auth/login/") ||
      url.includes("/auth/logout/") ||
      url.includes("/auth/me/") ||
      url.includes("/auth/refresh/")
    ) {
      return Promise.reject(error);
    }

    // Already retried
    if (originalRequest._retry) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccess = await refreshToken();

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

export const endpoints = {
  items: {
    list: (params) => api.get("/items/", { params }),
    get: (id) => api.get(`/items/${id}/`),
    search: (query) => api.get("/items/", { params: { search: query } }),
    categories: () => api.get("/categories/"),
    featured: () => api.get("/items/featured/"),
  },

  auth: {
    login: async (credentials) => {
      const res = await api.post("/auth/login/", credentials);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      return res;
    },

    logout: async () => {
      try {
        await api.post("/auth/logout/");
      } finally {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    },
    register: async (data) => {
      try {
        const result = await api.post("/auth/register/",data);
        return result
      } catch (err){
        console.log("Little Problem !")
        return(err)
      }
    },

    me: () => api.get("/auth/me/"),
  },

  admin: {
    dashboard: () => api.get("/admin/dashboard/"),

    products: {
      list: (params) => api.get("/admin/products/", { params }),

      get: (id) => api.get(`/admin/products/${id}/`),

      create: (data) =>
        api.post("/admin/products/create/", data),

      update: (id, data) =>
        api.patch(`/admin/products/${id}/`, data),

      delete: (id) =>
        api.delete(`/admin/products/${id}/`),
    },
  },

  cart: {
    get: () => api.get("/cart/"),

    add: (itemId, quantity = 1) =>
      api.post("/cart/add/", {
        item_id: itemId,
        quantity,
      }),

    update: (cartItemId, quantity) =>
      api.patch(`/cart/items/${cartItemId}/`, {
        quantity,
      }),

    remove: (cartItemId) =>
      api.delete(`/cart/items/${cartItemId}/`),
  },

  wishlist: {
    get: () => api.get("/wishlist/"),

    add: (itemId) =>
      api.post("/wishlist/add/", {
        item_id: itemId,
      }),

    remove: (itemId) =>
      api.delete(`/wishlist/remove/${itemId}/`),
  },
  team: {
    list: () => api.get("/team/"),
  },
  testimonials: {
    list: () => api.get("/testimonials/"),
  },

  profile: {
    get: async () => {
      const res = await api.get("/profile/");

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

      return api.patch("/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  },

  checkout: {
    complete: (data) => api.post("/checkout/", data),

    status: (ref) =>
      api.get(`/payment-status/${ref}/`),
  },

  mpesa: {
    stkPush: (data) =>
      api.post("/mpesa/stkpush/", data),

    status: (id) =>
      api.get(`/mpesa/status/${id}/`),
  },
};

export default api;