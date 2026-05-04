import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ProductCard({ item }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { isWished, addToWishlist, removeFromWishlist } = useWishlist()
  const [adding, setAdding] = useState(false)
  const wished = isWished(item.id)

  async function handleAddToCart(e) {
    e.preventDefault()
    if (!user) return
    setAdding(true)
    try { await addToCart(item.id) } finally { setAdding(false) }
  }

  async function handleWish(e) {
    e.preventDefault()
    if (!user) return
    wished ? await removeFromWishlist(item.id) : await addToWishlist(item.id)
  }

  const imgUrl = item.thumbnail_url
    ? (item.thumbnail_url.startsWith('http') ? item.thumbnail_url : `${BASE_URL}${item.thumbnail_url}`)
    : null

  return (
    <div className="product-card">
      <Link to={`/shop/${item.id}`}>
        <div className="product-card__image-wrap">
          {imgUrl ? (
            <img className="product-card__image" src={imgUrl} alt={item.name} loading="lazy" />
          ) : (
            <div className="product-card__image" style={{ background: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa fa-birthday-cake" style={{ fontSize: 48, color: 'var(--color-border)' }} />
            </div>
          )}

{item.category?.length > 0 && (
  <div className="product-card__category-wrapper">
    <span className="product-card__badge">
      {item.category[0]}
    </span>

    <div className="product-card__dropdown">
      {item.category.map((cat, index) => (
        <div key={index} className="product-card__dropdown-item">
          {cat}
        </div>
      ))}
    </div>
  </div>
)}


          {user && (
            <button className={`product-card__wish ${wished ? 'wished' : ''}`} onClick={handleWish} title={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
              <i className={`fa${wished ? 's' : 'r'} fa-heart`} />
            </button>
          )}
        </div>
      </Link>
      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link to={`/shop/${item.id}`}>{item.name}</Link>
        </h3>
        <div className="product-card__price">Shs. {parseFloat(item.price).toLocaleString()}</div>
        <div className="product-card__actions">
          <Link to={`/shop/${item.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
            <i className="fa fa-eye" /> Details
          </Link>
          {user && (
            <button className="btn btn-primary btn-sm" onClick={handleAddToCart} disabled={adding} style={{ flex: 1 }}>
              <i className={`fa ${adding ? 'fa-spinner fa-spin' : 'fa-cart-plus'}`} />
              {adding ? '' : ' Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
