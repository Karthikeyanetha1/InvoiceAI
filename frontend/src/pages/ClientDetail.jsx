import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
const CAT_COLORS={individual:'#7c3aed',business:'#2563eb',government:'#d97706',startup:'#16a34a'}
export default function ClientDetail() {
  const {id}=useParams(); const navigate=useNavigate()
  const [client,setClient]=useState(null); const [invoices,setInvoices]=useState([])
  const [loading,setLoading]=useState(true); const [editing,setEditing]=useState(false)
  const [form,setForm]=useState(null); const [saving,setSaving]=useState(false)
  useEffect(()=>{
    api.get(`/clients/${id}`).then(res=>{setClient(res.data.client);setForm(res.data.client);setInvoices(res.data.invoices||[])}).catch(()=>toast.error('Not found')).finally(()=>setLoading(false))
  },[id])
  const handleSave=async()=>{
    setSaving(true)
    try{ const res=await api.put(`/clients/${id}`,form); setClient(res.data.client); setForm(res.data.client); setEditing(false); toast.success('Updated!') }
    catch{ toast.error('Failed') } finally{ setSaving(false) }
  }
  const cur=n=>`₹${(n||0).toLocaleString('en-IN')}`
  const paidPct=client&&client.totalBilled>0?Math.round((client.totalPaid/client.totalBilled)*100):0
  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><div className="spinner-dark" style={{width:32,height:32}}/></div>
  if(!client) return <div style={{padding:40,textAlign:'center'}}><p style={{color:'var(--text3)',marginBottom:16}}>Client not found</p><button className="btn btn-ghost" onClick={()=>navigate('/clients')}>← Back</button></div>
  return(
    <div style={{padding:'22px 28px',maxWidth:1000,animation:'fadeUp .25s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/clients')}>← Clients</button>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${CAT_COLORS[client.category]||'#16a34a'},${CAT_COLORS[client.category]||'#22c55e'}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#fff'}}>
              {client.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{fontSize:'1.1rem',marginBottom:2}}>{client.name}</h1>
              {client.company&&<p style={{fontSize:'0.8rem',color:'var(--text3)'}}>{client.company}</p>}
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Link to={`/generate?client=${encodeURIComponent(client.name)}&email=${encodeURIComponent(client.email||'')}`} className="btn btn-primary btn-sm">+ New Invoice</Link>
          {editing?(<><button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(false);setForm(client)}}>Cancel</button><button className="btn btn-secondary btn-sm" onClick={handleSave} disabled={saving}>{saving?<><span className="spinner-dark"/>Saving…</>:'✓ Save'}</button></>):(<button className="btn btn-secondary btn-sm" onClick={()=>setEditing(true)}>✎ Edit</button>)}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[{label:'Total Billed',value:cur(client.totalBilled),color:'var(--green)'},{label:'Total Paid',value:cur(client.totalPaid),color:'var(--blue)'},{label:'Outstanding',value:cur((client.totalBilled||0)-(client.totalPaid||0)),color:'var(--amber)'}].map(s=>(
              <div key={s.label} className="card" style={{padding:'14px 16px',textAlign:'center'}}>
                <div style={{fontSize:'1.1rem',fontWeight:800,color:s.color,fontFamily:'var(--font-display)',marginBottom:4}}>{s.value}</div>
                <div style={{fontSize:'0.7rem',color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:'16px 20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:'0.85rem',fontWeight:600,color:'var(--text)'}}>Payment collection rate</div>
              <div style={{fontSize:'1rem',fontWeight:800,color:paidPct>=80?'var(--green)':paidPct>=50?'var(--amber)':'var(--red)'}}>{paidPct}%</div>
            </div>
            <div style={{height:8,background:'var(--bg3)',borderRadius:4}}>
              <div style={{height:'100%',width:`${paidPct}%`,background:paidPct>=80?'var(--green)':paidPct>=50?'var(--amber)':'var(--red)',borderRadius:4,transition:'width .6s ease'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:'0.72rem',color:'var(--text3)'}}>
              <span>{cur(client.totalPaid)} collected</span><span>{cur((client.totalBilled||0)-(client.totalPaid||0))} outstanding</span>
            </div>
          </div>
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2 style={{fontSize:'0.9rem'}}>Invoice History</h2>
              <span style={{fontSize:'0.75rem',color:'var(--text3)'}}>{invoices.length} document{invoices.length!==1?'s':''}</span>
            </div>
            {invoices.length===0?(
              <div style={{padding:'32px 20px',textAlign:'center',color:'var(--text3)'}}>
                <p style={{fontSize:'0.875rem',marginBottom:14}}>No invoices for this client yet</p>
                <Link to={`/generate?client=${encodeURIComponent(client.name)}`} className="btn btn-primary btn-sm">Create Invoice</Link>
              </div>
            ):(
              <table className="table">
                <thead><tr><th>Number</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {invoices.map(inv=>(
                    <tr key={inv._id}>
                      <td style={{fontWeight:600,color:'var(--text)',fontSize:'0.85rem'}}>{inv.documentNumber}</td>
                      <td style={{textTransform:'capitalize',color:'var(--text3)'}}>{inv.type?.replace('_',' ')}</td>
                      <td style={{fontWeight:700,color:'var(--green)'}}>₹{(inv.total||0).toLocaleString('en-IN')}</td>
                      <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                      <td style={{color:'var(--text3)'}}>{new Date(inv.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td><Link to={`/documents/${inv._id}`} style={{fontSize:'0.78rem',color:'var(--green)',textDecoration:'none',fontWeight:600}}>Open →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="card" style={{padding:18}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <h2 style={{fontSize:'0.9rem'}}>Contact Info</h2>
              {!editing&&<button className="btn btn-ghost btn-sm" onClick={()=>setEditing(true)}>Edit</button>}
            </div>
            {editing?(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[{k:'name',l:'Name',t:'text'},{k:'company',l:'Company',t:'text'},{k:'email',l:'Email',t:'email'},{k:'phone',l:'Phone',t:'tel'},{k:'gstin',l:'GSTIN',t:'text'}].map(f=>(
                  <div key={f.k}><label style={{display:'block',marginBottom:4}}>{f.l}</label><input type={f.t} value={form?.[f.k]||''} onChange={e=>setForm(fm=>({...fm,[f.k]:e.target.value}))}/></div>
                ))}
                <div><label style={{display:'block',marginBottom:4}}>Address</label><textarea value={form?.address||''} onChange={e=>setForm(fm=>({...fm,address:e.target.value}))} rows={2}/></div>
                <div><label style={{display:'block',marginBottom:4}}>Category</label>
                  <select value={form?.category||'business'} onChange={e=>setForm(fm=>({...fm,category:e.target.value}))}>
                    {['business','individual','government','startup'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={{display:'block',marginBottom:4}}>Status</label>
                  <select value={form?.status||'active'} onChange={e=>setForm(fm=>({...fm,status:e.target.value}))}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
                <div><label style={{display:'block',marginBottom:4}}>Notes</label><textarea value={form?.notes||''} onChange={e=>setForm(fm=>({...fm,notes:e.target.value}))} rows={3} placeholder="Internal notes…"/></div>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[{label:'Email',value:client.email,icon:'✉'},{label:'Phone',value:client.phone,icon:'📞'},{label:'GSTIN',value:client.gstin,icon:'📋'},{label:'Category',value:client.category,icon:'🏷'},{label:'Status',value:client.status,icon:'◎'}].filter(r=>r.value).map(row=>(
                  <div key={row.label} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                    <span style={{fontSize:13,marginTop:1,flexShrink:0}}>{row.icon}</span>
                    <div><div style={{fontSize:'0.68rem',color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.04em'}}>{row.label}</div><div style={{fontSize:'0.82rem',color:'var(--text)',fontWeight:500,marginTop:1,textTransform:'capitalize'}}>{row.value}</div></div>
                  </div>
                ))}
                {client.address&&<div style={{display:'flex',gap:8}}><span style={{fontSize:13,marginTop:1,flexShrink:0}}>📍</span><div><div style={{fontSize:'0.68rem',color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.04em'}}>Address</div><div style={{fontSize:'0.82rem',color:'var(--text)',marginTop:1,lineHeight:1.6}}>{client.address}</div></div></div>}
                {client.notes&&<div style={{marginTop:4,padding:'10px 12px',background:'var(--bg3)',borderRadius:8,fontSize:'0.8rem',color:'var(--text2)',lineHeight:1.6}}>{client.notes}</div>}
              </div>
            )}
          </div>
          <div className="card" style={{padding:18}}>
            <h2 style={{fontSize:'0.9rem',marginBottom:14}}>Summary</h2>
            {[{label:'Invoices',value:client.invoiceCount||0},{label:'Total Billed',value:cur(client.totalBilled)},{label:'Collected',value:cur(client.totalPaid)},{label:'Last Invoice',value:client.lastInvoiceDate?new Date(client.lastInvoiceDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Never'},{label:'Added On',value:new Date(client.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}].map(row=>(
              <div key={row.label} style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',marginBottom:9,paddingBottom:9,borderBottom:'1px solid var(--border)'}}>
                <span style={{color:'var(--text3)'}}>{row.label}</span><span style={{fontWeight:600,color:'var(--text)'}}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
