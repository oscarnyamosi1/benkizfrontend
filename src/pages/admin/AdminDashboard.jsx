import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { endpoints } from '../../api/client'

const STAT_CARDS = [
  { key: 'total_orders', label: 'Total Orders', icon: 'fa-receipt', color: '#e85d75' },
  { key: 'total_revenue', label: 'Revenue (KES)', icon: 'fa-coins', color: '#27ae60' },
  { key: 'total_products', label: 'Products', icon: 'fa-box', color: '#2980b9' },
  { key: 'total_users', label: 'Customers', icon: 'fa-users', color: '#8e44ad' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, ordersRes] = await Promise.allSettled([
          endpoints.admin.dashboard(),
          endpoints.admin.orders.list({ limit: 5, ordering: '-created_at' }),
        ])
        if (dashRes.status === 'fulfilled') setStats(dashRes.value.data)
        if (ordersRes.status === 'fulfilled') {
          const d = ordersRes.value.data
          setRecentOrders(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const STATUS_BADGE = {
    pending: { bg: '#fff3cd', color: '#856404' },
    paid: { bg: '#d1e7dd', color: '#0f5132' },
    processing: { bg: '#cfe2ff', color: '#0a58ca' },
    completed: { bg: '#d1e7dd', color: '#0f5132' },
    failed: { bg: '#f8d7da', color: '#842029' },
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Welcome back! Here's what's happening today.</p>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 40 }}>
            {STAT_CARDS.map(c => (
              <div key={c.key} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{c.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>
                      {stats?.[c.key] ?? '—'}
                    </div>
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: c.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`fa ${c.icon}`} style={{ color: c.color, fontSize: 18 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Orders</h2>
              <Link to="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <i className="fa fa-receipt" style={{ fontSize: 32, marginBottom: 12 }} /><br />No orders yet
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)' }}>
                    {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => {
                    const badge = STATUS_BADGE[o.status] || { bg: '#f0f0f0', color: '#555' }
                    return (
                      <tr key={o.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 600 }}>#{o.id}</td>
                        <td style={{ padding: '14px 20px' }}>{o.customer_name || o.user?.username || '—'}</td>
                        <td style={{ padding: '14px 20px' }}>KES {o.total?.toLocaleString()}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
