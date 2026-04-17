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
      setCart(res.data.cart)
      setCartItems(res.data.items)
    } catch {
      setCart(null)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  async function addToCart(itemId) {
    const res = await endpoints.cart.add(itemId)
    setCart(res.data.cart)
    setCartItems(res.data.items)
    return res.data
  }

  async function updateCartItem(cartItemId, quantity) {
    const res = await endpoints.cart.update(cartItemId, quantity)
    setCart(res.data.cart)
    setCartItems(res.data.items)
  }

  async function removeCartItem(cartItemId) {
    const res = await endpoints.cart.remove(cartItemId)
    setCart(res.data.cart)
    setCartItems(res.data.items)
  }

  const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, cartItems, loading, totalItems,
      fetchCart, addToCart, updateCartItem, removeCartItem
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
