import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { endpoints } from '../api/client'

export default function Checkout() {
  const { cart, cartItems, fetchCart } = useCart()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleOrder(e) {
    e.preventDefault()
    if (cartItems.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const res = await endpoints.checkout.complete({ payment_method: paymentMethod })
      await fetchCart()
      if (res.data.reference) {
        navigate(`/payment/waiting/${res.data.reference}`)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>Checkout</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <Link to="/cart">Cart</Link>
            <span>Checkout</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Payment Method</h3>

              {error && <div className="alert alert-error">{error}</div>}

              <div className="payment-option" style={{ cursor: 'pointer' }} onClick={() => setPaymentMethod('mpesa')}
                className={`payment-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'mpesa' ? 'var(--color-primary)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentMethod === 'mpesa' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>M-Pesa</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Pay via M-Pesa STK push</div>
                </div>
              </div>

              <div onClick={() => setPaymentMethod('bank')}
                className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === 'bank' ? 'var(--color-primary)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentMethod === 'bank' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Bank Transfer</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Pay via bank transfer</div>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', padding: 16, marginTop: 16, fontSize: 14, color: 'var(--color-text-muted)' }}>
                <i className="fa fa-smile" style={{ marginRight: 8, color: 'var(--color-primary)' }} />
                Benkiz Bakers Family thanks you for your purchase. Welcome once more!
              </div>
            </div>

            <div className="order-summary">
              <h6>Your Order</h6>
              {cartItems.map((ci, i) => (
                <div key={ci.id} className="order-line">
                  <span>{i + 1}. {ci.quantity}x {ci.item?.name}</span>
                  <span>Shs. {parseFloat(ci.item?.price || 0).toLocaleString()}</span>
                </div>
              ))}
              <div className="order-line" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4 }}>
                <span>Subtotal</span>
                <span>Shs. {parseFloat(cart?.inittotal || 0).toLocaleString()}</span>
              </div>
              <div className="order-line">
                <span>Shipping</span>
                <span>Shs. {parseFloat(cart?.deliveryfee || 0).toFixed(2)}</span>
              </div>
              <div className="order-line">
                <span>VAT</span>
                <span>Shs. {parseFloat(cart?.vat || 0).toFixed(2)}</span>
              </div>
              <div className="order-line order-line--total">
                <span>Total</span>
                <span>Shs. {parseFloat(cart?.totalcost || 0).toLocaleString()}</span>
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
                onClick={handleOrder}
                disabled={submitting || cartItems.length === 0}
              >
                <i className={`fa ${submitting ? 'fa-spinner fa-spin' : 'fa-check'}`} />
                {submitting ? ' Processing...' : ' Place Order'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
