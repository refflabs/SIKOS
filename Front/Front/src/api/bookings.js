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

export const updateBookingStatus = async (id, status, notes = null) => {
  const res = await api.put(`/bookings/${id}`, { status, notes })
  return res.data
}

export const deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`)
  return res.data
}

export const requestBookingRenewal = async (id, durationMonths) => {
  const res = await api.post(`/bookings/${id}/renew`, { duration_months: durationMonths })
  return res.data
}

export const handleBookingRenewalAction = async (id, action) => {
  const res = await api.put(`/bookings/${id}`, { renewal_action: action })
  return res.data
}

export const uploadPaymentReceipt = async (id, imageBase64) => {
  const res = await api.post(`/bookings/${id}/payment-receipt`, { image: imageBase64 })
  return res.data
}
