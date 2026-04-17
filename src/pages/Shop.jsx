import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { endpoints } from '../api/client'
import ProductCard from '../components/ProductCard'

const CATEGORIES = [
  'all',
  'redvelvet',
  'cupcake',
  'biscuit',
  'cookies',
  'wedding',
  'macarons',
  'cake',
  'anniversarycake',
  'birthdaycake'
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('cat') || 'all'
  )

  // 🔥 Fetch items (fixed: no dependency warning, consistent behavior)
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const params = {}

        if (activeCategory && activeCategory !== 'all') {
          params.category = activeCategory
        }

        if (search) {
          params.search = search
        }

        const res = await endpoints.items.list(params)

        // Supports both paginated and non-paginated DRF responses
        setItems(res.data?.results || res.data || [])
      } catch (err) {
        console.error('Error fetching items:', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [activeCategory, search])

  // 🔍 Search submit (just prevents reload)
  function handleSearch(e) {
    e.preventDefault()
  }

  // 🏷️ Category change
  function handleCategory(cat) {
    setActiveCategory(cat)
    setSearchParams(cat !== 'all' ? { cat } : {})
  }

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>Shop</h2>
          <div className="breadcrumb__links">
            <a href="/">Home</a>
            <span>Shop</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">

          {/* 🔍 Search */}
          <div style={{ marginBottom: 32 }}>
            <form
              className="search-bar"
              onSubmit={handleSearch}
              style={{ maxWidth: 480 }}
            >
              <input
                type="text"
                placeholder="Search cakes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">
                <i className="fa fa-search" />
              </button>
            </form>
          </div>

          {/* 🏷️ Categories */}
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${
                  activeCategory === cat ? 'active' : ''
                }`}
                onClick={() => handleCategory(cat)}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          {/* 📦 Content */}
          {loading ? (
            <div className="page-loading">
              <div className="spinner" />
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-birthday-cake" />
              <h3>No products found</h3>
              <p>Try a different category or search term</p>
            </div>
          ) : (
            <>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  marginBottom: 20,
                  fontSize: 14
                }}
              >
                Showing {items.length} product
                {items.length !== 1 ? 's' : ''}
              </p>

              <div className="grid-4">
                {items.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}