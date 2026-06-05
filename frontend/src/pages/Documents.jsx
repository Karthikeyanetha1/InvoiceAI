import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TYPE_ICONS = { invoice:'🧾', quotation:'📋', receipt:'✅', purchase_order:'📦', custom_form:'📝' }
const TYPE_COLORS = { invoice:'#4ade80', quotation:'#60a5fa', receipt:'#fbbf24', purchase_order:'#a78bfa', custom_form:'#f87171' }

export default function Documents() {
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [type, setType] = useState('all')
    const [status, setStatus] = useState('all')
    const [sort, setSort] = useState('-createdAt')
    const navigate = useNavigate()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const p = { sort }
            if (type !== 'all') p.type = type
            if (status !== 'all') p.status = status
            if (search.trim()) p.search = search.trim()
            const r = await api.get('/documents', { params: p })
            setDocs(r.data.documents || [])
        } catch { toast.error('Failed to load') }
        finally { setLoading(false) }
    }, [type, status, sort, search])

    useEffect(() => {
        const t = setTimeout(load, 300)
        return () => clearTimeout(t)
    }, [load])

    const del = async (id, num, e) => {
        e.stopPropagation()
        if (!window.confirm('Delete ' + num + '?')) return
        try {
            await api.delete('/documents/' + id)
            setDocs(d => d.filter(x => x._id !== id))
            toast.success('Deleted')
        } catch { toast.error('Delete failed') }
    }

    const dup = async (id, e) => {
        e.stopPropagation()
        try {
            const r = await api.post('/documents/' + id + '/duplicate')
            toast.success('Duplicated!')
            navigate('/documents/' + r.data.document._id)
        } catch { toast.error('Failed') }
    }

    const money = n => '₹' + (n || 0).toLocaleString('en-IN')
    const statusStyle = s => ({
        paid:   { bg:'rgba(74,222,128,0.12)',  color:'#4ade80'  },
        sent:   { bg:'rgba(96,165,250,0.12)',  color:'#60a5fa'  },
        draft:  { bg:'rgba(251,191,36,0.12)',  color:'#fbbf24'  },
        cancelled: { bg:'rgba(248,113,113,0.12)', color:'#f87171' }
    }[s] || { bg:'var(--bg2)', color:'var(--text3)' })

    return (
        <div style={{ padding:'28px 32px', minHeight:'100vh' }}>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
                <div>
                    <h1 style={{ marginBottom:4, fontFamily:'Syne,sans-serif' }}>Documents</h1>
                    <p style={{ color:'var(--text3)', fontSize:'0.85rem' }}>
                        {loading ? 'Loading...' : `${docs.length} document${docs.length !== 1 ? 's' : ''} found`}
                    </p>
                </div>
                <Link to="/generate" className="btn btn-primary" style={{ fontSize:'0.875rem' }}>
                    ✦ Generate New
                </Link>
            </div>

            {/* Filters */}
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)' }}>
                <input
                    placeholder="🔍  Search by name, number..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth:240, fontSize:'0.85rem', background:'var(--bg2)' }}
                />
                <select value={type} onChange={e => setType(e.target.value)} style={{ width:'auto', fontSize:'0.82rem', background:'var(--bg2)' }}>
                    <option value="all">All Types</option>
                    <option value="invoice">🧾 Invoice</option>
                    <option value="quotation">📋 Quotation</option>
                    <option value="receipt">✅ Receipt</option>
                    <option value="purchase_order">📦 Purchase Order</option>
                    <option value="custom_form">📝 Custom Form</option>
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width:'auto', fontSize:'0.82rem', background:'var(--bg2)' }}>
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ width:'auto', fontSize:'0.82rem', background:'var(--bg2)' }}>
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="-total">Highest Amount</option>
                    <option value="total">Lowest Amount</option>
                </select>
                {(search || type !== 'all' || status !== 'all') && (
                    <button onClick={() => { setSearch(''); setType('all'); setStatus('all') }}
                            style={{ fontSize:'0.78rem', color:'var(--text3)', background:'none', border:'1px solid var(--border)', borderRadius:7, padding:'6px 12px', cursor:'pointer' }}>
                        Clear filters
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} style={{ height:80, borderRadius:12, overflow:'hidden' }}>
                            <div className="skeleton" style={{ height:'100%' }}/>
                        </div>
                    ))}
                </div>
            ) : docs.length === 0 ? (
                <div style={{ textAlign:'center', padding:'80px 20px' }}>
                    <div style={{ fontSize:56, marginBottom:16 }}>📄</div>
                    <h2 style={{ marginBottom:8, fontFamily:'Syne,sans-serif' }}>No documents found</h2>
                    <p style={{ color:'var(--text3)', fontSize:'0.875rem', marginBottom:24 }}>
                        {search || type !== 'all' || status !== 'all' ? 'Try different filters' : 'Create your first AI-powered invoice!'}
                    </p>
                    <Link to="/generate" className="btn btn-primary">✦ Generate Document</Link>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {docs.map((doc, i) => {
                        const ss = statusStyle(doc.status)
                        const tc = TYPE_COLORS[doc.type] || '#4ade80'
                        return (
                            <div key={doc._id}
                                 onClick={() => navigate('/documents/' + doc._id)}
                                 style={{
                                     background:'var(--surface)', border:'1px solid var(--border)',
                                     borderRadius:14, padding:'16px 20px', cursor:'pointer',
                                     display:'flex', alignItems:'center', gap:14,
                                     transition:'all .18s', animation:`fadeUp 0.3s ease ${i*0.04}s both`,
                                     borderLeft:`3px solid ${tc}`
                                 }}
                                 onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor=tc }}
                                 onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.borderLeftColor=tc }}>

                                {/* Icon */}
                                <div style={{
                                    width:46, height:46, borderRadius:12, flexShrink:0,
                                    background:`${tc}18`,
                                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:22
                                }}>
                                    {TYPE_ICONS[doc.type] || '📄'}
                                </div>

                                {/* Info */}
                                <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, color:'var(--text)', fontSize:'0.95rem', fontFamily:'Syne,sans-serif' }}>
                      {doc.documentNumber}
                    </span>
                                        <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'2px 9px', borderRadius:20, background:ss.bg, color:ss.color, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                      {doc.status}
                    </span>
                                        {doc.aiGenerated && (
                                            <span style={{ fontSize:'0.62rem', fontWeight:700, background:'rgba(74,222,128,0.1)', color:'#4ade80', padding:'2px 7px', borderRadius:10 }}>✦ AI</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize:'0.82rem', color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>
                                        {doc.clientInfo?.name || '—'}
                                        {doc.clientInfo?.company ? ' · ' + doc.clientInfo.company : ''}
                                    </div>
                                    <div style={{ fontSize:'0.72rem', color:'var(--text3)' }}>
                                        {(doc.type || '').replace('_', ' ')} · {new Date(doc.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                    </div>
                                </div>

                                {/* Amount + Actions */}
                                <div style={{ textAlign:'right', flexShrink:0 }}>
                                    <div style={{ fontSize:'1.05rem', fontWeight:800, color:tc, fontFamily:'Syne,sans-serif', marginBottom:8 }}>
                                        {money(doc.total)}
                                    </div>
                                    <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                                        <button onClick={e => dup(doc._id, e)}
                                                style={{ fontSize:'0.72rem', color:'#60a5fa', background:'rgba(96,165,250,0.1)', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontWeight:600, transition:'all .15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background='rgba(96,165,250,0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background='rgba(96,165,250,0.1)'}>
                                            Copy
                                        </button>
                                        <button onClick={e => del(doc._id, doc.documentNumber, e)}
                                                style={{ fontSize:'0.72rem', color:'#f87171', background:'rgba(248,113,113,0.1)', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontWeight:600, transition:'all .15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}