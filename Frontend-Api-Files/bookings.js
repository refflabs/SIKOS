import api from './axios'

// Ambil semua booking (admin: semua, user: miliknya)
export const getBookings = async () => {
  const res = await api.get('/bookings')
  return res.data
}

// Ambil detail booking
export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/${id}`)
  return res.data
}

// Buat booking baru
// data: { room_id, check_in, duration_months, notes }
export const createBooking = async (data) => {
  const res = await api.post('/bookings', data)
  return res.data
}

// Update status booking (admin)
// status: 'confirmed' | 'cancelled' | 'pending'
export const updateBookingStatus = async (id, status) => {
  const res = await api.put(`/bookings/${id}`, { status })
  return res.data
}

// Hapus booking
export const deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`)
  return res.data
}
