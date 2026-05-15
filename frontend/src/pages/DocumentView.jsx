import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TEMPLATES = [
  { id:'modern',  label:'Modern',  desc:'Green accent, clean', color:'#16a34a', bg:'#f0fdf4', icon:'🟢' },
  { id:'canva', label:'Canva Style', desc:'Navy, traditional',   color:'#1e3a5f', bg:'#eff6ff', icon:'🔵' },
  { id:'professional', label:'Professional', desc:'Ultra clean',         color:'#64748b', bg:'#f8fafc', icon:'⬜' },
  { id:'elegant',    label:'Elegant',    desc:'Dark theme',          color:'#22c55e', bg:'#0f172a', icon:'⚫' },
]

function TemplatePicker({ selected, onSelect, onDownload, onClose }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:460,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',overflow:'hidden',animation:'fadeUp .25s ease'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2 style={{fontSize:'1rem'}}>Choose PDF Template</h2>
            <p style={{fontSize:'0.75rem',color:'var(--text3)',marginTop:2}}>4 professional designs available</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,color:'var(--text3)',cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {TEMPLATES.map(t=>(
            <button key={t.id} onClick={()=>onSelect(t.id)} style={{
              padding:'14px 16px',borderRadius:12,textAlign:'left',cursor:'pointer',outline:'none',
              border:`2px solid ${selected===t.id?t.color:'var(--border)'}`,
              background:selected===t.id?t.bg:'var(--surface)',
              transition:'all .15s'
            }}>
              <div style={{fontSize:26,marginBottom:8}}>{t.icon}</div>
              <div style={{fontSize:'0.875rem',fontWeight:700,color:selected===t.id?t.color:'var(--text)',marginBottom:2}}>{t.label}</div>
              <div style={{fontSize:'0.72rem',color:'var(--text3)'}}>{t.desc}</div>
              {selected===t.id&&<div style={{marginTop:6,fontSize:'0.7rem',fontWeight:700,color:t.color}}>✓ Selected</div>}
            </button>
          ))}
        </div>
        <div style={{padding:'0 20px 20px',display:'flex',gap:10}}>
          <button onClick={onDownload} className="btn btn-primary" style={{flex:1,justifyContent:'center'}}>
            ↓ Download {TEMPLATES.find(t=>t.id===selected)?.label} PDF
          </button>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function DocumentView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [form, setForm] = useState(null)
  const [showTemplate, setShowTemplate] = useState(false)
  const [template, setTemplate] = useState('modern')

  useEffect(() => {
    api.get(`/documents/${id}`)
      .then(res => { setDoc(res.data.document); setForm(res.data.document) })
      .catch(() => toast.error('Document not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put(`/documents/${id}`, form)
      setDoc(res.data.document); setForm(res.data.document)
      setEditing(false); toast.success('Saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleAiImprove = async () => {
    if (!aiFeedback.trim()) return toast.error('Describe what to improve')
    setAiLoading(true)
    try {
      const res = await api.post(`/generate/improve/${id}`, { feedback: aiFeedback })
      setDoc(res.data.document); setForm(res.data.document)
      setAiFeedback(''); toast.success('✦ Improved!')
    } catch { toast.error('AI improvement failed') }
    finally { setAiLoading(false) }
  }

  const handleOpenPdf = async (tmpl) => {
    const selectedTemplate = tmpl || template
    setPdfLoading(true)
    setShowTemplate(false)
    try {
      const token = localStorage.getItem('invoiceai_token')
      const res = await fetch(`/api/generate/pdf/${id}?template=${selectedTemplate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed')
      const html = await res.text()
      const win = window.open('', '_blank')
      win.document.write(html)
      win.document.close()
      toast.success(`${TEMPLATES.find(t=>t.id===selectedTemplate)?.label} PDF opened! Use Print → Save as PDF`)
    } catch { toast.error('PDF failed — check backend') }
    finally { setPdfLoading(false) }
  }

  const handleStatusChange = async (status) => {
    try {
      const res = await api.put(`/documents/${id}`, { status })
      setDoc(res.data.document); setForm(res.data.document)
      toast.success(`Status: ${status}`)
    } catch { toast.error('Update failed') }
  }

  const updateLineItem = (idx, field, value) => {
    const items = [...form.lineItems]
    items[idx] = { ...items[idx], [field]: value }
    if (field==='quantity'||field==='rate') items[idx].amount=(items[idx].quantity||0)*(items[idx].rate||0)
    const subtotal=items.reduce((s,i)=>s+(i.amount||0),0)
    const taxAmount=(subtotal*(form.taxRate||18))/100
    const total=subtotal+taxAmount-(form.discount||0)
    setForm(f=>({...f,lineItems:items,subtotal,taxAmount,total}))
  }
  const addLineItem=()=>setForm(f=>({...f,lineItems:[...(f.lineItems||[]),{description:'',quantity:1,rate:0,amount:0}]}))
  const removeLineItem=(idx)=>{
    const items=form.lineItems.filter((_,i)=>i!==idx)
    const subtotal=items.reduce((s,i)=>s+(i.amount||0),0)
    const taxAmount=(subtotal*(form.taxRate||18))/100
    const total=subtotal+taxAmount-(form.discount||0)
    setForm(f=>({...f,lineItems:items,subtotal,taxAmount,total}))
  }
  const cur=n=>`₹${(n||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><div className="spinner-dark" style={{width:32,height:32}}/></div>
  if(!doc) return <div style={{padding:40,textAlign:'center'}}><p style={{color:'var(--text3)',marginBottom:16}}>Document not found</p><button className="btn btn-ghost" onClick={()=>navigate('/documents')}>← Back</button></div>

  return (
    <div style={{padding:'22px 28px',maxWidth:1100,animation:'fadeUp .25s ease'}}>
      {showTemplate && (
        <TemplatePicker
          selected={template}
          onSelect={setTemplate}
          onDownload={()=>handleOpenPdf(template)}
          onClose={()=>setShowTemplate(false)}
        />
      )}

      {/* Top bar */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:10,background:'#fff',padding:'13px 18px',borderRadius:'var(--radius)',border:'1px solid var(--border)',boxShadow:'var(--shadow-sm)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/documents')}>← Back</button>
          <div>
            <div style={{fontSize:'1rem',fontWeight:700,color:'var(--text)'}}>{doc.documentNumber}</div>
            <div style={{fontSize:'0.75rem',color:'var(--text3)',marginTop:1}}>{doc.title}</div>
          </div>
          <span className={`badge badge-${doc.status}`}>{doc.status}</span>
          {doc.aiGenerated&&<span style={{fontSize:'0.65rem',fontWeight:700,background:'var(--green-light)',color:'var(--green)',padding:'2px 7px',borderRadius:20}}>✦ AI</span>}
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
          <select value={doc.status} onChange={e=>handleStatusChange(e.target.value)} style={{width:'auto',padding:'7px 11px',fontSize:'0.82rem',borderRadius:'var(--radius-sm)'}}>
            {['draft','sent','paid','cancelled'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          {editing?(
            <>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(false);setForm(doc)}}>Cancel</button>
              <button className="btn btn-secondary btn-sm" onClick={handleSave} disabled={saving}>{saving?<><span className="spinner-dark"/>Saving…</>:'✓ Save'}</button>
            </>
          ):(
            <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(true)}>✎ Edit</button>
          )}
          {/* Template PDF button */}
          <button className="btn btn-primary btn-sm" onClick={()=>setShowTemplate(true)} disabled={pdfLoading}
            style={{display:'flex',alignItems:'center',gap:6}}>
            {pdfLoading?<><span className="spinner"/>Loading…</>:<>↓ PDF <span style={{fontSize:11,opacity:0.8,background:'rgba(255,255,255,0.2)',padding:'1px 6px',borderRadius:4,marginLeft:2}}>4 styles</span></>}
          </button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Client + Info */}
          <div className="card" style={{padding:20}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div>
                <div className="section-label">Bill To</div>
                {editing?(
                  <div style={{display:'flex',flexDirection:'column',gap:7}}>
                    {[{k:'name',p:'Client name'},{k:'company',p:'Company'},{k:'email',p:'Email'},{k:'phone',p:'Phone'},{k:'address',p:'Address'}].map(f=>(
                      <input key={f.k} placeholder={f.p} value={form.clientInfo?.[f.k]||''} onChange={e=>setForm(fm=>({...fm,clientInfo:{...fm.clientInfo,[f.k]:e.target.value}}))}/>
                    ))}
                  </div>
                ):(
                  <div>
                    <div style={{fontWeight:700,fontSize:'0.95rem',color:'var(--text)'}}>{doc.clientInfo?.name||'—'}</div>
                    {doc.clientInfo?.company&&<div style={{fontSize:'0.82rem',color:'var(--text2)',marginTop:2}}>{doc.clientInfo.company}</div>}
                    <div style={{fontSize:'0.78rem',color:'var(--text3)',marginTop:5,lineHeight:1.8}}>
                      {doc.clientInfo?.email&&<div>{doc.clientInfo.email}</div>}
                      {doc.clientInfo?.phone&&<div>{doc.clientInfo.phone}</div>}
                      {doc.clientInfo?.address&&<div>{doc.clientInfo.address}</div>}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="section-label">Document Info</div>
                {[
                  {label:'Number',value:doc.documentNumber},
                  {label:'Type',value:doc.type?.replace('_',' ')},
                  {label:'Due Date',value:doc.dueDate?new Date(doc.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'},
                  {label:'Created',value:new Date(doc.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                ].map(row=>(
                  <div key={row.label} style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',marginBottom:7,paddingBottom:7,borderBottom:'1px solid var(--border)'}}>
                    <span style={{color:'var(--text3)'}}>{row.label}</span>
                    <span style={{fontWeight:600,textTransform:'capitalize',color:'var(--text)'}}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card" style={{padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div className="section-label" style={{marginBottom:0}}>Line Items</div>
              {editing&&<button className="btn btn-ghost btn-sm" onClick={addLineItem}>+ Add Item</button>}
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'var(--bg3)'}}>
                  {['Description','Qty','Rate','Amount',editing?'':null].filter(Boolean).map(h=>(
                    <th key={h} style={{padding:'9px 11px',textAlign:h==='Description'?'left':'right',fontSize:'0.7rem',fontWeight:700,color:'var(--text3)',letterSpacing:'0.05em',textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(editing?form.lineItems:doc.lineItems)?.map((item,idx)=>(
                  <tr key={idx} style={{borderBottom:'1px solid var(--border)'}}>
                    <td style={{padding:'9px 11px'}}>{editing?<input value={item.description} onChange={e=>updateLineItem(idx,'description',e.target.value)} placeholder="Description"/>:<span style={{fontSize:'0.85rem',fontWeight:500,color:'var(--text)'}}>{item.description}</span>}</td>
                    <td style={{padding:'9px 11px',textAlign:'right',width:75}}>{editing?<input type="number" value={item.quantity} onChange={e=>updateLineItem(idx,'quantity',parseFloat(e.target.value)||0)} style={{textAlign:'right'}}/>:<span style={{fontSize:'0.85rem',color:'var(--text2)'}}>{item.quantity}</span>}</td>
                    <td style={{padding:'9px 11px',textAlign:'right',width:120}}>{editing?<input type="number" value={item.rate} onChange={e=>updateLineItem(idx,'rate',parseFloat(e.target.value)||0)} style={{textAlign:'right'}}/>:<span style={{fontSize:'0.85rem',color:'var(--text2)'}}>{cur(item.rate)}</span>}</td>
                    <td style={{padding:'9px 11px',textAlign:'right',width:120}}><span style={{fontSize:'0.85rem',fontWeight:700,color:'var(--green)'}}>{cur(item.amount)}</span></td>
                    {editing&&<td style={{padding:'9px 8px',width:32}}><button onClick={()=>removeLineItem(idx)} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:18,lineHeight:1}}>×</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
              <div style={{width:250}}>
                {[{label:'Subtotal',value:cur(editing?form.subtotal:doc.subtotal)},{label:`GST (${doc.taxRate||18}%)`,value:cur(editing?form.taxAmount:doc.taxAmount)},doc.discount?{label:'Discount',value:`-${cur(doc.discount)}`}:null].filter(Boolean).map(row=>(
                  <div key={row.label} style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'var(--text2)',marginBottom:5}}><span>{row.label}</span><span>{row.value}</span></div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'1rem',fontWeight:800,paddingTop:9,borderTop:'2px solid var(--border)',marginTop:5}}>
                  <span style={{color:'var(--text)'}}>Total</span>
                  <span style={{color:'var(--green)'}}>{cur(editing?form.total:doc.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{padding:20}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
              <div>
                <div className="section-label">Notes</div>
                {editing?<textarea value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={4} placeholder="Payment notes..."/>:<p style={{fontSize:'0.82rem',color:'var(--text2)',lineHeight:1.7}}>{doc.notes||'—'}</p>}
              </div>
              <div>
                <div className="section-label">Terms & Conditions</div>
                {editing?<textarea value={form.terms||''} onChange={e=>setForm(f=>({...f,terms:e.target.value}))} rows={4} placeholder="Terms..."/>:<p style={{fontSize:'0.82rem',color:'var(--text2)',lineHeight:1.7}}>{doc.terms||'—'}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* PDF Templates Card */}
          <div className="card" style={{padding:18,background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',border:'1px solid #86efac'}}>
            <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--green)',marginBottom:12}}>↓ PDF Templates</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
              {TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>handleOpenPdf(t.id)}
                  style={{padding:'10px 8px',borderRadius:9,border:`1.5px solid ${template===t.id?t.color:'rgba(0,0,0,0.1)'}`,background:t.id==='bold'?'#0f172a':'#fff',cursor:'pointer',textAlign:'center',transition:'all .15s',outline:'none'}}>
                  <div style={{fontSize:18,marginBottom:4}}>{t.icon}</div>
                  <div style={{fontSize:'0.72rem',fontWeight:700,color:t.id==='bold'?'#22c55e':t.color}}>{t.label}</div>
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={()=>setShowTemplate(true)} style={{width:'100%',justifyContent:'center',fontSize:'0.82rem'}}>
              Choose & Download PDF
            </button>
          </div>

          {/* AI Improve */}
          <div className="card" style={{padding:18}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:10}}>
              <span style={{fontSize:16,color:'var(--green)'}}>✦</span>
              <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--green)'}}>AI Improve</div>
            </div>
            <p style={{fontSize:'0.78rem',color:'var(--text3)',marginBottom:10,lineHeight:1.5}}>Describe changes — AI updates instantly.</p>
            <textarea value={aiFeedback} onChange={e=>setAiFeedback(e.target.value)} placeholder="e.g. Add 5% late fee, change GST to 12%..." rows={3} style={{marginBottom:9,fontSize:'0.82rem'}}/>
            <button className="btn btn-primary" onClick={handleAiImprove} disabled={aiLoading} style={{width:'100%',justifyContent:'center',fontSize:'0.82rem'}}>
              {aiLoading?<><span className="spinner"/>Improving…</>:'✦ Apply Changes'}
            </button>
          </div>

          {/* Actions */}
          <div className="card" style={{padding:18}}>
            <div className="section-label">Quick Actions</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:10}}>
              <button className="btn btn-secondary" onClick={()=>setShowTemplate(true)} style={{justifyContent:'center',fontSize:'0.85rem'}}>
                🎨 Choose Template & Download
              </button>
              <button className="btn btn-ghost" onClick={()=>{navigator.clipboard.writeText(`${doc.documentNumber} | ₹${(doc.total||0).toLocaleString('en-IN')}`);toast.success('Copied!')}} style={{justifyContent:'center',fontSize:'0.82rem'}}>
                ⎘ Copy Summary
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="card" style={{padding:18}}>
            <div className="section-label">Info</div>
            {[
              {label:'AI Generated',value:doc.aiGenerated?'✦ Yes':'No',green:doc.aiGenerated},
              {label:'Currency',value:doc.currency||'INR'},
              {label:'Items',value:doc.lineItems?.length||0},
              {label:'Created',value:new Date(doc.createdAt).toLocaleDateString('en-IN')},
            ].map(row=>(
              <div key={row.label} style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:7,paddingBottom:7,borderBottom:'1px solid var(--border)'}}>
                <span style={{color:'var(--text3)'}}>{row.label}</span>
                <span style={{color:row.green?'var(--green)':'var(--text)',fontWeight:600}}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
