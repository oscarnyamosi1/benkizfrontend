import { useState, useEffect } from 'react'
import { endpoints } from '../../api/client'
import { sendOrderNotification } from '../../services/whatsapp'

const STATUSES = ['pending', 'paid', 'processing', 'completed', 'failed']
const STATUS_BADGE = {
  pending: { bg: '#fff3cd', color: '#856404' },
  paid: { bg: '#d1e7dd', color: '#0f5132' },
  processing: { bg: '#cfe2ff', color: '#0a58ca' },
  completed: { bg: '#d1e7dd', color: '#0f5132' },
  failed: { bg: '#f8d7da', color: '#842029' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const res = await endpoints.admin.orders.list(params)
      const d = res.data
      setOrders(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : [])
    } catch { setOrders([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter])

  async function handleStatusChange(orderId, newStatus) {
    setUpdating(true)
    try {
      await endpoints.admin.orders.updateStatus(orderId, newStatus)
      await sendOrderNotification(orderId, 'status_change').catch(() => {})
      await load()
      if (selected?.id === orderId) setSelected(s => ({ ...s, status: newStatus }))
    } finally { setUpdating(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Orders</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{orders.length} orders</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('')}>All</button>
        {STATUSES.map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>Order #{selected.id}</h2>
              <button className="navbar__icon-btn" onClick={() => setSelected(null)}><i className="fa fa-times" /></button>
            </div>
            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Customer</span><div style={{ fontWeight: 600 }}>{selected.customer_name || selected.user?.username || '—'}</div></div>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Phone</span><div>{selected.phone || '—'}</div></div>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Total</span><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>KES {Number(selected.total)?.toLocaleString()}</div></div>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>M-Pesa Receipt</span><div style={{ fontFamily: 'monospace' }}>{selected.mpesa_receipt_number || '—'}</div></div>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Payment Method</span><div>{selected.payment_method || 'M-Pesa'}</div></div>
            </div>
            {Array.isArray(selected.items) && selected.items.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>Items</div>
                {selected.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span>{it.name} × {it.quantity}</span>
                    <span>KES {(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="label">Update Status</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.map(s => {
                  const badge = STATUS_BADGE[s]
                  return (
                    <button key={s} disabled={updating || selected.status === s}
                      style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontWeight: 600, fontSize: 13, cursor: selected.status === s ? 'default' : 'pointer', background: selected.status === s ? badge.bg : 'transparent', color: badge.color, borderColor: badge.color, opacity: updating ? 0.6 : 1 }}
                      onClick={() => handleStatusChange(selected.id, s)}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><i className="fa fa-receipt" /><h3>No orders found</h3></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['#', 'Customer', 'Total (KES)', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const badge = STATUS_BADGE[o.status] || { bg: '#f0f0f0', color: '#555' }
                return (
                  <tr key={o.id} style={{ borderTop: '1px solid var(--color-border)', cursor: 'pointer' }} onClick={() => setSelected(o)}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>#{o.id}</td>
                    <td style={{ padding: '14px 16px' }}>{o.customer_name || o.user?.username || '—'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{Number(o.total)?.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>{o.mpesa_receipt_number || 'Pending'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <i className="fa fa-chevron-right" style={{ color: 'var(--color-text-muted)' }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
