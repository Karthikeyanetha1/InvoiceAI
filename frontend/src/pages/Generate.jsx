import { useState, useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const DOC_TYPES = [
  { value:'invoice',        label:'Invoice',        emoji:'🧾', color:'#4ade80', desc:'Standard GST invoice' },
  { value:'quotation',      label:'Quotation',      emoji:'📋', color:'#60a5fa', desc:'Price estimate' },
  { value:'receipt',        label:'Receipt',        emoji:'✅', color:'#fbbf24', desc:'Payment receipt' },
  { value:'purchase_order', label:'Purchase Order', emoji:'📦', color:'#a78bfa', desc:'Order document' },
  { value:'custom_form',    label:'Custom Form',    emoji:'📝', color:'#f87171', desc:'Any custom form' },
]

const EXAMPLES = [
  "Create an invoice for React dashboard development for Rahul Sharma at TechCorp Hyderabad, 40 hours at ₹1500/hr, due in 30 days",
  "Generate a quotation for interior design services for Mr. Ramesh, 3BHK apartment, total ₹5,66,400",
  "Invoice for 3 months SEO and social media management for StarUp Digital Mumbai, ₹25,000/month retainer",
]

const FORM_EXAMPLES = [
  "Create a client registration form with personal details, service selection, document upload and signature area",
  "Generate a project onboarding form with client info, requirements, budget and timeline",
]

const StableTextarea = memo(({ value, onChange, placeholder }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={5}
              style={{ resize:'vertical', lineHeight:1.7, fontSize:'0.9rem', width:'100%',
                background:'var(--bg2)', border:'1.5px solid var(--border)', borderRadius:10,
                padding:'14px 16px', color:'var(--text)', fontFamily:'Inter,sans-serif',
                transition:'border-color .15s, box-shadow .15s', outline:'none' }}
              onFocus={e => { e.target.style.borderColor='#4ade80'; e.target.style.boxShadow='0 0 0 3px rgba(74,222,128,0.1)' }}
              onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }}
    />
))

