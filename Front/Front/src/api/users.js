import api from './axios'

export const getUsers = async (params = {}) => {
  const res = await api.get('/users', { params })
  return res.data
}

export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}`)
  return res.data
}

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data)
  return res.data
}

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`)
  return res.data
}
