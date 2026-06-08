import api from '../api/client'

export async function sendOrderNotification(orderId, type = 'new_order') {
  const res = await api.post('/admin/whatsapp/notify/', { order_id: orderId, type })
  return res.data
}

export async function sendStatusUpdate(orderId, status) {
  const res = await api.post('/admin/whatsapp/status/', { order_id: orderId, status })
  return res.data
}
