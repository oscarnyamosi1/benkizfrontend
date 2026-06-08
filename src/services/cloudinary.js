import api from '../api/client'

export async function uploadToCloudinary(file, folder = 'benkiz') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  const res = await api.post('/admin/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.url
}

export function cloudinaryUrl(url, { width, height, quality = 'auto', format = 'auto' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url
  const transforms = []
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  transforms.push(`q_${quality}`, `f_${format}`)
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`)
}
