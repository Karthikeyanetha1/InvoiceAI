import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', status: '' })
  const [search, setSearch] = useState('')

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter.type) params.type = filter.type
      if (filter.status) params.status = filter.status
      const res = await api.get('/documents', { params })
      setDocs(res.data.documents)
    } catch { toast.error('Failed to load documents') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [filter])

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      setDocs(d => d.filter(doc => doc._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const filtered = docs.filter(d =>
    !search || d.documentNumber?.toLowerCase().includes(search.toLowerCase()) ||
    d.clientInfo?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.title?.toLowerCase().includes(search.toLowerCase())
  )

  const currency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

  return (
    <div style={{ padding: '32px 40px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Documents</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 2 }}>{docs.length} documents</p>
        </div>
        <Link to="/generate" className="btn btn-primary">✦ Generate New</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search by name, number..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260 }} />
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} style={{ maxWidth: 180 }}>
          <option value="">All Types</option>
          <option value="invoice">Invoice</option>
          <option value="quotation">Quotation</option>
          <option value="receipt">Receipt</option>
          <option value="purchase_order">Purchase Order</option>
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={{ maxWidth: 160 }}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◻</div>
            <p>No documents found</p>
            <Link to="/generate" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Generate First Document</Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
                {['#', 'Title', 'Client', 'Type', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>{doc.documentNumber}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, maxWidth: 180 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                    {doc.aiGenerated && <span style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: 4 }}>AI</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>{doc.clientInfo?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)', textTransform: 'capitalize' }}>{doc.type?.replace('_', ' ')}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{currency(doc.total)}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${doc.status}`}>{doc.status}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text3)' }}>
                    {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/documents/${doc._id}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View</Link>
                      <button onClick={() => handleDelete(doc._id)} style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
