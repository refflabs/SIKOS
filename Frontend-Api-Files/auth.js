import api from './axios'

export const register = async (data) => {
  const res = await api.post('/register', data)
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('user', JSON.stringify(res.data.user))
  return res.data
}

export const login = async (email, password) => {
  const res = await api.post('/login', { email, password })
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('user', JSON.stringify(res.data.user))
  return res.data
}

export const logout = async () => {
  try {
    await api.post('/logout')
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export const getMe = async () => {
  const res = await api.get('/me')
  localStorage.setItem('user', JSON.stringify(res.data))
  return res.data
}
