import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { endpoints } from '../api/client'
import ProductCard from '../components/ProductCard'
import api from '../api/client'
import heroImage from '../assets/hero/hero.jpg'
const BASE_URL = import.meta.env.VITE_BASE_URL;


const CATEGORIES = [
  { label: 'Red Velvet', query: 'redvelvet', icon: 'fa-birthday-cake' },
  { label: 'Cupcakes', query: 'cupcake', icon: 'fa-cookie-bite' },
  { label: 'Macarons', query: 'macarons', icon: 'fa-circle' },
  { label: 'Biscuit', query: 'biscuit', icon: 'fa-cookie' },
  { label: 'Butter', query: 'butter', icon: 'fa-star' },
  { label: 'Wedding', query: 'wedding', icon: 'fa-heart' },
  { label: 'Birthday', query: 'birthdaycake', icon: 'fa-star' },
  { label: 'Donut', query: 'donut', icon: 'fa-circle-notch' },
]

const SKILLS = [
  { label: 'Cake Design', value: 95 },
  { label: 'Baking Classes', value: 80 },
  { label: 'Cake Recipes', value: 90 },
]

export default function Home() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [heros, setHeros] = useState([])
  const [team, setTeam] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const heroTimer = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [itemsRes, teamRes, testRes] = await Promise.allSettled([
          endpoints.items.list({ limit: 8 }),
          endpoints.team.list(),
          endpoints.testimonials.list(),
        ])
        if (itemsRes.status === 'fulfilled') setItems(itemsRes.value.data.results || itemsRes.value.data || [])
        if (teamRes.status === 'fulfilled') setTeam(teamRes.value.data || [])
        if (testRes.status === 'fulfilled') setTestimonials(testRes.value.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (heros.length <= 1) return
    heroTimer.current = setInterval(() => setHeroIndex(i => (i + 1) % heros.length), 5000)
    return () => clearInterval(heroTimer.current)
  }, [heros])

  function prevHero() {
    setHeroIndex(i => (i - 1 + Math.max(heros.length, 1)) % Math.max(heros.length, 1))
    clearInterval(heroTimer.current)
  }
  function nextHero() {
    setHeroIndex(i => (i + 1) % Math.max(heros.length, 1))
    clearInterval(heroTimer.current)
  }

  // const heroBg = heros[heroIndex]?.picture
  //   ? `/media/${heros[heroIndex].picture}`
  //   : '/static/logo_n_branding/hero/hero.jpg'

  const heroBg = heroImage 

  const heroText = heros[heroIndex]?.text || "Life's never been sweeter!"

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero__slide active" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="hero__overlay" />
        <button className="hero__arrow hero__arrow--prev" onClick={prevHero}>
          <i className="fa fa-angle-left" />
        </button>
        <button className="hero__arrow hero__arrow--next" onClick={nextHero}>
          <i className="fa fa-angle-right" />
        </button>
        <div className="hero__content container">
          <h1>{heroText}</h1>
          <p>Premium cakes & baking classes in Kenya</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/gallery" className="btn btn-primary btn-lg">
              <i className="fa fa-images" /> Our Cakes
            </Link>
            <Link to="/shop" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}>
              <i className="fa fa-store" /> Shop Now
            </Link>
          </div>
        </div>
        {heros.length > 1 && (
          <div className="hero__nav">
            {heros.map((_, i) => (
              <button key={i} className={`hero__dot ${i === heroIndex ? 'active' : ''}`} onClick={() => setHeroIndex(i)} />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-scroll">
            {CATEGORIES.map(cat => (
              <div key={cat.query} className="category-item" onClick={() => navigate(`/search?q=${cat.query}`)}>
                <i className={`fa ${cat.icon}`} />
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="spad">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 60 }}>
            <div>
              <div className="section-title">
                <span>About Benkiz Bakers</span>
                <h2>Cakes and bakes from the heart of Kenya</h2>
              </div>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 24 }}>
                Benkiz Bakers is a Kenyan Brand that started as a small family business.
                The owners are Mr. Kizito and Areri Jr, supported by a staff of 12 employees.
                We are passionate about creating memorable cakes for every occasion.
              </p>
              <Link to="/contact" className="btn btn-primary">
                <i className="fa fa-phone" /> Get in Touch
              </Link>
            </div>
            <div>
              {SKILLS.map(s => (
                <div className="skill-bar" key={s.label}>
                  <div className="skill-bar__label">
                    <span>{s.label}</span>
                    <span>{s.value}%</span>
                  </div>
                  <div className="skill-bar__track">
                    <div className="skill-bar__fill" style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="spad" style={{ background: 'var(--color-bg-soft)', borderTop: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="container">
          <div className="section-title text-center">
            <span>Fresh Picks</span>
            <h2>Our Most Loved Creations</h2>
          </div>
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-birthday-cake" />
              <h3>No products yet</h3>
              <p>Check back soon for our latest creations!</p>
            </div>
          ) : (
            <div className="grid-4">
              {items.slice(0, 8).map(item => <ProductCard key={item.id} item={item} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/shop" className="btn btn-primary btn-lg">
              <i className="fa fa-store" /> View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CLASSES CTA */}
      <section className="spad">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 60 }}>
            <div>
              <div className="section-title">
                <span>Classy Cakes</span>
                <h2>Make your own with your hands</h2>
              </div>
              <div className="section-title" style={{ marginBottom: 24 }}>
                <span>Baking Classes</span>
                <p>Join our hands-on baking classes and learn to create beautiful cakes from scratch.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="tel:+254795404843" className="btn btn-primary">
                  <i className="fa fa-phone" /> 0795404843
                </a>
                <a href="https://wa.me/254707091550" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp" /> WhatsApp
                </a>
                <Link to="/classes" className="btn btn-ghost">
                  <i className="fa fa-graduation-cap" /> View Classes
                </Link>
              </div>
            </div>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              aspectRatio: '16/9',
              background: 'var(--color-bg-muted)',
              position: 'relative',
            }}>
              <img
                src="hero.jpg"
                alt="Baking class"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.3)',
              }}>
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 0 0 12px rgba(255,255,255,0.2)'
                }}>
                  <i className="fa fa-play" style={{ color: 'white', fontSize: 22, marginLeft: 4 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      {team.length > 0 && (
        <section className="spad" style={{ background: 'var(--color-bg-soft)', borderTop: '1px solid var(--color-border-light)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                <span>Our Team</span>
                <h2>Benkiz Bakers Family</h2>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="https://wa.me/254707091550" className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp" /> Join Team
                </a>
                <a href="tel:+254707091550" className="btn btn-outline btn-sm">
                  <i className="fa fa-phone" /> Call
                </a>
              </div>
            </div>
            <div className="grid-4">
              {team.map(member => {
                const picUrl = member.profilepic
                  ? (member.profilepic.startsWith('http') ? member.profilepic : `${BASE_URL}${member.profilepic}`)
                  : null
                return (
                  <div className="team-card" key={member.id}>
                    {picUrl ? (
                      <img className="team-card__img" src={picUrl} alt={member.user_username} />
                    ) : (
                      <div className="team-card__img" style={{ background: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa fa-user" style={{ fontSize: 48, color: 'var(--color-border)' }} />
                      </div>
                    )}
                    <div className="team-card__body">
                      <div className="team-card__name">{member.user_username}</div>
                      <div className="team-card__role">{member.job || 'Team Member'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="spad">
          <div className="container">
            <div className="section-title text-center">
              <span>Testimonials</span>
              <h2>What Our Clients Say</h2>
            </div>
            <div className="grid-3">
              {testimonials.slice(0, 3).map(t => (
                <div className="testimonial-card" key={t.id}>
                  <div className="testimonial-card__author">
                    {t.profile_pic ? (
                      <img className="testimonial-card__pic" src={`/media/${t.profile_pic}`} alt={t.username} />
                    ) : (
                      <div className="testimonial-card__pic" style={{ background: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                        <i className="fa fa-user" />
                      </div>
                    )}
                    <div>
                      <div className="testimonial-card__name">@{t.username}</div>
                      <div className="testimonial-card__location">{t.county || 'Kenya'}</div>
                    </div>
                  </div>
                  {t.rating && (
                    <div className="stars" style={{ marginBottom: 12 }}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <i key={i} className="fas fa-star" />
                      ))}
                    </div>
                  )}
                  <p>{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL SECTION */}
      <section className="social-section spad">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 60 }}>
            
            <div>
              <div className="section-title">
                <span>Follow Us on TikTok</span>
                <h2>Sweet moments are saved as memories</h2>
              </div>

              <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
                <i className="fab fa-tiktok" /> @benkizbakers
              </p>

              <a
                href="https://wa.me/254707091550"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp" /> Follow on Social
              </a>
            </div>

            {/* ❌ INSTAGRAM GRID REMOVED COMPLETELY */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-xl)',
                padding: 40,
                minHeight: 200,
                color: 'var(--color-text-muted)',
                textAlign: 'center',
              }}
            >
              <div>
                <i className="fa fa-camera" style={{ fontSize: 40, marginBottom: 12 }} />
                <p>Gallery section removed</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
