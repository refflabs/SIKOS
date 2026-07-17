import api from './axios'

export const getPaymentSummary = async () => {
  const res = await api.get('/payments/summary')
  return res.data
}

export const getPayments = async (params = {}) => {
  const res = await api.get('/payments', { params })
  return res.data
}

export const verifyPayment = async (id, action) => {
  const res = await api.post(`/payments/${id}/verify`, { action })
  return res.data
}
