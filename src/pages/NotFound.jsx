import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 120, fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>404</div>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: '16px 0 12px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary btn-lg">
            <i className="fa fa-home" /> Go Home
          </Link>
          <Link to="/shop" className="btn btn-outline btn-lg">
            <i className="fa fa-store" /> Browse Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
