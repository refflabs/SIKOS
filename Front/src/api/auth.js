import api from './axios'

export const register = async (data) => {
  const res = await api.post('/register', data)
  return res.data
}

export const login = async (email, password) => {
  const res = await api.post('/login', { email, password })
  return res.data
}

export const logout = async () => {
  await api.post('/logout')
}

export const getMe = async () => {
  const res = await api.get('/me')
  return res.data
}

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}
