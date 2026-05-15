import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const CAT_COLORS={individual:'#7c3aed',business:'#2563eb',government:'#d97706',startup:'#16a34a'}
const CAT_BG={individual:'#ede9fe',business:'#dbeafe',government:'#fef9c3',startup:'#dcfce7'}

function AddModal({ onClose, onAdded }) {
  const [form,setForm]=useState({name:'',company:'',email:'',phone:'',address:'',gstin:'',category:'business',notes:''})
  const [loading,setLoading]=useState(false)
  const handleSubmit=async(e)=>{
    e.preventDefault()
    if(!form.name.trim()) return toast.error('Name required')
    setLoading(true)
    try{ const res=await api.post('/clients',form); toast.success('Client added!'); onAdded(res.data.client) }
    catch(err){ toast.error(err.response?.data?.error||'Failed') }
    finally{ setLoading(false) }
  }
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',overflow:'hidden',animation:'fadeUp .25s ease'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{fontSize:'1rem'}}>Add New Client</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,color:'var(--text3)',cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{padding:20}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            {[{k:'name',l:'Full Name *',t:'text',p:'Rahul Sharma'},{k:'company',l:'Company',t:'text',p:'TechCorp Pvt Ltd'},{k:'email',l:'Email',t:'email',p:'rahul@techcorp.com'},{k:'phone',l:'Phone',t:'tel',p:'+91 9999999999'},{k:'gstin',l:'GSTIN',t:'text',p:'27AAPFU0939F1ZV'}].map(f=>(
              <div key={f.k}>
                <label style={{display:'block',marginBottom:4}}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm(fm=>({...fm,[f.k]:e.target.value}))} required={f.k==='name'}/>
              </div>
            ))}
            <div>
              <label style={{display:'block',marginBottom:4}}>Category</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                <option value="business">Business</option>
                <option value="individual">Individual</option>
                <option value="government">Government</option>
                <option value="startup">Startup</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:4}}>Address</label>
            <textarea placeholder="Full address" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} rows={2}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',marginBottom:4}}>Notes</label>
            <textarea placeholder="Internal notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2}/>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{flex:1,justifyContent:'center'}}>
              {loading?<><span className="spinner"/>Adding…</>:'Add Client'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Clients() {
  const [clients,setClients]=useState([])
  const [loading,setLoading]=useState(true)
  const [syncing,setSyncing]=useState(false)
  const [search,setSearch]=useState('')
  const [category,setCategory]=useState('all')
  const [showAdd,setShowAdd]=useState(false)
  const navigate=useNavigate()
  const cur=n=>`₹${(n||0).toLocaleString('en-IN')}`

  const fetchClients=async()=>{
    setLoading(true)
    try{
      const params={}
      if(category!=='all') params.category=category
      if(search) params.search=search
      const res=await api.get('/clients',{params})
      setClients(res.data.clients)
    }catch{ toast.error('Failed to load') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchClients() },[category,search])

  const handleSync=async()=>{
    setSyncing(true)
    try{ const res=await api.post('/clients/sync'); toast.success(res.data.message); fetchClients() }
    catch{ toast.error('Sync failed') }
    finally{ setSyncing(false) }
  }

  const handleDelete=async(id,name)=>{
    if(!confirm(`Delete "${name}"?`)) return
    try{ await api.delete(`/clients/${id}`); setClients(c=>c.filter(cl=>cl._id!==id)); toast.success('Deleted') }
    catch{ toast.error('Delete failed') }
  }

  const totalBilled=clients.reduce((s,c)=>s+(c.totalBilled||0),0)
  const totalPaid=clients.reduce((s,c)=>s+(c.totalPaid||0),0)

  return(
    <div style={{padding:'22px 28px',animation:'fadeUp .25s ease'}}>
      {showAdd&&<AddModal onClose={()=>setShowAdd(false)} onAdded={c=>{setClients(cl=>[c,...cl]);setShowAdd(false)}}/>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{marginBottom:3}}>Clients</h1>
          <p style={{color:'var(--text3)',fontSize:'0.82rem'}}>{clients.length} client{clients.length!==1?'s':''} · manage your business relationships</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
            {syncing?<><span className="spinner-dark"/>Syncing…</>:'↻ Sync from Invoices'}
          </button>
          <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Client</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[{label:'Total Clients',value:clients.length,icon:'👥',color:'var(--blue)'},{label:'Active',value:clients.filter(c=>c.status==='active').length,icon:'✓',color:'var(--green)'},{label:'Total Billed',value:cur(totalBilled),icon:'₹',color:'var(--green)'},{label:'Collected',value:cur(totalPaid),icon:'💰',color:'var(--purple)'}].map((s,i)=>(
          <div key={i} className="card stat-card" style={{padding:'14px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</span>
              <span style={{fontSize:16}}>{s.icon}</span>
            </div>
            <div style={{fontSize:'1.15rem',fontWeight:800,color:s.color,fontFamily:'var(--font-display)'}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap',alignItems:'center'}}>
        <input placeholder="Search name, company, email…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:260,fontSize:'0.85rem'}}/>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['all','individual','business','government','startup'].map(cat=>(
            <button key={cat} onClick={()=>setCategory(cat)} style={{padding:'5px 12px',borderRadius:20,fontSize:'0.75rem',fontWeight:600,cursor:'pointer',border:category===cat?'1.5px solid var(--green)':'1.5px solid var(--border)',background:category===cat?'var(--green-light)':'transparent',color:category===cat?'var(--green)':'var(--text3)',transition:'all .15s'}}>
              {cat.charAt(0).toUpperCase()+cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:14}}>
          {Array(6).fill(0).map((_,i)=><div key={i} className="card"><div className="skeleton" style={{height:160}}/></div>)}
        </div>
      ):clients.length===0?(
        <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text3)'}}>
          <div style={{fontSize:48,marginBottom:14}}>👥</div>
          <h2 style={{color:'var(--text)',marginBottom:8,fontSize:'1.1rem'}}>No clients yet</h2>
          <p style={{fontSize:'0.875rem',marginBottom:20}}>{search?'No clients match your search.':'Add clients or sync from your existing invoices.'}</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Client</button>
            <button className="btn btn-secondary" onClick={handleSync} disabled={syncing}>↻ Sync from Invoices</button>
          </div>
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:14}}>
          {clients.map((client,i)=>(
            <div key={client._id} className="card" style={{padding:0,overflow:'hidden',cursor:'pointer',transition:'all .2s',animation:`fadeUp .3s ease ${i*0.04}s both`}}
              onClick={()=>navigate(`/clients/${client._id}`)}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shadow-md)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}}>
              <div style={{padding:'16px 18px 12px',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${CAT_COLORS[client.category]||'#16a34a'},${CAT_COLORS[client.category]||'#22c55e'}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#fff',flexShrink:0}}>
                      {client.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:'0.9rem',color:'var(--text)'}}>{client.name}</div>
                      {client.company&&<div style={{fontSize:'0.75rem',color:'var(--text3)',marginTop:1}}>{client.company}</div>}
                    </div>
                  </div>
                  <span style={{fontSize:'0.62rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:CAT_BG[client.category]||'#dcfce7',color:CAT_COLORS[client.category]||'#16a34a',textTransform:'uppercase',letterSpacing:'0.03em',flexShrink:0}}>
                    {client.category}
                  </span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:3}}>
                  {client.email&&<div style={{fontSize:'0.75rem',color:'var(--text3)',display:'flex',alignItems:'center',gap:5}}><span>✉</span>{client.email}</div>}
                  {client.phone&&<div style={{fontSize:'0.75rem',color:'var(--text3)',display:'flex',alignItems:'center',gap:5}}><span>📞</span>{client.phone}</div>}
                </div>
              </div>
              <div style={{padding:'10px 18px',display:'flex',justifyContent:'space-between',background:'var(--bg3)'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:'var(--green)'}}>{cur(client.totalBilled)}</div>
                  <div style={{fontSize:'0.62rem',color:'var(--text3)',marginTop:1}}>Billed</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:'var(--text)'}}>{client.invoiceCount||0}</div>
                  <div style={{fontSize:'0.62rem',color:'var(--text3)',marginTop:1}}>Invoices</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:'var(--blue)'}}>{cur(client.totalPaid)}</div>
                  <div style={{fontSize:'0.62rem',color:'var(--text3)',marginTop:1}}>Paid</div>
                </div>
              </div>
              <div style={{padding:'8px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <Link to={`/generate?client=${encodeURIComponent(client.name)}`} onClick={e=>e.stopPropagation()}
                  style={{fontSize:'0.75rem',color:'var(--green)',textDecoration:'none',fontWeight:600}}>+ Invoice</Link>
                <div style={{display:'flex',gap:10}}>
                  <button onClick={e=>{e.stopPropagation();navigate(`/clients/${client._id}`)}} style={{fontSize:'0.75rem',color:'var(--blue)',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>View</button>
                  <button onClick={e=>{e.stopPropagation();handleDelete(client._id,client.name)}} style={{fontSize:'0.75rem',color:'var(--text3)',background:'none',border:'none',cursor:'pointer'}}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
