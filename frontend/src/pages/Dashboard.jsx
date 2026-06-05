import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const STATUS_COLORS = { paid:'#4ade80', sent:'#60a5fa', draft:'#fbbf24', cancelled:'#f87171' }

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
      <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
        <p style={{ fontWeight:600, color:'#f8fafc', marginBottom:4, fontSize:'0.82rem' }}>{label}</p>
        {payload.map((p, i) => (
            <p key={i} style={{ color:p.color, margin:'2px 0', fontSize:'0.78rem' }}>
              {p.name}: <strong>₹{(p.value||0).toLocaleString('en-IN')}</strong>
            </p>
        ))}
      </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('revenue')

  useEffect(() => {
    api.get('/documents/stats/overview')
        .then(r => setStats(r.data))
        .catch(console.error)
        .finally(() => setLoading(false))
  }, [])

  const cur = n => `₹${(n||0).toLocaleString('en-IN')}`
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'

  const kpiCards = [
    { label:'Total Revenue', value:cur(stats?.totalRevenue), icon:'💰', color:'#4ade80', bg:'rgba(74,222,128,0.1)', border:'rgba(74,222,128,0.2)' },
    { label:'Outstanding', value:cur(stats?.pendingRevenue), icon:'⏳', color:'#fbbf24', bg:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.2)' },
    { label:'Total Invoices', value:stats?.invoiceCount||0, icon:'📄', color:'#60a5fa', bg:'rgba(96,165,250,0.1)', border:'rgba(96,165,250,0.2)' },
    { label:'Overdue', value:stats?.overdueCount||0, icon:'⚠️', color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.2)' },
  ]

  return (
      <div style={{ padding:'28px 32px', background:'var(--bg)', minHeight:'100vh' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:14 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <h1 style={{ fontSize:'1.6rem', fontFamily:'Syne,sans-serif', fontWeight:900, color:'var(--text)', margin:0 }}>
                {greeting}, {user?.name?.split(' ')[0]} 👋
              </h1>
            </div>
            <p style={{ color:'var(--text3)', fontSize:'0.85rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Link to="/generate" className="btn btn-primary" style={{ fontSize:'0.85rem' }}>
              ✦ Generate Invoice
            </Link>
            <Link to="/documents" className="btn btn-secondary" style={{ fontSize:'0.85rem' }}>
              View All
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
          {loading ? Array(4).fill(0).map((_,i) => (
              <div key={i} className="card" style={{ padding:20, height:100 }}>
                <div className="skeleton" style={{ height:'100%' }}/>
              </div>
          )) : kpiCards.map((card, i) => (
              <div key={i} style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: 16, padding:'20px 22px',
                animation: `fadeUp 0.4s ease ${i*0.08}s both`,
                position:'relative', overflow:'hidden'
              }}>
                <div style={{
                  position:'absolute', top:-10, right:-10,
                  width:80, height:80,
                  background:`radial-gradient(circle, ${card.bg} 0%, transparent 70%)`,
                  borderRadius:'50%'
                }}/>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{card.label}</span>
                  <span style={{ fontSize:20 }}>{card.icon}</span>
                </div>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:card.color, fontFamily:'Syne,sans-serif', letterSpacing:'-0.02em' }}>
                  {card.value}
                </div>
              </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr', gap:14, marginBottom:14 }}>

          {/* Area chart */}
          <div className="card" style={{ padding:22, animation:'fadeUp 0.4s ease 0.2s both' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:8 }}>
              <div>
                <h2 style={{ fontSize:'1rem', marginBottom:2 }}>Revenue Overview</h2>
                <p style={{ fontSize:'0.75rem', color:'var(--text3)' }}>Last 6 months</p>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {['revenue', 'pending'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding:'5px 12px', borderRadius:8, fontSize:'0.75rem', fontWeight:600,
                      cursor:'pointer', border:'none', transition:'all .15s',
                      background: tab===t ? 'var(--green)' : 'var(--bg2)',
                      color: tab===t ? '#fff' : 'var(--text3)'
                    }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </div>
            {loading ? <div className="skeleton" style={{ height:200 }}/> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats?.monthlyData||[]} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#4ade80" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text3)' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:10, fill:'var(--text3)' }} axisLine={false} tickLine={false} tickFormatter={v => v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Area type="monotone" dataKey={tab} name={tab.charAt(0).toUpperCase()+tab.slice(1)}
                          stroke={tab==='revenue'?'#4ade80':'#fbbf24'} strokeWidth={2.5}
                          fill={tab==='revenue'?'url(#gR)':'url(#gP)'}
                          dot={{ fill:tab==='revenue'?'#4ade80':'#fbbf24', r:4, strokeWidth:0 }}
                          activeDot={{ r:6, strokeWidth:0 }}/>
                  </AreaChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Donut */}
          <div className="card" style={{ padding:22, animation:'fadeUp 0.4s ease 0.25s both' }}>
            <h2 style={{ fontSize:'1rem', marginBottom:2 }}>Invoice Status</h2>
            <p style={{ fontSize:'0.75rem', color:'var(--text3)', marginBottom:16 }}>Distribution</p>
            {loading ? <div className="skeleton" style={{ height:160 }}/> : (
                stats?.byStatus?.some(s => s.count > 0) ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={stats.byStatus.filter(s=>s.count>0)} dataKey="count" nameKey="_id"
                               cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} strokeWidth={0}>
                            {stats.byStatus.filter(s=>s.count>0).map((s,i) => (
                                <Cell key={i} fill={STATUS_COLORS[s._id]||'#4ade80'}/>
                            ))}
                          </Pie>
                          <Tooltip formatter={(v, n) => [v, n]}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {stats.byStatus.filter(s=>s.count>0).map(s => (
                            <div key={s._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.8rem' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <div style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLORS[s._id], flexShrink:0 }}/>
                                <span style={{ color:'var(--text2)', textTransform:'capitalize' }}>{s._id}</span>
                              </div>
                              <span style={{ fontWeight:700, color:'var(--text)' }}>{s.count}</span>
                            </div>
                        ))}
                      </div>
                    </>
                ) : (
                    <div style={{ height:160, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text3)', gap:8 }}>
                      <span style={{ fontSize:32 }}>📊</span>
                      <p style={{ fontSize:'0.8rem', textAlign:'center' }}>No data yet —<br/>generate invoices!</p>
                    </div>
                )
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>

          {/* Bar chart */}
          <div className="card" style={{ padding:22, animation:'fadeUp 0.4s ease 0.3s both' }}>
            <h2 style={{ fontSize:'1rem', marginBottom:2 }}>Monthly Volume</h2>
            <p style={{ fontSize:'0.75rem', color:'var(--text3)', marginBottom:14 }}>Invoices per month</p>
            {loading ? <div className="skeleton" style={{ height:140 }}/> : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={stats?.monthlyData||[]} margin={{ top:4, right:4, left:-26, bottom:0 }} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text3)' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:9, fill:'var(--text3)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip formatter={v => [v, 'Invoices']}/>
                    <Bar dataKey="invoices" radius={[6,6,0,0]}>
                      {(stats?.monthlyData||[]).map((_, i) => (
                          <Cell key={i} fill={i===5?'#4ade80':'rgba(74,222,128,0.3)'}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Top clients */}
          <div className="card" style={{ padding:22, animation:'fadeUp 0.4s ease 0.33s both' }}>
            <h2 style={{ fontSize:'1rem', marginBottom:2 }}>Top Clients</h2>
            <p style={{ fontSize:'0.75rem', color:'var(--text3)', marginBottom:14 }}>By invoice value</p>
            {loading ? <div className="skeleton" style={{ height:140 }}/> : (
                stats?.topClients?.length > 0 ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {stats.topClients.slice(0,4).map((c,i) => (
                          <div key={i}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <div style={{ width:24, height:24, borderRadius:6, background:'rgba(74,222,128,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#4ade80' }}>
                                  {['🥇','🥈','🥉','4'][i]}
                                </div>
                                <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text)', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                              </div>
                              <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#4ade80', flexShrink:0 }}>₹{c.total.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height:3, background:'var(--bg3)', borderRadius:2 }}>
                              <div style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg, #4ade80, #22d3ee)', width:`${Math.round((c.total/(stats.topClients[0]?.total||1))*100)}%`, transition:'width .6s ease' }}/>
                            </div>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div style={{ height:140, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text3)', gap:8 }}>
                      <span style={{ fontSize:28 }}>👥</span>
                      <p style={{ fontSize:'0.78rem', textAlign:'center' }}>Generate invoices<br/>to see top clients</p>
                    </div>
                )
            )}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding:22, animation:'fadeUp 0.4s ease 0.36s both' }}>
            <h2 style={{ fontSize:'1rem', marginBottom:14 }}>Quick Actions</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { to:'/generate?type=invoice', label:'New Invoice', icon:'🧾', color:'#4ade80', bg:'rgba(74,222,128,0.1)' },
                { to:'/generate?type=quotation', label:'Quotation', icon:'📋', color:'#60a5fa', bg:'rgba(96,165,250,0.1)' },
                { to:'/generate?type=receipt', label:'Receipt', icon:'✅', color:'#fbbf24', bg:'rgba(251,191,36,0.1)' },
                { to:'/documents', label:'All Documents', icon:'📂', color:'var(--text2)', bg:'var(--bg2)' },
              ].map((a,i) => (
                  <Link key={i} to={a.to} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                    background:a.bg, borderRadius:10, textDecoration:'none',
                    border:'1px solid transparent', transition:'all .15s'
                  }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateX(4px)'; e.currentTarget.style.borderColor=a.color }}
                        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='transparent' }}>
                    <span style={{ fontSize:16 }}>{a.icon}</span>
                    <span style={{ fontSize:'0.82rem', fontWeight:600, color:a.color }}>{a.label}</span>
                    <span style={{ marginLeft:'auto', color:a.color, fontSize:12, opacity:0.6 }}>→</span>
                  </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent docs */}
        <div className="card" style={{ padding:0, overflow:'hidden', animation:'fadeUp 0.4s ease 0.4s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
            <h2 style={{ fontSize:'1rem' }}>Recent Documents</h2>
            <Link to="/documents" style={{ fontSize:'0.8rem', color:'var(--green)', textDecoration:'none', fontWeight:600 }}>View all →</Link>
          </div>
          {loading ? (
              <div style={{ padding:16 }}>
                {Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:48, marginBottom:8 }}/>)}
              </div>
          ) : stats?.recentDocs?.length > 0 ? (
              stats.recentDocs.map((doc,i) => (
                  <Link key={i} to={`/documents/${doc._id}`} style={{
                    display:'flex', alignItems:'center', gap:14, padding:'13px 20px',
                    borderBottom:'1px solid var(--border)', textDecoration:'none',
                    transition:'background .12s'
                  }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
                        onMouseLeave={e => e.currentTarget.style.background=''}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'rgba(74,222,128,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                      {doc.type==='invoice'?'🧾':doc.type==='quotation'?'📋':doc.type==='receipt'?'✅':'📦'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.documentNumber}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text3)' }}>
                        {doc.clientInfo?.name||'—'} · {new Date(doc.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#4ade80' }}>{cur(doc.total)}</div>
                      <span className={`badge badge-${doc.status}`} style={{ fontSize:'0.62rem' }}>{doc.status}</span>
                    </div>
                  </Link>
              ))
          ) : (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--text3)' }}>
                <div style={{ fontSize:40, marginBottom:10 }}>📊</div>
                <p style={{ fontSize:'0.875rem', marginBottom:16 }}>No documents yet</p>
                <Link to="/generate" className="btn btn-primary" style={{ display:'inline-flex', fontSize:'0.85rem' }}>Generate First Invoice</Link>
              </div>
          )}
        </div>

        {/* Insight bar */}
        {stats && (
            <div style={{
              marginTop:14,
              background:'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(34,211,238,0.1))',
              border:'1px solid rgba(74,222,128,0.2)',
              borderRadius:14, padding:'14px 20px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              gap:12, flexWrap:'wrap', animation:'fadeUp 0.4s ease 0.45s both'
            }}>
              <p style={{ color:'var(--text2)', fontSize:'0.85rem', fontWeight:500, flex:1 }}>
                {stats.overdueCount>0
                    ? `⚠️ ${stats.overdueCount} overdue — follow up to recover ${cur(stats.pendingRevenue)}`
                    : stats.totalRevenue>0
                        ? `✓ ${cur(stats.totalRevenue)} collected · ${stats.invoiceCount} invoice${stats.invoiceCount!==1?'s':''}`
                        : '✦ Generate your first invoice to start tracking revenue'}
              </p>
              <Link to="/generate" className="btn btn-primary" style={{ fontSize:'0.82rem' }}>
                New Invoice →
              </Link>
            </div>
        )}
      </div>
  )
}