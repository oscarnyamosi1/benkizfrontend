import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

export default function Wishlist() {
  const { wishItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>My Wishlist</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <span>Wishlist</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          {wishItems.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-heart" />
              <h3>Your wishlist is empty</h3>
              <p>Save items you love and come back to them later</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>
                <i className="fa fa-store" /> Browse Shop
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Action</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {wishItems.map(w => {
                    const item = w.item
                    const imgUrl = item?.thumbnail
                      ? (item.thumbnail.startsWith('http') ? item.thumbnail : `/media/${item.thumbnail}`)
                      : null
                    return (
                      <tr key={w.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {imgUrl ? (
                              <img src={imgUrl} alt={item?.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                            ) : (
                              <div style={{ width: 60, height: 60, background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa fa-birthday-cake" style={{ color: 'var(--color-border)' }} />
                              </div>
                            )}
                            <Link to={`/shop/${item?.id}`} style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                              {item?.name}
                            </Link>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          Shs. {parseFloat(item?.price || 0).toLocaleString()}
                        </td>
                        <td>
                          <span style={{ color: (item?.numberOfItems || 0) > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600, fontSize: 13 }}>
                            {(item?.numberOfItems || 0) > 0 ? `In stock (${item.numberOfItems})` : 'Out of stock'}
                          </span>
                        </td>
                        <td>
                          {(item?.numberOfItems || 0) > 0 ? (
                            <button className="btn btn-primary btn-sm" onClick={() => addToCart(item.id)}>
                              <i className="fa fa-cart-plus" /> Add to Cart
                            </button>
                          ) : (
                            <button className="btn btn-ghost btn-sm" disabled>
                              Unavailable
                            </button>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => removeFromWishlist(item?.id)} style={{ color: 'var(--color-error)' }}>
                            <i className="fa fa-times" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
