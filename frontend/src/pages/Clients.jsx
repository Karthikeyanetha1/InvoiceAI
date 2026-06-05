import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const CAT_COLORS = {
  individual: { color:'#a78bfa', bg:'rgba(167,139,250,0.1)' },
  business:   { color:'#60a5fa', bg:'rgba(96,165,250,0.1)'  },
  government: { color:'#fbbf24', bg:'rgba(251,191,36,0.1)'  },
  startup:    { color:'#4ade80', bg:'rgba(74,222,128,0.1)'  },
}

function AddModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name:'', company:'', email:'', phone:'', address:'', gstin:'', category:'business', notes:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name required')
    setLoading(true)
    try {
      const res = await api.post('/clients', form)
      toast.success('Client added!')
      onAdded(res.data.client)
    } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16, backdropFilter:'blur(4px)' }}
           onClick={e => { if(e.target===e.currentTarget) onClose() }}>
        <div style={{ background:'var(--surface)', borderRadius:18, width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,0.4)', overflow:'hidden', animation:'fadeUp .25s ease', border:'1px solid var(--border)' }}>
          <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg2)' }}>
            <div>
              <h2 style={{ fontSize:'1rem', marginBottom:2 }}>Add New Client</h2>
              <p style={{ fontSize:'0.75rem', color:'var(--text3)' }}>Fill in the client details below</p>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, color:'var(--text3)', cursor:'pointer', lineHeight:1 }}>×</button>
          </div>
          <form onSubmit={handleSubmit} style={{ padding:22 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              {[
                { k:'name', l:'Full Name *', t:'text', p:'Rahul Sharma' },
                { k:'company', l:'Company', t:'text', p:'TechCorp Pvt Ltd' },
                { k:'email', l:'Email', t:'email', p:'rahul@techcorp.com' },
                { k:'phone', l:'Phone', t:'tel', p:'+91 9999999999' },
                { k:'gstin', l:'GSTIN', t:'text', p:'27AAPFU0939F1ZV' },
              ].map(f => (
                  <div key={f.k}>
                    <label style={{ display:'block', marginBottom:4 }}>{f.l}</label>
                    <input type={f.t} placeholder={f.p} value={form[f.k]}
                           onChange={e => setForm(fm => ({ ...fm, [f.k]:e.target.value }))}
                           required={f.k==='name'} style={{ background:'var(--bg2)' }}/>
                  </div>
              ))}
              <div>
                <label style={{ display:'block', marginBottom:4 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))} style={{ background:'var(--bg2)' }}>
                  <option value="business">Business</option>
                  <option value="individual">Individual</option>
                  <option value="government">Government</option>
                  <option value="startup">Startup</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', marginBottom:4 }}>Address</label>
              <textarea placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address:e.target.value }))} rows={2} style={{ background:'var(--bg2)' }}/>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', marginBottom:4 }}>Notes</label>
              <textarea placeholder="Internal notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} rows={2} style={{ background:'var(--bg2)' }}/>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex:1, justifyContent:'center' }}>
                {loading ? <><span className="spinner"/>Adding…</> : 'Add Client'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
  )
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()
  const cur = n => `₹${(n||0).toLocaleString('en-IN')}`

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category !== 'all') params.category = category
      if (search) params.search = search
      const res = await api.get('/clients', { params })
      setClients(res.data.clients)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClients() }, [category, search])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await api.post('/clients/sync')
      toast.success(res.data.message)
      fetchClients()
    } catch { toast.error('Sync failed') }
    finally { setSyncing(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/clients/${id}`)
      setClients(c => c.filter(cl => cl._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const totalBilled = clients.reduce((s, c) => s + (c.totalBilled||0), 0)
  const totalPaid = clients.reduce((s, c) => s + (c.totalPaid||0), 0)

  return (
      <div style={{ padding:'28px 32px', minHeight:'100vh' }}>
        {showAdd && (
            <AddModal
                onClose={() => setShowAdd(false)}
                onAdded={c => { setClients(cl => [c, ...cl]); setShowAdd(false) }}
            />
        )}

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ marginBottom:4, fontFamily:'Syne,sans-serif' }}>Clients</h1>
            <p style={{ color:'var(--text3)', fontSize:'0.85rem' }}>
              {clients.length} client{clients.length!==1?'s':''} · manage your business relationships
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-secondary" onClick={handleSync} disabled={syncing} style={{ fontSize:'0.82rem' }}>
              {syncing ? <><span className="spinner-dark"/>Syncing…</> : '↻ Sync from Invoices'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ fontSize:'0.875rem' }}>
              + Add Client
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Total Clients', value:clients.length, color:'#60a5fa', bg:'rgba(96,165,250,0.1)' },
            { label:'Active', value:clients.filter(c=>c.status==='active').length, color:'#4ade80', bg:'rgba(74,222,128,0.1)' },
            { label:'Total Billed', value:cur(totalBilled), color:'#4ade80', bg:'rgba(74,222,128,0.1)' },
            { label:'Collected', value:cur(totalPaid), color:'#a78bfa', bg:'rgba(167,139,250,0.1)' },
          ].map((s,i) => (
              <div key={i} style={{ background:s.bg, border:`1px solid ${s.color}30`, borderRadius:14, padding:'16px 18px', animation:`fadeUp 0.3s ease ${i*0.06}s both` }}>
                <div style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:'1.4rem', fontWeight:900, color:s.color, fontFamily:'Syne,sans-serif' }}>{s.value}</div>
              </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center', padding:'12px 16px', background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)' }}>
          <input placeholder="🔍  Search name, company, email…" value={search}
                 onChange={e => setSearch(e.target.value)}
                 style={{ maxWidth:260, fontSize:'0.85rem', background:'var(--bg2)' }}/>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['all','individual','business','government','startup'].map(cat => {
              const cc = CAT_COLORS[cat] || { color:'var(--text3)', bg:'transparent' }
              return (
                  <button key={cat} onClick={() => setCategory(cat)}
                          style={{
                            padding:'6px 14px', borderRadius:20, fontSize:'0.75rem', fontWeight:600,
                            cursor:'pointer', transition:'all .15s',
                            border:`1.5px solid ${category===cat?cc.color:'var(--border)'}`,
                            background:category===cat?cc.bg:'transparent',
                            color:category===cat?cc.color:'var(--text3)'
                          }}>
                    {cat.charAt(0).toUpperCase()+cat.slice(1)}
                  </button>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
              {Array(6).fill(0).map((_,i) => (
                  <div key={i} style={{ height:200, borderRadius:14, overflow:'hidden' }}>
                    <div className="skeleton" style={{ height:'100%' }}/>
                  </div>
              ))}
            </div>
        ) : clients.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>👥</div>
              <h2 style={{ marginBottom:8, fontFamily:'Syne,sans-serif' }}>No clients yet</h2>
              <p style={{ color:'var(--text3)', fontSize:'0.875rem', marginBottom:24 }}>
                {search ? 'No clients match your search.' : 'Add clients or sync from your existing invoices.'}
              </p>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Client</button>
                <button className="btn btn-secondary" onClick={handleSync} disabled={syncing}>↻ Sync from Invoices</button>
              </div>
            </div>
        ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
              {clients.map((client, i) => {
                const cc = CAT_COLORS[client.category] || { color:'#4ade80', bg:'rgba(74,222,128,0.1)' }
                const paidPct = client.totalBilled > 0 ? Math.round((client.totalPaid/client.totalBilled)*100) : 0
                return (
                    <div key={client._id}
                         onClick={() => navigate(`/clients/${client._id}`)}
                         style={{
                           background:'var(--surface)', border:'1px solid var(--border)',
                           borderRadius:16, overflow:'hidden', cursor:'pointer',
                           transition:'all .2s', animation:`fadeUp 0.3s ease ${i*0.04}s both`,
                           borderTop:`3px solid ${cc.color}`
                         }}
                         onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 12px 32px rgba(0,0,0,0.15)` }}
                         onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>

                      <div style={{ padding:'18px 18px 14px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,${cc.color},${cc.color}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', flexShrink:0 }}>
                              {client.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:'0.92rem', color:'var(--text)', fontFamily:'Syne,sans-serif' }}>{client.name}</div>
                              {client.company && <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:1 }}>{client.company}</div>}
                            </div>
                          </div>
                          <span style={{ fontSize:'0.62rem', fontWeight:700, padding:'3px 9px', borderRadius:20, background:cc.bg, color:cc.color, textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>
                      {client.category}
                    </span>
                        </div>

                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          {client.email && (
                              <div style={{ fontSize:'0.75rem', color:'var(--text3)', display:'flex', alignItems:'center', gap:6 }}>
                                <span>✉</span>{client.email}
                              </div>
                          )}
                          {client.phone && (
                              <div style={{ fontSize:'0.75rem', color:'var(--text3)', display:'flex', alignItems:'center', gap:6 }}>
                                <span>📞</span>{client.phone}
                              </div>
                          )}
                        </div>
                      </div>

                      {/* Stats bar */}
                      <div style={{ padding:'10px 18px', background:'var(--bg2)', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'0.85rem', fontWeight:800, color:cc.color, fontFamily:'Syne,sans-serif' }}>{cur(client.totalBilled)}</div>
                          <div style={{ fontSize:'0.62rem', color:'var(--text3)', marginTop:1 }}>Billed</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'0.85rem', fontWeight:800, color:'var(--text)', fontFamily:'Syne,sans-serif' }}>{client.invoiceCount||0}</div>
                          <div style={{ fontSize:'0.62rem', color:'var(--text3)', marginTop:1 }}>Invoices</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'0.85rem', fontWeight:800, color:'#60a5fa', fontFamily:'Syne,sans-serif' }}>{paidPct}%</div>
                          <div style={{ fontSize:'0.62rem', color:'var(--text3)', marginTop:1 }}>Paid</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <Link to={`/generate?client=${encodeURIComponent(client.name)}`}
                              onClick={e => e.stopPropagation()}
                              style={{ fontSize:'0.75rem', color:cc.color, textDecoration:'none', fontWeight:600 }}>
                          + Invoice
                        </Link>
                        <div style={{ display:'flex', gap:10 }}>
                          <button onClick={e => { e.stopPropagation(); navigate(`/clients/${client._id}`) }}
                                  style={{ fontSize:'0.75rem', color:'#60a5fa', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>View</button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(client._id, client.name) }}
                                  style={{ fontSize:'0.75rem', color:'#f87171', background:'none', border:'none', cursor:'pointer' }}>Delete</button>
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