import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <img src="../src/assets/logo.webp" alt="Benkiz Bakers" />
        </div>

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
              <input className="form-control" type="text" placeholder="Choose a username" value={regForm.username} onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" type="text" placeholder="Your last name" value={regForm.lastname} onChange={e => setRegForm(f => ({ ...f, lastname: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" placeholder="you@email.com" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="Choose a password" value={regForm.password1} onChange={e => setRegForm(f => ({ ...f, password1: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" placeholder="Confirm your password" value={regForm.password2} onChange={e => setRegForm(f => ({ ...f, password2: e.target.value }))} required />
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
