import api from '../api/client'

export async function generateQuotePdf(quoteId) {
  const res = await api.get(`/admin/quotes/${quoteId}/pdf/`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `quote-${quoteId}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export async function createQuote(data) {
  const res = await api.post('/admin/quotes/', data)
  return res.data
}

export async function listQuotes(params) {
  const res = await api.get('/admin/quotes/', { params })
  return res.data
}

export async function getQuote(id) {
  const res = await api.get(`/admin/quotes/${id}/`)
  return res.data
}

export async function updateQuote(id, data) {
  const res = await api.patch(`/admin/quotes/${id}/`, data)
  return res.data
}

export async function deleteQuote(id) {
  await api.delete(`/admin/quotes/${id}/`)
}
