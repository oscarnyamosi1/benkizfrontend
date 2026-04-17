import { createContext, useContext, useState, useEffect } from 'react'
import { endpoints } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
  }, [])

  async function fetchMe() {
    try {
      const res = await endpoints.auth.me()
      setUser(res.data.user)
      setProfile(res.data.profile)
    } catch {
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(username, password) {
    await endpoints.auth.csrfToken()
    const res = await endpoints.auth.login({ username, password })
    setUser(res.data.user)
    setProfile(res.data.profile)
    return res.data
  }

  async function register(data) {
    await endpoints.auth.csrfToken()
    const res = await endpoints.auth.register(data)
    setUser(res.data.user)
    setProfile(res.data.profile)
    return res.data
  }

  async function logout() {
    await endpoints.auth.logout()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
