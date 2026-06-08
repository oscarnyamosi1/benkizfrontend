import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { endpoints } from '../api/client'

export default function PaymentWaiting() {
  const { reference } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('PENDING')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (status === 'SUCCESS' || status === 'FAILED' || attempts >= 20) return

    const timer = setInterval(async () => {
      try {
        const res = await endpoints.checkout.status(reference)
        const s = res.data.status
        setStatus(s)
        setAttempts(a => a + 1)
        if (s === 'SUCCESS' || s === 'FAILED') clearInterval(timer)
      } catch {
        setAttempts(a => a + 1)
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [reference, status, attempts])

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, width: '100%' }}>
        {status === 'SUCCESS' ? (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <i className="fa fa-check" style={{ fontSize: 36, color: 'white' }} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Payment Successful!</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 28 }}>
              Thank you for your order! We'll start preparing your treats right away.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
              <i className="fa fa-home" /> Back to Home
            </Link>
          </>
        ) : status === 'FAILED' ? (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <i className="fa fa-times" style={{ fontSize: 36, color: 'white' }} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Payment Failed</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 28 }}>
              Something went wrong with your payment. Please try again or contact us.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/checkout" className="btn btn-primary">Try Again</Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </>
        ) : (
          <>
            <div className="spinner" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Processing Payment</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>
              Please check your phone for the M-Pesa prompt and enter your PIN.
            </p>
            <p style={{ color: 'var(--color-text-light)', fontSize: 13 }}>
              Reference: {reference}
            </p>
            {attempts >= 20 && (
              <div className="alert alert-info" style={{ marginTop: 20 }}>
                Taking longer than expected. <Link to="/contact">Contact us</Link> if you need help.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
