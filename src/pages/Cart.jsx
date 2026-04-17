import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Cart() {
  const { cart, cartItems, updateCartItem, removeCartItem, loading } = useCart()

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>Shopping Cart</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <span>Cart</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-shopping-cart" />
              <h3>Your cart is empty</h3>
              <p>Add some delicious items to get started!</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>
                <i className="fa fa-store" /> Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'flex-start' }}>
              <div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(ci => {
                        const imgUrl = ci.item?.thumbnail
                          ? (ci.item.thumbnail.startsWith('http') ? ci.item.thumbnail : `${BASE_URL}${ci.item.thumbnail}`)
                          : null
                        return (
                          <tr key={ci.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                {imgUrl ? (
                                  <img className="cart-item-img" src={imgUrl} alt={ci.item?.name} />
                                ) : (
                                  <div className="cart-item-img" style={{ background: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                                    <i className="fa fa-birthday-cake" style={{ color: 'var(--color-border)' }} />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 600 }}>{ci.item?.name}</div>
                                  <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Shs. {parseFloat(ci.item?.price || 0).toLocaleString()}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="qty-control">
                                <button className="qty-btn" onClick={() => ci.quantity > 1 ? updateCartItem(ci.id, ci.quantity - 1) : removeCartItem(ci.id)}>
                                  <i className="fa fa-minus" style={{ fontSize: 12 }} />
                                </button>
                                <span className="qty-value">{ci.quantity}</span>
                                <button className="qty-btn" onClick={() => updateCartItem(ci.id, ci.quantity + 1)}>
                                  <i className="fa fa-plus" style={{ fontSize: 12 }} />
                                </button>
                              </div>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                              Shs. {(ci.quantity * parseFloat(ci.item?.price || 0)).toLocaleString()}
                            </td>
                            <td>
                              <button className="btn btn-ghost btn-sm" onClick={() => removeCartItem(ci.id)} style={{ color: 'var(--color-error)' }}>
                                <i className="fa fa-trash" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 12 }}>
                  <Link to="/shop" className="btn btn-outline">
                    <i className="fa fa-arrow-left" /> Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="order-summary">
                <h6>Cart Total</h6>
                <div className="order-line">
                  <span>Subtotal</span>
                  <span>Shs. {parseFloat(cart?.inittotal || 0).toLocaleString()}</span>
                </div>
                <div className="order-line">
                  <span><i className="fa fa-truck" style={{ marginRight: 6 }} />Delivery fee (2%)</span>
                  <span>Shs. {parseFloat(cart?.deliveryfee || 0).toFixed(2)}</span>
                </div>
                <div className="order-line">
                  <span>V.A.T (3%)</span>
                  <span>Shs. {parseFloat(cart?.vat || 0).toFixed(2)}</span>
                </div>
                <div className="order-line order-line--total">
                  <span>Total</span>
                  <span>Shs. {parseFloat(cart?.totalcost || 0).toLocaleString()}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                  <i className="fa fa-lock" /> Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
