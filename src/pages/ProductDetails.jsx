import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { endpoints } from '../api/client'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
        const data = res.data
        setItem(data)

        const categoryId = data.category?.[0]?.id

        if (categoryId) {
          const relRes = await endpoints.items.list({ category: categoryId })
          const relItems = relRes.data.results || relRes.data || []
          setRelated(
            relItems
              .filter(r => r.id !== parseInt(id))
              .slice(0, 4)
          )
        }

      } catch (err) {
        console.error('Failed to load product:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  async function handleAddToCart() {
    if (!user) return
    setAdding(true)
    try {
      await addToCart(item.id)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!item) {
    return (
      <div
        className="empty-state"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <i className="fa fa-birthday-cake" />
        <h3>Product not found</h3>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>
          Back to Shop
        </Link>
      </div>
    )
  }


  const imgUrl = item.thumbnail
    ? (item.thumbnail.startsWith('http')
        ? item.thumbnail 
        : `${BASE_URL}${item.thumbnail}`)
    : null

  const wished = isWished(item.id)

  // ── WhatsApp link ──────────────────────────────────────────────
  const productUrl = window.location.href; 
  const whatsappNumber = '254742790542';   
  const message = `I wanna buy this product: ${item.name} - Price: Shs. ${item.price} - ${item.description || ''} - View here: ${productUrl}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  // ──────────────────────────────────────────────────────────────

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

            {/* IMAGE */}
            <div>
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  background: 'var(--color-bg-muted)',
                  aspectRatio: '1',
                  marginBottom: 16
                }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="fa fa-birthday-cake" style={{ fontSize: 80 }} />
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div>

              {/* ✅ FIXED CATEGORY */}
              {Array.isArray(item.category) && item.category.length > 0 && (
                <div
                  className="product-card__category-wrapper"
                  style={{ marginBottom: 16, position: 'relative', display: 'inline-block' }}
                >
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                    {item.category[0]?.name}
                  </span>

                  <div className="product-card__dropdown">
                    {item.category.map((cat) => (
                      <div key={cat.id} className="product-card__dropdown-item">
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h1 style={{ fontSize: 32, fontWeight: 800, margin: '8px 0' }}>
                {item.name}
              </h1>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  marginBottom: 16
                }}
              >
                Shs. {Number(item.price || 0).toLocaleString()}
              </div>

              {item.description && (
                <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
                  {item.description}
                </p>
              )}

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {user ? (
                  <>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleAddToCart}
                      disabled={adding}
                      style={{ flex: 1 }}
                    >
                      <i className={`fa ${adding ? 'fa-spinner fa-spin' : 'fa-cart-plus'}`} />
                      {adding ? ' Adding...' : ' Add to Cart'}
                    </button>

                    <button
                      className={`navbar__icon-btn ${wished ? 'wished' : ''}`}
                      style={{
                        width: 52,
                        height: 52
                      }}
                      onClick={() =>
                        wished
                          ? removeFromWishlist(item.id)
                          : addToWishlist(item.id)
                      }
                    >
                      <i className={`fa${wished ? 's' : 'r'} fa-heart`} />
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="btn btn-primary btn-lg">
                    Log in to Order
                  </Link>
                )}

                {/* ─── REPLACED: Order via WhatsApp with dynamic link ─── */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                >
                  <i className="fab fa-whatsapp" /> Order via WhatsApp
                </a>
                {/* ────────────────────────────────────────────────────── */}
              </div>

              {/* META */}
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {item.numberOfItems !== undefined && (
                    <span>{item.numberOfItems} in stock</span>
                  )}
                  {item.numberofviews !== undefined && (
                    <span>{item.numberofviews} views</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* TABS */}
          <div style={{ marginTop: 48 }}>
            <div className="tabs">
              {[
                { key: 'description', label: 'Description' },
                { key: 'info', label: 'Additional Info' },
                { key: 'views', label: `Views (${item.numberofviews ?? 0})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ lineHeight: 1.8 }}>
              {activeTab === 'description' && (
                <p>{item.description || 'No description available.'}</p>
              )}
              {activeTab === 'info' && (
                <p>{item.additionalinfo || 'No additional information.'}</p>
              )}
              {activeTab === 'views' && (
                <p>This item has {item.numberofviews ?? 0} views.</p>
              )}
            </div>
          </div>

          {/* RELATED */}
          {related.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="section-title">
                <span>More Like This</span>
                <h2>Related Products</h2>
              </div>

              <div className="grid-4">
                {related.map(r => (
                  <ProductCard key={r.id} item={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}