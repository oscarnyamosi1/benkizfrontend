import { useState, useEffect, useRef } from 'react'
import { endpoints } from '../../api/client'
import { uploadToCloudinary } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

const BASE_URL = import.meta.env.VITE_BASE_URL

const EMPTY_FORM = { name: '', description: '', price: '', category: '', stock: '', imageUrl: '', image_file: null }
const CATEGORIES = ['cakes', 'bread', 'pastries', 'drinks', 'cupcakes', 'cookies', 'macarons', 'wedding', 'birthday']

export default function AdminProducts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)
  const [search, setSearch] = useState('')
  const fileRef = useRef()
  const { user } = useAuth()

  async function load() {
    setLoading(true)
    try {
      const res = await endpoints.admin.products.list(user)
      const data = res?.data
      console.log(`Your data ${res.data}`)
      setItems(Array.isArray(data) ? data:[])
      // setItems(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [])
    } catch { setItems([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleImagePick(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImg(true)
    try {
      // const res = await endpoints.admin.upload(file, 'products')
      uploadToCloudinary(file)
      setForm(f => ({ ...f, imageUrl: res.data.url, image_file: null }))
    } catch { setError('Image upload failed') } finally { setUploadingImg(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = { name: form.name, description: form.description, price: form.price, category: form.category, stock: form.stock, thumbnail: form.imageUrl }
      if (editId) await endpoints.admin.products.update(editId, payload)
      else await endpoints.admin.products.create(payload)
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await endpoints.admin.products.delete(id).catch(() => {})
    await load()
  }

  function openEdit(item) {
    setForm({ name: item.name, description: item.description || '', price: item.price || '', category: item.category || '', stock: item.stock ?? '', imageUrl: item.thumbnail || item.imageUrl || '', image_file: null })
    setEditId(item.id); setShowForm(true); setError('')
  }

  const filtered = items.filter(i => !search || i.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Products</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{items.length} products total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError('') }}>
          <i className="fa fa-plus" /> Add Product
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="input" type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{editId ? 'Edit Product' : 'New Product'}</h2>
              <button className="navbar__icon-btn" onClick={() => setShowForm(false)}><i className="fa fa-times" /></button>
            </div>
            {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="label">Product Name *</label>
                  <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="label">Price (KES) *</label>
                    <input className="input" type="number" required min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Stock</label>
                    <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select className="input" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Product Image (Cloudinary)</label>
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                  )}
                  <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()} disabled={uploadingImg}>
                    {uploadingImg ? <><i className="fa fa-spinner fa-spin" /> Uploading...</> : <><i className="fa fa-upload" /> Upload Image</>}
                  </button>
                  {form.imageUrl && <input className="input" style={{ marginTop: 8 }} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="Or paste Cloudinary URL" />}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                  {saving ? <><i className="fa fa-spinner fa-spin" /> Saving...</> : 'Save Product'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><i className="fa fa-box" /><h3>No products found</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
          {filtered.map(item => (
            <div key={item.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ height: 160, background: 'var(--color-bg)', overflow: 'hidden', position: 'relative' }}>
                {item.thumbnail || item.imageUrl ? (
                  <img src={`${BASE_URL}${item.thumbnail}` || item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                    <i className="fa fa-image" style={{ fontSize: 32 }} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                  {item.stock !== undefined && item.stock <= 0 && (
                    <span style={{ background: '#f8d7da', color: '#842029', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Out of stock</span>
                  )}
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{item.category} · Stock: {item.stock ?? '∞'}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>KES {Number(item.price).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(item)}>
                    <i className="fa fa-edit" /> Edit
                  </button>
                  <button className="btn btn-sm" style={{ background: '#f8d7da', color: '#842029', border: 'none' }} onClick={() => handleDelete(item.id)}>
                    <i className="fa fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
