import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  getStoredUser,
} from '../api/auth'

/**
 * @typedef {Object} AuthContextValue
 * @property {object|null} user
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 * @property {boolean} isAdmin
 * @property {boolean} isLoading
 * @property {(email: string, password: string) => Promise<object>} login
 * @property {(data: object) => Promise<object>} register
 * @property {() => Promise<void>} logout
 */

/** @type {import('react').Context<AuthContextValue>} */
const AuthContext = createContext(/** @type {AuthContextValue} */ ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
}))

function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent('sikos:auth-changed'))
}

function persistAuth(token, user) {
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  } else {
    localStorage.removeItem('user')
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('token')))

  // Validate existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    getMe()
      .then((userData) => {
        if (cancelled) return
        persistAuth(storedToken, userData)
        setUser(userData)
        setToken(storedToken)
      })
      .catch((err) => {
        if (cancelled) return
        // Hanya bersihkan session jika server merespons dengan status 401 (Unauthorized)
        if (err.response?.status === 401) {
          persistAuth(null, null)
          setUser(null)
          setToken(null)
          notifyAuthChanged()
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    const newToken = data.token
    const newUser = data.user

    persistAuth(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
    notifyAuthChanged()

    return data
  }, [])

  const register = useCallback(async (formData) => {
    const data = await apiRegister(formData)
    const newToken = data.token
    const newUser = data.user

    persistAuth(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
    notifyAuthChanged()

    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      persistAuth(null, null)
      setToken(null)
      setUser(null)
      notifyAuthChanged()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** @returns {AuthContextValue} */
export function useAuth() {
  return useContext(AuthContext)
}
