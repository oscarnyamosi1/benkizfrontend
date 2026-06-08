import api from '../api/client'

export async function initiateStkPush({ phone, amount, orderId }) {
  const res = await api.post('/mpesa/stkpush/', { phone, amount, order_id: orderId })
  return res.data
}

export async function checkPaymentStatus(checkoutRequestId) {
  const res = await api.get(`/mpesa/status/${checkoutRequestId}/`)
  return res.data
}

export function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1)
  if (cleaned.startsWith('+')) return cleaned.slice(1)
  return cleaned
}
