import { createContext, useContext, useState, useEffect } from 'react'
import { endpoints } from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) fetchCart()
    else { setCart(null); setCartItems([]) }
  }, [user])

  async function fetchCart() {
    setLoading(true)
    try {
      const res = await endpoints.cart.get()
      setCart(res.data.cart ?? null)
      setCartItems(res.data.items ?? res.data ?? [])
    } catch {
      setCart(null)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  async function addToCart(itemId) {
    const res = await endpoints.cart.add(itemId)
    setCart(res.data.cart ?? null)
    setCartItems(res.data.items ?? res.data ?? [])
    return res.data
  }

  async function updateCartItem(cartItemId, quantity) {
    const res = await endpoints.cart.update(cartItemId, quantity)
    setCart(res.data.cart ?? null)
    setCartItems(res.data.items ?? res.data ?? [])
  }

  async function removeCartItem(cartItemId) {
    const res = await endpoints.cart.remove(cartItemId)
    setCart(res.data.cart ?? null)
    setCartItems(res.data.items ?? res.data ?? [])
  }

  const totalItems = (Array.isArray(cartItems) ? cartItems : []).reduce((sum, ci) => sum + (ci?.quantity || 0), 0)

  return (
    <CartContext.Provider value={{
      cart, cartItems, loading, totalItems,
      fetchCart, addToCart, updateCartItem, removeCartItem
    }}>
      {children}
    </CartContext.Provider>
  )
}

const CART_DEFAULT = {
  cart: null, cartItems: [], loading: false, totalItems: 0,
  fetchCart: async () => {}, addToCart: async () => {},
  updateCartItem: async () => {}, removeCartItem: async () => {},
}

export function useCart() {
  return useContext(CartContext) || CART_DEFAULT
}