export default function Generate() {
  const [searchParams] = useSearchParams()
  const [docType, setDocType] = useState(searchParams.get('type') || 'invoice')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const navigate = useNavigate()

  const handlePromptChange = useCallback(e => setPrompt(e.target.value), [])

  const handleTypeChange = useCallback(type => {
    setDocType(type); setResult(null); setPrompt('')
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error('Please describe your document')
    setLoading(true); setResult(null)
    try {
      const res = await api.post('/generate/ai', { prompt, docType })
      setResult(res.data.document)
      toast.success('Document generated! ✦')
    } catch (err) { toast.error(err.response?.data?.error || 'Generation failed') }
    finally { setLoading(false) }
  }

  const handleOpenPdf = async () => {
    if (!result?._id) return
    setPdfLoading(true)
    try {
      const token = localStorage.getItem('invoiceai_token')
      const tmpl = result.type === 'custom_form' ? 'custom_form' : 'modern'
      const res = await fetch(`/api/generate/pdf/${result._id}?template=${tmpl}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed')
      const html = await res.text()
      const win = window.open('', '_blank')
      win.document.title = `${result.documentNumber}-${result.clientInfo?.name||'document'}`
      win.document.write(html); win.document.close()
      toast.success('PDF opened!')
    } catch { toast.error('PDF failed') }
    finally { setPdfLoading(false) }
  }

  const isForm = docType === 'custom_form'
  const cur = n => '₹' + (n||0).toLocaleString('en-IN', { minimumFractionDigits:2 })
  const activeType = DOC_TYPES.find(t => t.value === docType)

  return (
      <div style={{ padding:'28px 32px', minHeight:'100vh' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ marginBottom:4, fontFamily:'Syne,sans-serif' }}>Generate Document</h1>
          <p style={{ color:'var(--text3)', fontSize:'0.875rem' }}>Describe what you need — AI does the rest in seconds</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:result?'1fr 380px':'1fr', gap:24, alignItems:'start' }}>
          <div>
            {/* Doc type selector */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:20 }}>
              {DOC_TYPES.map(dt => (
                  <button key={dt.value} onClick={() => handleTypeChange(dt.value)}
                          style={{
                            padding:'12px 8px', borderRadius:12, cursor:'pointer',
                            border:`1.5px solid ${docType===dt.value ? dt.color : 'var(--border)'}`,
                            background: docType===dt.value ? `${dt.color}12` : 'var(--surface)',
                            transition:'all .18s', outline:'none', textAlign:'center'
                          }}
                          onMouseEnter={e => { if(docType!==dt.value){ e.currentTarget.style.borderColor=dt.color; e.currentTarget.style.background=`${dt.color}08` }}}
                          onMouseLeave={e => { if(docType!==dt.value){ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)' }}}>
                    <div style={{ fontSize:22, marginBottom:5 }}>{dt.emoji}</div>
                    <div style={{ fontSize:'0.72rem', fontWeight:600, color:docType===dt.value?dt.color:'var(--text2)' }}>{dt.label}</div>
                    <div style={{ fontSize:'0.62rem', color:'var(--text3)', marginTop:2 }}>{dt.desc}</div>
                  </button>
              ))}
            </div>

            {/* Custom form banner */}
            {isForm && (
                <div style={{ padding:'12px 16px', background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:10, marginBottom:16, fontSize:'0.82rem', color:'#60a5fa', display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:18 }}>📝</span>
                  <span><strong>Form Mode</strong> — AI generates form sections with input fields, checkboxes, upload areas and signature blocks</span>
                </div>
            )}

            {/* Prompt box */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, fontSize:'0.78rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                <span style={{ color:activeType?.color }}>✦</span>
                {isForm ? 'Describe your form' : 'Describe your document'}
              </label>
              <StableTextarea value={prompt} onChange={handlePromptChange}
                              placeholder={isForm
                                  ? "e.g. Create a client registration form with personal details, service selection, document upload and signature area for Karthikeya Tech Solutions..."
                                  : "e.g. Create an invoice for website design for Raj Enterprises Mumbai, ₹45,000 total, due in 15 days..."
                              }
              />
              <div style={{ fontSize:'0.7rem', color:'var(--text3)', marginTop:6, display:'flex', justifyContent:'space-between' }}>
                <span>Be specific — include client name, amount, dates for best results</span>
                <span>Ctrl+Enter</span>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading}
                    style={{
                      width:'100%', padding:'14px', borderRadius:12, border:'none',
                      background: loading ? 'var(--bg2)' : `linear-gradient(135deg, ${activeType?.color||'#4ade80'}, ${activeType?.color||'#4ade80'}cc)`,
                      color: loading ? 'var(--text3)' : '#000',
                      fontSize:'0.95rem', fontWeight:700, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      gap:8, transition:'all .2s', marginBottom:24,
                      boxShadow: loading ? 'none' : `0 4px 16px ${activeType?.color||'#4ade80'}40`
                    }}>
              {loading ? <><span className="spinner-dark"/>AI is generating…</> : `✦ Generate ${isForm?'Form':'Document'}`}
            </button>

            {/* Examples */}
            <div>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>
                Try an example
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(isForm ? FORM_EXAMPLES : EXAMPLES).map((ex, i) => (
                    <button key={i} onClick={() => setPrompt(ex)}
                            style={{
                              background:'var(--surface)', border:'1px solid var(--border)',
                              borderRadius:10, padding:'11px 14px', textAlign:'left',
                              color:'var(--text2)', fontSize:'0.82rem', cursor:'pointer',
                              lineHeight:1.5, transition:'all .15s', outline:'none'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor=activeType?.color||'#4ade80'; e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.color='var(--text)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.color='var(--text2)' }}>
                      {ex.length > 110 ? ex.slice(0, 110) + '…' : ex}
                    </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result panel */}
          {result && (
              <div style={{ animation:'fadeUp 0.3s ease' }}>
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
                  {/* Result header */}
                  <div style={{ background:`linear-gradient(135deg, ${activeType?.color||'#4ade80'}20, ${activeType?.color||'#4ade80'}08)`, padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontSize:'0.68rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>✦ Generated</div>
                        <div style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text)', fontFamily:'Syne,sans-serif' }}>{result.documentNumber}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--text3)', marginTop:2 }}>{result.title}</div>
                      </div>
                      <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(251,191,36,0.15)', color:'#fbbf24', textTransform:'uppercase' }}>
                    {result.status}
                  </span>
                    </div>
                  </div>

                  {/* Client */}
                  {!isForm && result.clientInfo?.name && (
                      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Bill To</div>
                        <div style={{ fontWeight:700, color:'var(--text)', fontSize:'0.9rem' }}>{result.clientInfo.name}</div>
                        {result.clientInfo.company && <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginTop:2 }}>{result.clientInfo.company}</div>}
                      </div>
                  )}

                  {/* Items */}
                  {!isForm && (
                      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Line Items</div>
                        {result.lineItems?.map((item, i) => (
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', marginBottom:6 }}>
                              <div>
                                <div style={{ fontWeight:500, color:'var(--text)' }}>{item.description}</div>
                                <div style={{ color:'var(--text3)', fontSize:'0.72rem' }}>Qty {item.quantity} × ₹{item.rate?.toLocaleString('en-IN')}</div>
                              </div>
                              <div style={{ fontWeight:700, color:activeType?.color||'#4ade80', flexShrink:0, marginLeft:8 }}>{cur(item.amount)}</div>
                            </div>
                        ))}
                      </div>
                  )}

                  {/* Form sections */}
                  {isForm && (
                      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Form Sections</div>
                        {result.lineItems?.map((item, i) => (
                            <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)', alignItems:'flex-start' }}>
                              <div style={{ width:24, height:24, borderRadius:6, background:'rgba(96,165,250,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>📋</div>
                              <div style={{ fontSize:'0.8rem', color:'var(--text)', lineHeight:1.4 }}>{item.description}</div>
                            </div>
                        ))}
                      </div>
                  )}

                  {/* Totals */}
                  {!isForm && (
                      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                        {[
                          { label:'Subtotal', value:cur(result.subtotal) },
                          { label:`GST (${result.taxRate}%)`, value:cur(result.taxAmount) }
                        ].map(r => (
                            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'var(--text2)', marginBottom:5 }}>
                              <span>{r.label}</span><span>{r.value}</span>
                            </div>
                        ))}
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'1.1rem', fontWeight:900, paddingTop:8, borderTop:'1.5px solid var(--border)', marginTop:6, fontFamily:'Syne,sans-serif' }}>
                          <span style={{ color:'var(--text)' }}>Total</span>
                          <span style={{ color:activeType?.color||'#4ade80' }}>{cur(result.total)}</span>
                        </div>
                      </div>
                  )}

                  {/* Notes */}
                  {result.notes && (
                      <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', fontSize:'0.78rem', color:'var(--text3)', lineHeight:1.5 }}>
                        <strong style={{ color:'var(--text2)' }}>Note: </strong>{result.notes}
                      </div>
                  )}

                  {/* Actions */}
                  <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:8 }}>
                    <button onClick={handleOpenPdf} disabled={pdfLoading} className="btn btn-primary"
                            style={{ justifyContent:'center', fontSize:'0.875rem' }}>
                      {pdfLoading ? <><span className="spinner"/>Loading…</> : '↓ Download PDF'}
                    </button>
                    <button onClick={() => navigate('/documents/' + result._id)} className="btn btn-secondary"
                            style={{ justifyContent:'center', fontSize:'0.875rem' }}>
                      View & Edit Document →
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  )
}