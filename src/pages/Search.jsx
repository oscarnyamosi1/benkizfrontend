import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { endpoints } from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    endpoints.items.search(query)
      .then(r => setResults(r.data.results || r.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <h2>Search Results</h2>
          <div className="breadcrumb__links">
            <Link to="/">Home</Link>
            <span>Search</span>
          </div>
        </div>
      </div>

      <section className="spad">
        <div className="container">
          {query && (
            <p style={{ marginBottom: 24, color: 'var(--color-text-muted)' }}>
              {loading ? 'Searching...' : `${results.length} results for "${query}"`}
            </p>
          )}

          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : results.length === 0 && query ? (
            <div className="empty-state">
              <i className="fa fa-search" />
              <h3>No results found</h3>
              <p>Try different keywords or browse our shop</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>
                <i className="fa fa-store" /> Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid-4">
              {results.map(item => <ProductCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
