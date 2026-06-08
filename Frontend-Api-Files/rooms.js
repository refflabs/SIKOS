import api from './axios'

// Ambil semua kamar (bisa filter)
// contoh: getRooms({ status: 'available', type: 'single' })
export const getRooms = async (params = {}) => {
  const res = await api.get('/rooms', { params })
  return res.data
}

// Ambil detail 1 kamar
export const getRoomById = async (id) => {
  const res = await api.get(`/rooms/${id}`)
  return res.data
}

// Tambah kamar (admin)
export const createRoom = async (data) => {
  const res = await api.post('/rooms', data)
  return res.data
}

// Update kamar (admin)
export const updateRoom = async (id, data) => {
  const res = await api.put(`/rooms/${id}`, data)
  return res.data
}

// Hapus kamar (admin)
export const deleteRoom = async (id) => {
  const res = await api.delete(`/rooms/${id}`)
  return res.data
}
