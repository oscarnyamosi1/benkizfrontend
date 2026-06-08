import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEMO_ROLES = [
  { role: 'ADMIN',    label: 'Admin',    icon: 'fa-cog',       desc: 'Full admin panel access' },
  { role: 'CUSTOMER', label: 'Customer', icon: 'fa-user',      desc: 'Shop, cart & wishlist' },
  { role: 'STAFF',    label: 'Staff',    icon: 'fa-users',     desc: 'Orders & limited admin' },
  { role: 'SUPER_ADMIN', label: 'Super Admin', icon: 'fa-shield', desc: 'Tenants & all settings' },
]

export default function Auth() {
  // const { login, register, user, demoLogin } = useAuth()
  const { login, register, user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [regForm, setRegForm] = useState({ username: '', lastname: '', password1: '', password2: '', email: '' })

  if (user) {
    navigate('/')
    return null
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginForm.username, loginForm.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (regForm.password1 !== regForm.password2) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(regForm)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // function handleDemo(role) {
    // demoLogin(role)
  //   navigate('/')
  // }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <img src="../src/assets/logo.webp" alt="Benkiz Bakers" />
        </div>

        {/* ── Demo banner ── */}
        {/* <div style={{
          background: 'var(--color-primary-light, #fff8e1)',
          border: '1.5px dashed var(--color-primary)',
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-primary-dark, #7a5000)' }}>
            <i className="fa fa-bolt" style={{ marginRight: 6 }} />
            Demo mode — no backend required
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ROLES.map(({ role, label, icon, desc }) => (
              <button
                key={role}
                onClick={() => handleDemo(role)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 2, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', cursor: 'pointer',
                  fontSize: 13, transition: 'box-shadow .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <span style={{ fontWeight: 600 }}>
                  <i className={`fa ${icon}`} style={{ marginRight: 5, color: 'var(--color-primary)' }} />
                  {label}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{desc}</span>
              </button>
            ))}
          </div>
        </div> */}

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>
            Login
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label"><i className="fa fa-user" style={{ marginRight: 6 }} />Username</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label"><i className="fa fa-lock" style={{ marginRight: 6 }} />Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-sign-in'}`} />
              {loading ? ' Logging in...' : ' Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-control" type="text" placeholder="Choose a username" value={regForm.username} onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))} required autoComplete="username" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" type="text" placeholder="Your last name" value={regForm.lastname} onChange={e => setRegForm(f => ({ ...f, lastname: e.target.value }))} autoComplete="family-name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" placeholder="you@email.com" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="Choose a password" value={regForm.password1} onChange={e => setRegForm(f => ({ ...f, password1: e.target.value }))} required autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" placeholder="Confirm your password" value={regForm.password2} onChange={e => setRegForm(f => ({ ...f, password2: e.target.value }))} required autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-user-plus'}`} />
              {loading ? ' Registering...' : ' Create Account'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--color-primary)' }}>
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} /> Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}
