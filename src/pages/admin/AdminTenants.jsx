import { useState, useEffect } from 'react'
import { endpoints } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

const EMPTY_FORM = { name: '', domain: '', owner_email: '', plan: 'starter' }
const PLANS = ['starter', 'professional', 'enterprise']

export default function AdminTenants() {
  const { isSuperAdmin } = useAuth()
  if (!isSuperAdmin) return <Navigate to="/admin" replace />

  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const res = await endpoints.admin.tenants.list()
      const d = res.data
      setTenants(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : [])
    } catch { setTenants([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editId) await endpoints.admin.tenants.update(editId, form)
      else await endpoints.admin.tenants.create(form)
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  async function handleToggle(tenant) {
    setToggling(tenant.id)
    try {
      await endpoints.admin.tenants.toggle(tenant.id, !tenant.enabled)
      await load()
    } finally { setToggling(null) }
  }

  function openEdit(t) {
    setForm({ name: t.name, domain: t.domain || '', owner_email: t.owner_email || '', plan: t.plan || 'starter' })
    setEditId(t.id); setShowForm(true); setError('')
  }

  const PLAN_BADGE = { starter: '#2980b9', professional: '#8e44ad', enterprise: '#e85d75' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Bakery Tenants</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Manage all bakeries on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError('') }}>
          <i className="fa fa-plus" /> Add Bakery
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>{editId ? 'Edit Bakery' : 'New Bakery'}</h2>
              <button className="navbar__icon-btn" onClick={() => setShowForm(false)}><i className="fa fa-times" /></button>
            </div>
            {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label className="label">Bakery Name *</label>
                  <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Domain / Subdomain</label>
                  <input className="input" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="mybakery.benkiz.co.ke" />
                </div>
                <div>
                  <label className="label">Owner Email</label>
                  <input className="input" type="email" value={form.owner_email} onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Plan</label>
                  <select className="input" value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                    {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                  {saving ? <><i className="fa fa-spinner fa-spin" /> Saving...</> : 'Save Bakery'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : tenants.length === 0 ? (
        <div className="empty-state"><i className="fa fa-building" /><h3>No tenants yet</h3></div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {tenants.map(t => (
            <div key={t.id} className="card" style={{ padding: '20px 24px', opacity: t.enabled === false ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: (PLAN_BADGE[t.plan] || '#555') + '20', color: PLAN_BADGE[t.plan] || '#555' }}>{t.plan}</span>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: t.enabled !== false ? '#d1e7dd' : '#f8d7da', color: t.enabled !== false ? '#0f5132' : '#842029' }}>
                      {t.enabled !== false ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  {t.domain && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}><i className="fa fa-globe" /> {t.domain}</div>}
                  {t.owner_email && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}><i className="fa fa-envelope" /> {t.owner_email}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}><i className="fa fa-edit" /></button>
                  <button className="btn btn-sm" disabled={toggling === t.id}
                    style={{ background: t.enabled !== false ? '#f8d7da' : '#d1e7dd', color: t.enabled !== false ? '#842029' : '#0f5132', border: 'none' }}
                    onClick={() => handleToggle(t)}>
                    {toggling === t.id ? <i className="fa fa-spinner fa-spin" /> : <i className={`fa fa-${t.enabled !== false ? 'ban' : 'check'}`} />}
                    {' '}{t.enabled !== false ? 'Disable' : 'Enable'}
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
