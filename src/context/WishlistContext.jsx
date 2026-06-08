import { createContext, useContext, useState, useEffect } from 'react'
import { endpoints } from '../api/client'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishItems, setWishItems] = useState([])

  useEffect(() => {
    if (user) fetchWishlist()
    else setWishItems([])
  }, [user])

  async function fetchWishlist() {
    try {
      const res = await endpoints.wishlist.get()
      setWishItems(Array.isArray(res.data) ? res.data : [])
    } catch {
      setWishItems([])
    }
  }

  async function addToWishlist(itemId) {
    await endpoints.wishlist.add(itemId)
    await fetchWishlist()
  }

  async function removeFromWishlist(itemId) {
    await endpoints.wishlist.remove(itemId)
    await fetchWishlist()
  }

  function isWished(itemId) {
    const items = Array.isArray(wishItems) ? wishItems : []
    return items.some(w => w.item?.id === itemId || w.item_id === itemId)
  }

  return (
    <WishlistContext.Provider value={{ wishItems, addToWishlist, removeFromWishlist, isWished, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

const WISHLIST_DEFAULT = {
  wishItems: [], isWished: () => false,
  addToWishlist: async () => {}, removeFromWishlist: async () => {}, fetchWishlist: async () => {},
}

export function useWishlist() {
  return useContext(WishlistContext) || WISHLIST_DEFAULT
}
