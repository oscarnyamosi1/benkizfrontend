import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { endpoints } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Contact() {
  const { user } = useAuth()
  const [locations, setLocations] = useState([])
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    endpoints.locations.list().then(r => setLocations(r.data || [])).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setError('')
    try {
      await endpoints.contact.send({ message })
      setSent(true)
      setMessage('')
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>Contact Us</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <span>Contact</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <a href="tel:+254795404843" className="btn btn-primary btn-lg">
              <i className="fa fa-phone" /> 0795404843
            </a>
          </div>

          {locations.length > 0 && (
            <div className="grid-3" style={{ marginBottom: 64 }}>
              {locations.map(loc => (
                <div key={loc.id} className="card" style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--color-primary)' }}>
                    <i className="fa fa-map-marker-alt" style={{ marginRight: 8 }} />{loc.name}
                  </h3>
                  <ul style={{ color: 'var(--color-text-muted)', lineHeight: 2.2 }}>
                    <li><i className="fa fa-map-pin" style={{ marginRight: 8, color: 'var(--color-primary)' }} />{loc.name}, Kenya</li>
                    {loc.contact && <li><i className="fa fa-phone" style={{ marginRight: 8, color: 'var(--color-primary)' }} />+254 {loc.contact}</li>}
                    {loc.mail && <li><i className="fa fa-envelope" style={{ marginRight: 8, color: 'var(--color-primary)' }} />{loc.mail}</li>}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="grid-2" style={{ gap: 48, alignItems: 'flex-start' }}>
            <div>
              <div className="section-title">
                <span>Get in Touch</span>
                <h2>Contact us!</h2>
              </div>
              <ul style={{ color: 'var(--color-text-muted)', lineHeight: 2.5 }}>
                <li><i className="fa fa-clock" style={{ marginRight: 8, color: 'var(--color-primary)' }} />Representatives available:</li>
                <li>Mon-Fri: 5:00am to 9:00pm</li>
                <li>Sat-Sun: 6:00am to 9:00pm</li>
              </ul>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="tel:+254795404843" className="btn btn-primary">
                  <i className="fa fa-phone" /> Call Us
                </a>
                <a href="https://wa.me/254707091550" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp" /> WhatsApp
                </a>
              </div>
            </div>

            <div>
              {sent ? (
                <div className="alert alert-success" style={{ padding: 32, textAlign: 'center' }}>
                  <i className="fa fa-check-circle" style={{ fontSize: 40, marginBottom: 12 }} />
                  <h3>Message Sent!</h3>
                  <p>We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && <div className="alert alert-error">{error}</div>}
                  {!user && (
                    <div className="alert alert-info" style={{ marginBottom: 16 }}>
                      <Link to="/auth" style={{ fontWeight: 700 }}>Login</Link> to send us a message.
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Your Message</label>
                    <textarea
                      className="form-control"
                      placeholder="Type your message here..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      disabled={!user}
                      style={{ minHeight: 160 }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={sending || !user} style={{ width: '100%', justifyContent: 'center' }}>
                    <i className={`fa ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} />
                    {sending ? ' Sending...' : ' Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
