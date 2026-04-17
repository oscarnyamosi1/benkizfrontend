import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { endpoints } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, profile: authProfile } = useAuth()
  const [profile, setProfile] = useState(authProfile)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    endpoints.profile.get().then(r => {
      setProfile(r.data)
      setForm(r.data)
    }).catch(() => {})
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await endpoints.profile.update(form)
      setProfile(res.data)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const picUrl = profile?.profilepic
    ? (profile.profilepic.startsWith('http') ? profile.profilepic : `https://benkizbakers.pythonanywhere.com${profile.profilepic}`)
    : null

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>My Profile</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <span>Profile</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container" style={{ maxWidth: 700 }}>
          {saved && <div className="alert alert-success"><i className="fa fa-check" /> Profile updated successfully!</div>}

          <div className="card" style={{ padding: 32 }}>
            <div className="profile-header">
              {picUrl ? (
                <img className="profile-avatar" src={picUrl} alt={user?.username} />
              ) : (
                <div className="profile-avatar" style={{ background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa fa-user" style={{ fontSize: 36, color: 'white' }} />
                </div>
              )}
              <div className="profile-meta">
                <h3>{user?.username}</h3>
                <p>{user?.email}</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(e => !e)}>
                <i className={`fa ${editing ? 'fa-times' : 'fa-edit'}`} /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="grid-2" style={{ gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-control" type="text" value={form.lastname || ''} onChange={e => setForm(f => ({ ...f, lastname: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" type="tel" value={form.phone_number || ''} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-control" type="text" value={form.country || ''} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">County</label>
                    <input className="form-control" type="text" value={form.county || ''} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Address / Street</label>
                    <input className="form-control" type="text" value={form.address_or_street || ''} onChange={e => setForm(f => ({ ...f, address_or_street: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Apartment / House</label>
                    <input className="form-control" type="text" value={form.apartment_or_house_name_or_number || ''} onChange={e => setForm(f => ({ ...f, apartment_or_house_name_or_number: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="grid-2" style={{ gap: 20 }}>
                {[
                  { label: 'Username', value: user?.username, icon: 'fa-user' },
                  { label: 'Last Name', value: profile?.lastname, icon: 'fa-id-card' },
                  { label: 'Phone', value: profile?.phone_number, icon: 'fa-phone' },
                  { label: 'Country', value: profile?.country, icon: 'fa-globe' },
                  { label: 'County', value: profile?.county, icon: 'fa-map-marker-alt' },
                  { label: 'Address', value: profile?.address_or_street, icon: 'fa-home' },
                  { label: 'Apartment', value: profile?.apartment_or_house_name_or_number, icon: 'fa-building' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      <i className={`fa ${icon}`} style={{ marginRight: 6 }} />{label}
                    </div>
                    <div style={{ fontWeight: 600, color: value ? 'var(--color-text)' : 'var(--color-text-light)' }}>
                      {value || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <Link to="/cart" className="btn btn-outline btn-sm"><i className="fa fa-shopping-cart" /> My Cart</Link>
            <Link to="/wishlist" className="btn btn-outline btn-sm"><i className="fa fa-heart" /> Wishlist</Link>
            <Link to="/classes" className="btn btn-outline btn-sm"><i className="fa fa-graduation-cap" /> My Classes</Link>
          </div>
        </div>
      </section>
    </>
  )
}
