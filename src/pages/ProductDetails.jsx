import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { endpoints } from '../api/client'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

export default function ProductDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { isWished, addToWishlist, removeFromWishlist } = useWishlist()
  const [item, setItem] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await endpoints.items.get(id)
        setItem(res.data)
        if (res.data.category) {
          const relRes = await endpoints.items.list({ category: res.data.category })
          setRelated((relRes.data.results || relRes.data || []).filter(r => r.id !== parseInt(id)).slice(0, 4))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleAddToCart() {
    if (!user) return
    setAdding(true)
    try { await addToCart(item.id) } finally { setAdding(false) }
  }

  if (loading) return <div className="page-loading"><div className="spinner" /></div>
  if (!item) return (
    <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <i className="fa fa-birthday-cake" />
      <h3>Product not found</h3>
      <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Shop</Link>
    </div>
  )

  const imgUrl = item.thumbnail
    ? (item.thumbnail.startsWith('http') ? item.thumbnail : `https://benkizbakers.pythonanywhere.com${item.thumbnail}`)
    : null
  const wished = isWished(item.id)

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>{item.name}</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <span>{item.name}</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: 'flex-start' }}>
            <div>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--color-bg-muted)', aspectRatio: '1', marginBottom: 16 }}>
                {imgUrl ? (
                  <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa fa-birthday-cake" style={{ fontSize: 80, color: 'var(--color-border)' }} />
                  </div>
                )}
              </div>
            </div>

            <div>
              {item.category && (
                <span className="badge badge-primary" style={{ marginBottom: 16, textTransform: 'capitalize' }}>
                  {item.category}
                </span>
              )}
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: '8px 0' }}>{item.name}</h1>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 16 }}>
                Shs. {parseFloat(item.price).toLocaleString()}
              </div>
              {item.description && (
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 24 }}>{item.description}</p>
              )}

              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {user ? (
                  <>
                    <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={adding} style={{ flex: 1 }}>
                      <i className={`fa ${adding ? 'fa-spinner fa-spin' : 'fa-cart-plus'}`} />
                      {adding ? ' Adding...' : ' Add to Cart'}
                    </button>
                    <button
                      className={`navbar__icon-btn ${wished ? 'wished' : ''}`}
                      style={{ width: 52, height: 52, fontSize: 18, background: wished ? 'var(--color-primary)' : 'var(--color-surface)', color: wished ? 'white' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                      onClick={() => wished ? removeFromWishlist(item.id) : addToWishlist(item.id)}
                      title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <i className={`fa${wished ? 's' : 'r'} fa-heart`} />
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="btn btn-primary btn-lg">
                    <i className="fa fa-sign-in" /> Login to Order
                  </Link>
                )}
              </div>

              <div style={{ background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', padding: 16, fontSize: 14, color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {item.numberOfItems !== undefined && (
                    <span><i className="fa fa-box" /> {item.numberOfItems} in stock</span>
                  )}
                  {item.numberofviews && (
                    <span><i className="fa fa-eye" /> {item.numberofviews} views</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <div className="tabs">
              {[
                { key: 'description', label: 'Description' },
                { key: 'info', label: 'Additional Info' },
                { key: 'views', label: `Views (${item.numberofviews || 0})` },
              ].map(tab => (
                <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              {activeTab === 'description' && <p>{item.description || 'No description available.'}</p>}
              {activeTab === 'info' && <p>{item.additionalinfo || 'No additional information.'}</p>}
              {activeTab === 'views' && <p>This item has caught {item.numberofviews || 0} people's attention.</p>}
            </div>
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="section-title">
                <span>More Like This</span>
                <h2>Related Products</h2>
              </div>
              <div className="grid-4">
                {related.map(r => <ProductCard key={r.id} item={r} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
