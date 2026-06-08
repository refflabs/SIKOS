import api from './axios'

export const getBookings = async () => {
  const res = await api.get('/bookings')
  return res.data
}

export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/${id}`)
  return res.data
}

export const createBooking = async (data) => {
  const res = await api.post('/bookings', data)
  return res.data
}

export const updateBookingStatus = async (id, status) => {
  const res = await api.put(`/bookings/${id}`, { status })
  return res.data
}

export const deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`)
  return res.data
}
