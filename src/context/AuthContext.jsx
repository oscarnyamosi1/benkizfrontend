import { createContext, useContext, useState, useEffect } from 'react'
import { endpoints } from '../api/client'
import { ROLES, ROLE_HIERARCHY } from '../constants/roles'

export { ROLES }

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  // true while we're attempting the silent boot refresh
  const [loading, setLoading] = useState(true)

  // On mount: try a silent token refresh (reads the httpOnly refresh-token
  // cookie that the backend set — JS never sees the refresh token itself).
  // If it succeeds we fetch the current user; if not, the user is logged out.
  useEffect(() => {
    async function bootSession() {
      try {
        const token = await endpoints.auth.refreshToken()
        if (token) {
          await fetchMe()
        }
      } catch {
        // no valid session — stay logged out
      } finally {
        setLoading(false)
      }
    }
    bootSession()
  }, [])

  async function fetchMe() {
    const res = await endpoints.auth.me()
    setUser(res.data.user ?? res.data)
    setProfile(res.data.profile ?? null)
  }

  async function login(username, password) {
    // client.js stores the access token in memory; backend sets the
    // httpOnly refresh-token cookie — no localStorage touched here.
    const res = await endpoints.auth.login({ username, password })
    setUser(res.data.user ?? res.data)
    setProfile(res.data.profile ?? null)
    return res.data
  }

  async function register(data) {
    const res = await endpoints.auth.register(data)
    // After register, log the user in so the session is established
    return login(data.username, data.password)
  }

  async function logout() {
    // Calls backend to clear the httpOnly cookie, then wipes in-memory token
    try { await endpoints.auth.logout() } catch { /* no backend in demo mode */ }
    setUser(null)
    setProfile(null)
  }

  // Demo-only: sets a mock user in memory without any API call.
  // Removed automatically the moment a real backend is connected.
  function demoLogin(role = 'ADMIN') {
    const DEMO_USERS = {
      SUPER_ADMIN: { id: 1, username: 'superadmin', first_name: 'Super', last_name: 'Admin', email: 'super@benkiz.co.ke', role: 'SUPER_ADMIN' },
      ADMIN:       { id: 2, username: 'admin',      first_name: 'Baker', last_name: 'Admin', email: 'admin@benkiz.co.ke', role: 'ADMIN' },
      STAFF:       { id: 3, username: 'staff',      first_name: 'Shop',  last_name: 'Staff',  email: 'staff@benkiz.co.ke', role: 'STAFF' },
      CUSTOMER:    { id: 4, username: 'customer',   first_name: 'Jane',  last_name: 'Doe',    email: 'jane@example.com',   role: 'CUSTOMER' },
    }
    setUser(DEMO_USERS[role] || DEMO_USERS.CUSTOMER)
    setProfile({ bio: 'Demo account', phone: '+254700000000' })
  }

  const role = user?.role || ROLES.CUSTOMER

  function hasRole(requiredRole) {
    const userIdx = ROLE_HIERARCHY.indexOf(role)
    const reqIdx = ROLE_HIERARCHY.indexOf(requiredRole)
    return userIdx !== -1 && userIdx <= reqIdx
  }

  const isAdmin = !!user && hasRole(ROLES.ADMIN)
  const isSuperAdmin = role === ROLES.SUPER_ADMIN
  const isBakeryOwner = hasRole(ROLES.BAKERY_OWNER)

  return (
    <AuthContext.Provider value={{
      user, profile, loading, role,
      isAdmin, isSuperAdmin, isBakeryOwner,
      hasRole, login, register, logout, fetchMe
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext) || {
    user: null, profile: null, loading: false, role: ROLES.CUSTOMER,
    isAdmin: false, isSuperAdmin: false, isBakeryOwner: false,
    hasRole: () => false,
    login: async () => {}, register: async () => {}, logout: async () => {}, fetchMe: async () => {},
  }
}
