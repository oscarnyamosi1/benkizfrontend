import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { endpoints } from '../api/client'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await endpoints.items.list({ limit: 64 })
        setItems(res.data.results || res.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>Cake Gallery</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <span>Gallery</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-images" />
              <h3>No items in gallery yet</h3>
              <p>Check back soon for our latest creations!</p>
            </div>
          ) : (
            <div className="grid-4" style={{ gap: 16 }}>
              {items.map(item => {
                const imgUrl = item.thumbnail
                  ? (item.thumbnail.startsWith('http') ? item.thumbnail : `/media/${item.thumbnail}`)
                  : null
                return (
                  <div key={item.id} className="card" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => setLightbox(item)}>
                    <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-muted)' }}>
                          <i className="fa fa-birthday-cake" style={{ fontSize: 40, color: 'var(--color-border)' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setLightbox(null)}
        >
          <div style={{ maxWidth: 700, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            {lightbox.thumbnail && (
              <img
                src={lightbox.thumbnail.startsWith('http') ? lightbox.thumbnail : `/media/${lightbox.thumbnail}`}
                alt={lightbox.name}
                style={{ width: '100%', borderRadius: 'var(--radius-lg)', maxHeight: '70vh', objectFit: 'contain' }}
              />
            )}
            <div style={{ color: 'white', marginTop: 16 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700 }}>{lightbox.name}</h3>
              <p style={{ opacity: 0.8 }}>Shs. {parseFloat(lightbox.price).toLocaleString()}</p>
              <Link to={`/shop/${lightbox.id}`} className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setLightbox(null)}>
                <i className="fa fa-eye" /> View Details
              </Link>
            </div>
          </div>
          <button
            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer' }}
            onClick={() => setLightbox(null)}
          >
            <i className="fa fa-times" />
          </button>
        </div>
      )}
    </>
  )
}
