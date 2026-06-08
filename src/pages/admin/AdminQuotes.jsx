import { useState, useEffect } from 'react'
import { endpoints } from '../../api/client'
import '../../admincommon.css'

const EMPTY_FORM = {
  client_name: '', client_phone: '', event_date: '', event_type: '',
  items_table: '', subtotal: '', discount: '', total: '', notes: '',
  company_name: 'Benkiz Bakers', quote_id: '',
}

const EVENT_TYPES = ['Birthday', 'Wedding', 'Corporate', 'Anniversary', 'Graduation', 'Baby Shower', 'Other']

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')
  const [quoteItems, setQuoteItems] = useState([{ name: '', qty: 1, price: '' }])

  async function load() {
    setLoading(true)
    try {
      const res = await endpoints.admin.quotes.list()
      const d = res.data
      setQuotes(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : [])
    } catch { setQuotes([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function addItem() { setQuoteItems(q => [...q, { name: '', qty: 1, price: '' }]) }
  function removeItem(i) { setQuoteItems(q => q.filter((_, j) => j !== i)) }
  function updateItem(i, k, v) { setQuoteItems(q => q.map((it, j) => j === i ? { ...it, [k]: v } : it)) }

  const subtotal = quoteItems.reduce((s, it) => s + (Number(it.qty) * Number(it.price) || 0), 0)
  const discount = Number(form.discount) || 0
  const total = subtotal - discount

  function buildItemsTable() {
    return quoteItems.map(it => `${it.name} x${it.qty} @ KES ${Number(it.price).toLocaleString()} = KES ${(Number(it.qty) * Number(it.price)).toLocaleString()}`).join('\n')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const quoteId = editId || `Q-${Date.now()}`
    const payload = {
      ...form,
      quote_id: quoteId,
      items_table: buildItemsTable(),
      subtotal: subtotal.toString(),
      total: total.toString(),
    }
    try {
      if (editId) await endpoints.admin.quotes.update(editId, payload)
      else await endpoints.admin.quotes.create(payload)
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null); setQuoteItems([{ name: '', qty: 1, price: '' }])
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  async function handleDownload(id) {
    setDownloading(id)
    try {
      const res = await endpoints.admin.quotes.pdf(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `quote-${id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('PDF generation failed. Make sure the backend supports this endpoint.') }
    finally { setDownloading(null) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this quote?')) return
    await endpoints.admin.quotes.delete(id).catch(() => {})
    await load()
  }

  function openEdit(q) {
    setForm({ client_name: q.client_name || '', client_phone: q.client_phone || '', event_date: q.event_date || '', event_type: q.event_type || '', items_table: q.items_table || '', subtotal: q.subtotal || '', discount: q.discount || '', total: q.total || '', notes: q.notes || '', company_name: q.company_name || 'Benkiz Bakers', quote_id: q.quote_id || '' })
    setEditId(q.id); setShowForm(true); setError('')
  }

  const f = v => ({ target: { value: v } })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Catering Quotes</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Generate downloadable PDF quotes for clients</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError(''); setQuoteItems([{ name: '', qty: 1, price: '' }]) }}>
          <i className="fa fa-plus" /> New Quote
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>{editId ? 'Edit Quote' : 'New Quote'}</h2>
              <button className="navbar__icon-btn" onClick={() => setShowForm(false)}><i className="fa fa-times" /></button>
            </div>
            {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Client Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="label">Client Name *</label>
                      <input className="input quoteInput" required value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Phone *</label>
                      <input className="input quoteInput" required value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))} placeholder="2547XXXXXXXX" />
                    </div>
                    <div>
                      <label className="label">Event Date *</label>
                      <input className="input quoteInput" type="date" required value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Event Type *</label>
                      <select className="input quoteInput" required value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
                        <option value="">Select type</option>
                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Quote Items</div>
                    <button type="button" className="btn btn-outline btn-sm" onClick={addItem}><i className="fa fa-plus" /> Add Item</button>
                  </div>
                  {quoteItems.map((it, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 36px', gap: 8, marginBottom: 8 }}>
                      <input className="input quoteInput" placeholder="Item name" value={it.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                      <input className="input quoteInput" type="number" min="1" placeholder="Qty" value={it.qty} onChange={e => updateItem(i, 'qty', e.target.value)} />
                      <input className="input quoteInput" type="number" min="0" placeholder="Price" value={it.price} onChange={e => updateItem(i, 'price', e.target.value)} />
                      <button type="button" style={{ background: '#f8d7da', color: '#842029', border: 'none', borderRadius: 6, cursor: 'pointer' }} onClick={() => removeItem(i)}><i className="fa fa-trash" /></button>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span>Subtotal:</span><span style={{ fontWeight: 600 }}>KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span>Discount (KES):</span>
                      <input className="input quoteInput" type="number" min="0" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} style={{ width: 120, textAlign: 'right' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                      <span>Total:</span><span style={{ color: 'var(--color-primary)' }}>KES {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea className="input quoteInput" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, delivery info, etc." style={{ resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                  {saving ? <><i className="fa fa-spinner fa-spin" /> Saving...</> : 'Save Quote'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : quotes.length === 0 ? (
        <div className="empty-state"><i className="fa fa-file-pdf" /><h3>No quotes yet</h3><p>Create your first catering quote</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {quotes.map(q => (
            <div key={q.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{q.client_name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{q.event_type} · {q.event_date}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{q.client_phone}</div>
                  {q.quote_id && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{q.quote_id}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>KES {Number(q.total)?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>incl. discount</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleDownload(q.id)} disabled={downloading === q.id}>
                      {downloading === q.id ? <><i className="fa fa-spinner fa-spin" /> Generating...</> : <><i className="fa fa-download" /> PDF</>}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(q)}><i className="fa fa-edit" /></button>
                    <button className="btn btn-sm" style={{ background: '#f8d7da', color: '#842029', border: 'none' }} onClick={() => handleDelete(q.id)}><i className="fa fa-trash" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
