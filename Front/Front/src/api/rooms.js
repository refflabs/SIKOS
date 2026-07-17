import api from './axios'

export const getRooms = async (params = {}) => {
  const res = await api.get('/rooms', { params })
  return res.data
}

export const getRoomById = async (id) => {
  const res = await api.get(`/rooms/${id}`)
  return res.data
}

export const createRoom = async (data) => {
  const res = await api.post('/rooms', data)
  return res.data
}

export const updateRoom = async (id, data) => {
  const res = await api.put(`/rooms/${id}`, data)
  return res.data
}

export const deleteRoom = async (id) => {
  const res = await api.delete(`/rooms/${id}`)
  return res.data
}

export const uploadRoomImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await api.post('/rooms/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

