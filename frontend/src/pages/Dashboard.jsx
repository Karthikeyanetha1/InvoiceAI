import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const STATUS_COLORS = { paid:'#16a34a', sent:'#2563eb', draft:'#d97706', cancelled:'#dc2626' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{background:'#fff',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 16px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
      <p style={{fontWeight:700,color:'#0f172a',marginBottom:6,fontSize:13}}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{fontSize:12,color:p.color,marginBottom:2}}>{p.name}: <strong>₹{(p.value||0).toLocaleString('en-IN')}</strong></p>)}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('revenue')

  useEffect(() => {
    api.get('/documents/stats/overview').then(r=>setStats(r.data)).catch(console.error).finally(()=>setLoading(false))
  }, [])

  const cur = (n) => `₹${(n||0).toLocaleString('en-IN')}`
  const growthPct = stats&&stats.lastMonthRevenue>0 ? Math.round(((stats.thisMonthRevenue-stats.lastMonthRevenue)/stats.lastMonthRevenue)*100) : null
  const hour = new Date().getHours()
  const greeting = hour<12?'Morning':hour<17?'Afternoon':'Evening'

  const statCards = [
    {label:'Total Revenue',value:cur(stats?.totalRevenue),icon:'💰',color:'#16a34a',bg:'#dcfce7',sub:growthPct!==null?`${growthPct>=0?'+':''}${growthPct}% MoM`:null,subGood:growthPct>=0},
    {label:'Pending Amount',value:cur(stats?.pendingRevenue),icon:'⏳',color:'#d97706',bg:'#fef9c3'},
    {label:'Total Invoices',value:stats?.invoiceCount||0,icon:'🧾',color:'#2563eb',bg:'#dbeafe'},
    {label:'Overdue',value:stats?.overdueCount||0,icon:'⚠️',color:'#dc2626',bg:'#fee2e2'}
  ]

  return (
    <div style={{padding:'28px 32px',animation:'fadeIn .3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Good {greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{color:'var(--text3)',fontSize:14}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <Link to="/generate" className="btn btn-primary btn-pulse">✦ Generate Invoice</Link>
          <Link to="/documents" className="btn btn-secondary">View All</Link>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} className="card"><div className="skeleton" style={{height:90,borderRadius:10}}/></div>) :
        statCards.map((card,i)=>(
          <div key={i} className="card stat-card" style={{padding:20,animation:`fadeIn .4s ease ${i*0.07}s both`,borderTop:`3px solid ${card.color}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div style={{width:42,height:42,borderRadius:12,background:card.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{card.icon}</div>
              {card.sub&&<span style={{fontSize:10,fontWeight:700,color:card.subGood?'#16a34a':'#dc2626',background:card.subGood?'#dcfce7':'#fee2e2',padding:'2px 8px',borderRadius:20}}>{card.sub}</span>}
            </div>
            <div style={{fontSize:24,fontWeight:800,color:card.color,fontFamily:'Syne,sans-serif',marginBottom:4}}>{card.value}</div>
            <div style={{fontSize:12,color:'var(--text3)',fontWeight:500}}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:18,marginBottom:24}}>
        <div className="card" style={{animation:'fadeIn .5s ease .2s both'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>Revenue Overview</div>
              <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>Last 6 months</div>
            </div>
            <div style={{display:'flex',gap:6}}>
              {['revenue','pending'].map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:'5px 12px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',border:activeTab===tab?'1.5px solid var(--accent)':'1.5px solid var(--border)',background:activeTab===tab?'var(--accent-light)':'transparent',color:activeTab===tab?'var(--accent)':'var(--text3)',transition:'all .2s'}}>
                  {tab.charAt(0).toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loading?<div className="skeleton" style={{height:220,borderRadius:12}}/>:(
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats?.monthlyData||[]} margin={{top:5,right:5,left:0,bottom:5}}>
                <defs>
                  <linearGradient id="cR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
                  <linearGradient id="cP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/><stop offset="95%" stopColor="#d97706" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:12,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${(v/1000).toFixed(0)}k`:`₹${v}`}/>
                <Tooltip content={<CustomTooltip/>}/>
                {activeTab==='revenue'
                  ?<Area type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#cR)" dot={{fill:'#16a34a',r:4}} activeDot={{r:6}}/>
                  :<Area type="monotone" dataKey="pending" name="Pending" stroke="#d97706" strokeWidth={2.5} fill="url(#cP)" dot={{fill:'#d97706',r:4}} activeDot={{r:6}}/>
                }
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{animation:'fadeIn .5s ease .3s both'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:4}}>Invoice Status</div>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:16}}>Distribution</div>
          {loading?<div className="skeleton" style={{height:200,borderRadius:12}}/>:(
            stats?.byStatus?.some(s=>s.count>0)?(
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={stats.byStatus.filter(s=>s.count>0)} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {stats.byStatus.filter(s=>s.count>0).map((s,i)=><Cell key={i} fill={STATUS_COLORS[s._id]||'#16a34a'}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[v,n.charAt(0).toUpperCase()+n.slice(1)]}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
                  {stats.byStatus.filter(s=>s.count>0).map(s=>(
                    <div key={s._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:STATUS_COLORS[s._id]||'#16a34a'}}/>
                        <span style={{color:'var(--text2)',textTransform:'capitalize'}}>{s._id}</span>
                      </div>
                      <strong style={{color:'var(--text)'}}>{s.count}</strong>
                    </div>
                  ))}
                </div>
              </>
            ):<div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:13}}>No data yet — generate invoices!</div>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:24}}>
        <div className="card" style={{animation:'fadeIn .5s ease .35s both'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:4}}>Monthly Volume</div>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:16}}>Invoices per month</div>
          {loading?<div className="skeleton" style={{height:180,borderRadius:12}}/>:(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.monthlyData||[]} margin={{top:5,right:5,left:0,bottom:5}} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:12,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip formatter={(v)=>[v,'Invoices']}/>
                <Bar dataKey="invoices" radius={[6,6,0,0]}>
                  {(stats?.monthlyData||[]).map((_,i)=><Cell key={i} fill={i===5?'#16a34a':'#86efac'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{animation:'fadeIn .5s ease .4s both'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:4}}>Top Clients</div>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:16}}>By invoice value</div>
          {loading?<div className="skeleton" style={{height:180,borderRadius:12}}/>:(
            stats?.topClients?.length>0?(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {stats.topClients.map((client,i)=>{
                  const pct=Math.round((client.total/(stats.topClients[0]?.total||1))*100)
                  const medals=['🥇','🥈','🥉','4️⃣','5️⃣']
                  return(
                    <div key={i}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:16}}>{medals[i]}</span>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{client.name}</div>
                            {client.company&&<div style={{fontSize:10,color:'var(--text3)'}}>{client.company}</div>}
                          </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:13,fontWeight:700,color:'var(--accent)'}}>₹{client.total.toLocaleString('en-IN')}</div>
                          <div style={{fontSize:10,color:'var(--text3)'}}>{client.count} invoice{client.count!==1?'s':''}</div>
                        </div>
                      </div>
                      <div style={{height:5,background:'var(--bg3)',borderRadius:3}}>
                        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#16a34a,#22c55e)',borderRadius:3,transition:'width .6s ease'}}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            ):<div style={{height:180,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'var(--text3)',gap:8}}><div style={{fontSize:32}}>👥</div><p style={{fontSize:13}}>Generate invoices to see top clients</p></div>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:18}}>
        <div className="card" style={{animation:'fadeIn .5s ease .45s both'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:16}}>Quick Actions</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[{to:'/generate?type=invoice',label:'New Invoice',emoji:'🧾',color:'#16a34a',bg:'#dcfce7'},{to:'/generate?type=quotation',label:'Quotation',emoji:'📋',color:'#2563eb',bg:'#dbeafe'},{to:'/generate?type=receipt',label:'Receipt',emoji:'✅',color:'#d97706',bg:'#fef9c3'},{to:'/generate?type=purchase_order',label:'PO',emoji:'📦',color:'#7c3aed',bg:'#ede9fe'},{to:'/documents',label:'All Docs',emoji:'📂',color:'#0891b2',bg:'#e0f2fe'},{to:'/settings',label:'Settings',emoji:'⚙️',color:'#374151',bg:'#f3f4f6'}].map((a,i)=>(
              <Link key={i} to={a.to} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,padding:'14px 8px',background:a.bg,borderRadius:12,textDecoration:'none',border:'1.5px solid transparent',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.border=`1.5px solid ${a.color}`;e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.border='1.5px solid transparent';e.currentTarget.style.transform=''}}>
                <span style={{fontSize:22}}>{a.emoji}</span>
                <span style={{fontSize:11,fontWeight:600,color:a.color,textAlign:'center'}}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card" style={{animation:'fadeIn .5s ease .5s both'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>Recent Documents</div>
            <Link to="/documents" style={{fontSize:12,color:'var(--accent)',textDecoration:'none',fontWeight:600}}>View all →</Link>
          </div>
          {loading?Array(4).fill(0).map((_,i)=><div key={i} className="skeleton" style={{height:52,marginBottom:10,borderRadius:10}}/>):(
            stats?.recentDocs?.length>0?(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {stats.recentDocs.map((doc,i)=>(
                  <Link key={i} to={`/documents/${doc._id}`} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'var(--bg3)',borderRadius:10,textDecoration:'none',transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--accent-light)';e.currentTarget.style.transform='translateX(4px)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.transform=''}}>
                    <div style={{width:38,height:38,borderRadius:10,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                      {doc.type==='invoice'?'🧾':doc.type==='quotation'?'📋':doc.type==='receipt'?'✅':'📦'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.documentNumber}</div>
                      <div style={{fontSize:11,color:'var(--text3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.clientInfo?.name||'—'} • {new Date(doc.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:'var(--accent)'}}>₹{(doc.total||0).toLocaleString('en-IN')}</div>
                      <span className={`badge badge-${doc.status}`} style={{fontSize:9}}>{doc.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ):<div style={{padding:'40px 20px',textAlign:'center',color:'var(--text3)'}}><div style={{fontSize:36,marginBottom:10}}>📊</div><p style={{fontSize:13,marginBottom:16}}>No documents yet</p><Link to="/generate" className="btn btn-primary" style={{display:'inline-flex',fontSize:13}}>Generate First Invoice</Link></div>
          )}
        </div>
      </div>

      <div style={{marginTop:18,background:'linear-gradient(135deg,#15803d,#16a34a,#22c55e)',borderRadius:16,padding:'20px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',animation:'fadeIn .5s ease .55s both',boxShadow:'0 8px 32px rgba(22,163,74,0.3)',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:800,color:'#fff',marginBottom:4}}>✦ AI Insights</div>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.85)',maxWidth:420}}>
            {stats?.overdueCount>0?`⚠️ You have ${stats.overdueCount} overdue invoice${stats.overdueCount>1?'s':''}. Follow up to recover ${cur(stats.pendingRevenue)}.`:stats?.totalRevenue>0?`🎉 You've collected ${cur(stats.totalRevenue)} in revenue. Keep growing!`:'🚀 Start generating invoices to unlock AI-powered insights!'}
          </p>
        </div>
        <Link to="/generate" style={{background:'rgba(255,255,255,0.2)',color:'#fff',padding:'10px 20px',borderRadius:10,textDecoration:'none',fontSize:13,fontWeight:600,whiteSpace:'nowrap',border:'1px solid rgba(255,255,255,0.3)',transition:'all .2s',flexShrink:0}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.3)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}>
          Generate Now →
        </Link>
      </div>
    </div>
  )
}
