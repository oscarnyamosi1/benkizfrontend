import { useState, useEffect } from 'react'
import { endpoints } from '../../api/client'
import { useAuth, ROLES } from '../../context/AuthContext'

const ROLE_OPTIONS = [ROLES.CUSTOMER, ROLES.STAFF, ROLES.ADMIN, ROLES.BAKERY_OWNER]
const EMPTY_FORM = { username: '', email: '', first_name: '', last_name: '', role: ROLES.CUSTOMER, password: '' }

export default function AdminUsers() {
  const { isBakeryOwner } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await endpoints.admin.users.list()
      const d = res.data
      setUsers(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : [])
    } catch { setUsers([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (editId) await endpoints.admin.users.update(editId, payload)
      else await endpoints.admin.users.create(payload)
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Save failed')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this user?')) return
    await endpoints.admin.users.delete(id).catch(() => {})
    await load()
  }

  function openEdit(u) {
    setForm({ username: u.username, email: u.email || '', first_name: u.first_name || '', last_name: u.last_name || '', role: u.role || ROLES.CUSTOMER, password: '' })
    setEditId(u.id); setShowForm(true); setError('')
  }

  const ROLE_BADGE = { SUPER_ADMIN: '#8e44ad', BAKERY_OWNER: '#2980b9', ADMIN: '#e85d75', STAFF: '#27ae60', CUSTOMER: '#555' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Users</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{users.length} users total</p>
        </div>
        {isBakeryOwner && (
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError('') }}>
            <i className="fa fa-plus" /> Add User
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>{editId ? 'Edit User' : 'New User'}</h2>
              <button className="navbar__icon-btn" onClick={() => setShowForm(false)}><i className="fa fa-times" /></button>
            </div>
            {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">First Name</label>
                    <input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Username *</label>
                  <input className="input" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                  <input className="input" type="password" required={!editId} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                  {saving ? <><i className="fa fa-spinner fa-spin" /> Saving...</> : 'Save User'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['User', 'Email', 'Role', 'Joined', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</div>
                    {u.first_name && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>@{u.username}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>{u.email || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: (ROLE_BADGE[u.role] || '#555') + '20', color: ROLE_BADGE[u.role] || '#555' }}>
                      {u.role || 'CUSTOMER'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isBakeryOwner && <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}><i className="fa fa-edit" /></button>}
                      {isBakeryOwner && <button className="btn btn-sm" style={{ background: '#f8d7da', color: '#842029', border: 'none' }} onClick={() => handleDelete(u.id)}><i className="fa fa-trash" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
