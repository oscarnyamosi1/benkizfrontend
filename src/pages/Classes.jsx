import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { endpoints } from '../api/client'
import { useAuth } from '../context/AuthContext'

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Classes() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState([])
  const [basket, setBasket] = useState({ selected: [], enrolled: [] })
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', mode: 'online_class' })
  const [formSent, setFormSent] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [lessRes, basketRes] = await Promise.allSettled([
          endpoints.classes.list(),
          user ? endpoints.classes.basket() : Promise.reject(),
        ])
        if (lessRes.status === 'fulfilled') setLessons(lessRes.value.data || [])
        if (basketRes.status === 'fulfilled') setBasket(basketRes.value.data || { selected: [], enrolled: [] })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleEnroll(lessonId) {
    setRegistering(lessonId)
    try {
      await endpoints.classes.enroll(lessonId)
      const res = await endpoints.classes.basket()
      setBasket(res.data)
    } finally {
      setRegistering(null)
    }
  }

  async function handleUnenroll(lessonId) {
    setRegistering(lessonId)
    try {
      await endpoints.classes.unenroll(lessonId)
      const res = await endpoints.classes.basket()
      setBasket(res.data)
    } finally {
      setRegistering(null)
    }
  }

  const selectedIds = basket.selected?.map(l => l.id) || []
  const enrolledIds = basket.enrolled?.map(l => l.id) || []

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>Baking Classes</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <span>Classes</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          {user && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
              <div className="card" style={{ padding: '16px 24px', display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 180 }}>
                <i className="fa fa-shopping-basket" style={{ fontSize: 24, color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Course Basket</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{selectedIds.length} selected</div>
                </div>
              </div>
              <div className="card" style={{ padding: '16px 24px', display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 180 }}>
                <i className="fa fa-graduation-cap" style={{ fontSize: 24, color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Enrolled</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{enrolledIds.length} courses</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid-2" style={{ gap: 40, alignItems: 'flex-start' }}>
            <div>
              {lessons.length === 0 ? (
                <div className="empty-state">
                  <i className="fa fa-graduation-cap" />
                  <h3>No classes available</h3>
                  <p>Check back soon for upcoming classes!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {lessons.map(lesson => {
                    const imgUrl = lesson.thumbnail
                      ? (lesson.thumbnail.startsWith('http') ? lesson.thumbnail : `${BASE_URL}${lesson.thumbnail}`)
                      : null
                    const isSelected = selectedIds.includes(lesson.id)
                    const isEnrolled = enrolledIds.includes(lesson.id)

                    return (
                      <div key={lesson.id} className="lesson-card">
                        <div className="lesson-card__image" style={{ position: 'relative' }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={lesson.title} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-muted)', minHeight: 200 }}>
                              <i className="fa fa-graduation-cap" style={{ fontSize: 48, color: 'var(--color-border)' }} />
                            </div>
                          )}
                          <span className="lesson-card__price">Shs. {(lesson.price || 0).toLocaleString()}</span>
                          {user && (
                            <div className="lesson-card__enroll">
                              {isEnrolled ? (
                                <span className="btn btn-sm" style={{ background: 'var(--color-success)', color: 'white', cursor: 'default' }}>
                                  <i className="fa fa-check" /> Enrolled
                                </span>
                              ) : isSelected ? (
                                <button className="btn btn-outline btn-sm" style={{ background: 'white' }} onClick={() => handleUnenroll(lesson.id)} disabled={registering === lesson.id}>
                                  <i className="fa fa-times" /> Remove
                                </button>
                              ) : (
                                <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(lesson.id)} disabled={registering === lesson.id}>
                                  <i className={`fa ${registering === lesson.id ? 'fa-spinner fa-spin' : 'fa-plus'}`} /> Select
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="lesson-card__body">
                          <div className="lesson-card__title">{lesson.title}</div>
                          {lesson.timedescription && <div className="lesson-card__time"><i className="fa fa-clock" /> {lesson.timedescription}</div>}
                          {lesson.description && <div className="lesson-card__desc">{lesson.description}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ position: 'sticky', top: 90 }}>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Made From Your Own Hands</h3>
                {!user ? (
                  <form onSubmit={e => { e.preventDefault(); setFormSent(true) }}>
                    {formSent ? (
                      <div className="alert alert-success">
                        <i className="fa fa-check-circle" /> Registration sent! We'll be in touch.
                      </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input className="form-control" type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone Number</label>
                          <input className="form-control" type="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input className="form-control" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Learning Mode</label>
                          <select className="form-control" value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                            <option value="online_class">Online Class</option>
                            <option value="physical_class">Physical Class</option>
                          </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                          <i className="fa fa-paper-plane" /> Register for Class
                        </button>
                      </>
                    )}
                  </form>
                ) : (
                  <div>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.7 }}>
                      Select classes above and add them to your basket, then proceed to enroll.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <a href="tel:+254795404843" className="btn btn-primary btn-sm">
                        <i className="fa fa-phone" /> Call to Enroll
                      </a>
                      <a href="https://wa.me/254707091550" className="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-whatsapp" /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
