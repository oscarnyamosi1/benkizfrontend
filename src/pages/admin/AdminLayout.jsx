import { Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-tachometer-alt', exact: true },
  { to: '/admin/products', label: 'Products', icon: 'fa-box' },
  { to: '/admin/orders', label: 'Orders', icon: 'fa-receipt' },
  { to: '/admin/quotes', label: 'Quotes', icon: 'fa-file-pdf' },
  { to: '/admin/users', label: 'Users', icon: 'fa-users', ownerOnly: true },
  { to: '/admin/tenants', label: 'Tenants', icon: 'fa-building', superOnly: true },
]

export default function AdminLayout() {
  const { user, loading, isAdmin, isSuperAdmin, isBakeryOwner } = useAuth()
  const { pathname } = useLocation()

  if (loading) return <div className="page-loading"><div className="spinner" /></div>
  if (!isAdmin) return <Navigate to="/auth" replace />

  function isActive(to, exact) {
    return exact ? pathname === to : pathname.startsWith(to)
  }

  const visibleNav = NAV.filter(n => {
    if (n.superOnly) return isSuperAdmin
    if (n.ownerOnly) return isBakeryOwner
    return true
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 240, background: 'var(--color-card)', borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, overflowY: 'auto', zIndex: 100,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/favicon.svg" alt="Benkiz" style={{ height: 32 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>Benkiz Admin</div>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                {user?.role?.replace('_', ' ') || 'Staff'}
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {visibleNav.map(n => (
            <Link
              key={n.to}
              to={n.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                color: isActive(n.to, n.exact) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: isActive(n.to, n.exact) ? 'var(--color-primary-light, rgba(210,90,100,0.08))' : 'transparent',
                textDecoration: 'none', fontSize: 14, fontWeight: isActive(n.to, n.exact) ? 600 : 400,
                borderLeft: isActive(n.to, n.exact) ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <i className={`fa ${n.icon}`} style={{ width: 16 }} />
              {n.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)',
            textDecoration: 'none', fontSize: 13,
          }}>
            <i className="fa fa-arrow-left" /> Back to Site
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 240, padding: '32px', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
