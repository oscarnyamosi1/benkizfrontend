import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css'

import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Gallery from './pages/Gallery'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import Classes from './pages/Classes'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Search from './pages/Search'
import PaymentWaiting from './pages/PaymentWaiting'
import NotFound from './pages/NotFound'

import Loader from './pages/Loader'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminQuotes from './pages/admin/AdminQuotes'
import AdminTenants from './pages/admin/AdminTenants'


function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </>
  )
}

function AppInner() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tenants" element={<AdminTenants />} />
        </Route>

        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/shop/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/classes" element={<PublicLayout><Classes /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />
        <Route path="/auth" element={<PublicLayout><Auth /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><PrivateRoute><Cart /></PrivateRoute></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><PrivateRoute><Checkout /></PrivateRoute></PublicLayout>} />
        <Route path="/profile" element={<PublicLayout><PrivateRoute><Profile /></PrivateRoute></PublicLayout>} />
        <Route path="/wishlist" element={<PublicLayout><PrivateRoute><Wishlist /></PrivateRoute></PublicLayout>} />
        <Route path="/payment/waiting/:reference" element={<PublicLayout><PrivateRoute><PaymentWaiting /></PrivateRoute></PublicLayout>} />
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppInner />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
