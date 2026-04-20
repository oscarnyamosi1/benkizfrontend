import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

const THEME_ICONS = { light: 'fa-sun', dark: 'fa-moon', warm: 'fa-fire' }

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const { theme, cycleTheme } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  function isActive(path) {
    return pathname === path || pathname.startsWith(path + '/') ? 'active' : ''
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: 'fa-home' },
    { to: '/shop', label: 'Shop', icon: 'fa-store' },
    { to: '/gallery', label: 'Gallery', icon: 'fa-images' },
    { to: '/classes', label: 'Classes', icon: 'fa-graduation-cap' },
    { to: '/contact', label: 'Contact', icon: 'fa-envelope' },
  ]

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar__inner">
            <Link to="/" className="navbar__logo">
              <img src="favicon.svg" alt="Benkiz Bakerssssssssssss" />
            </Link>

            <div className="navbar__links">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className={`navbar__link ${isActive(l.to)}`}>
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="navbar__actions">
              <button className="navbar__icon-btn" onClick={() => setSearchOpen(s => !s)} title="Search">
                <i className="fa fa-search" />
              </button>

              <button className="navbar__icon-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
                <i className={`fa ${THEME_ICONS[theme] || 'fa-sun'}`} />
              </button>

              {user ? (
                <>
                  <Link to="/cart" className="navbar__icon-btn" title="Cart">
                    <i className="fa fa-shopping-cart" />
                    {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                  </Link>
                  <Link to="/wishlist" className="navbar__icon-btn" title="Wishlist">
                    <i className="fa fa-heart" />
                  </Link>
                  <Link to="/profile" className="navbar__icon-btn" title="Profile">
                    <i className="fa fa-user" />
                  </Link>
                  <button className="btn btn-outline btn-sm" onClick={logout}>
                    <i className="fa fa-sign-out" /> Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="btn btn-primary btn-sm">
                  <i className="fa fa-sign-in" /> Login
                </Link>
              )}

              <button className="navbar__icon-btn navbar__mobile-toggle" onClick={() => setMenuOpen(m => !m)}>
                <i className={`fa ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
              </button>
            </div>
          </div>

          {searchOpen && (
            <div style={{ padding: '12px 0 8px' }}>
              <form className="search-bar" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search cakes, classes..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit"><i className="fa fa-search" /></button>
              </form>
            </div>
          )}
        </div>
      </nav>

      <div className={`offcanvas-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className={`offcanvas ${menuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <img src="../src/assets/logo.webp" alt="Benkiz Bakers" style={{ height: 40 }} />
          <button className="navbar__icon-btn" onClick={() => setMenuOpen(false)}>
            <i className="fa fa-times" />
          </button>
        </div>

        <div className="mobile-nav-links">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`mobile-nav-link ${isActive(l.to)}`} onClick={() => setMenuOpen(false)}>
              <i className={`fa ${l.icon}`} /> {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link to="/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                <i className="fa fa-shopping-cart" /> Cart {totalItems > 0 && `(${totalItems})`}
              </Link>
              <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                <i className="fa fa-heart" /> Wishlist
              </Link>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                <i className="fa fa-user" /> Profile
              </Link>
              <button className="mobile-nav-link" onClick={() => { logout(); setMenuOpen(false) }} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
                <i className="fa fa-sign-out" /> Log Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              <i className="fa fa-sign-in" /> Log In / Register
            </Link>
          )}
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={cycleTheme} style={{ width: '100%' }}>
            <i className={`fa ${THEME_ICONS[theme]}`} /> Theme: {theme}
          </button>
        </div>
      </div>
    </>
  )
}
