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
  const [activeCategory, setActiveCategory] = useState('all')


  useEffect(() => {
    const catFromUrl = searchParams.get('cat') || 'all'

    // prevent invalid categories breaking UI
    if (CATEGORIES.includes(catFromUrl)) {
      setActiveCategory(catFromUrl)
    } else {
      setActiveCategory('all')
    }
  }, [searchParams])

  // ✅ FIX 2: Fetch items
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
   
        const data = res.data
        setItems(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching items:', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [activeCategory, search])

  function handleSearch(e) {
    e.preventDefault()
  }

  // ✅ FIX 3: Update URL properly
  function handleCategory(cat) {
    setActiveCategory(cat)

    if (cat === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ cat })
    }
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