import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const DOC_TYPES = [
  { value:'invoice',        label:'Invoice',     emoji:'🧾' },
  { value:'quotation',      label:'Quotation',   emoji:'📋' },
  { value:'receipt',        label:'Receipt',     emoji:'✅' },
  { value:'purchase_order', label:'Purchase Order', emoji:'📦' },
  { value:'custom_form',    label:'Custom Form', emoji:'📝' },
]

const EXAMPLES = {
  invoice: [
    "Invoice for React dashboard built for Rahul Sharma at TechCorp Hyderabad, 40 hours at ₹1500/hr, due in 30 days",
    "Invoice for 3 months SEO and social media management for StarUp Digital Mumbai, ₹25,000/month retainer",
  ],
  quotation: [
    "Quotation for catering services for 200 people corporate event on June 15, buffet lunch and evening snacks",
    "Quotation for interior design of 2BHK flat in Bangalore — modular kitchen, wardrobes, living room",
  ],
  receipt: [
    "Receipt for payment received from Suresh Reddy for website design project, ₹45,000 full payment",
    "Receipt for advance payment of ₹25,000 from Green Valley Farms for accounting services",
  ],
  purchase_order: [
    "Purchase order for 50 office chairs and 20 desks from Furniture World Hyderabad for new office setup",
    "Purchase order for computer equipment: 10 laptops, 5 printers from TechMart Bangalore",
  ],
  custom_form: [
    "Create a client registration form with personal details, service selection, document upload and signature sections for Karthikeya Tech Solutions",
    "Project onboarding form with client info, requirements, budget, timeline and agreement section",
    "Employee joining form with personal info, education, experience, documents upload and declaration",
  ]
}

// ── CRITICAL FIX: Stable textarea that NEVER remounts ──
// Defined OUTSIDE component so reference never changes → no keyboard close on mobile
const StableTextarea = memo(function StableTextarea({ value, onChange, placeholder }) {
  const ref = useRef(null)
  return (
    <textarea
      ref={ref}
      defaultValue=""
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={6}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      style={{
        resize: 'vertical',
        lineHeight: 1.7,
        fontSize: '0.9rem',
        width: '100%',
        fontFamily: 'inherit',
        WebkitUserSelect: 'text',
        userSelect: 'text',
      }}
    />
  )
})

// ── Interactive Form Builder Preview ──
function InteractiveFormPreview({ formData, docId }) {
  const [formValues, setFormValues] = useState({})
  const [pdfLoading, setPdfLoading] = useState(false)

  const updateField = useCallback((key, val) => {
    setFormValues(prev => ({ ...prev, [key]: val }))
  }, [])

  const handlePdf = async () => {
    setPdfLoading(true)
    try {
      const token = localStorage.getItem('invoiceai_token')
      const res = await fetch(`/api/generate/pdf/${docId}?template=custom_form`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const html = await res.text()
      const win = window.open('', '_blank')
      win.document.title = formData.documentNumber
      win.document.write(html)
      win.document.close()
      toast.success('Form PDF opened!')
    } catch { toast.error('PDF failed') }
    finally { setPdfLoading(false) }
  }

  const sections = formData.lineItems || []

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {/* Form header */}
      <div style={{ background: '#1e3a5f', padding: '16px 20px' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Interactive Form Preview</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{formData.title}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{formData.documentNumber}</div>
      </div>

      <div style={{ padding: '16px 18px', maxHeight: 480, overflowY: 'auto' }}>
        {sections.map((section, si) => {
          const desc = section.description.toLowerCase()
          const title = section.description.split('—')[0].split(':').slice(0, 1).join('').trim()

          return (
            <div key={si} style={{ marginBottom: 18 }}>
              <div style={{ background: '#1e3a5f', color: '#fff', padding: '7px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', borderRadius: '6px 6px 0 0' }}>
                {title}
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '12px 14px' }}>
                {/* Personal / Contact fields */}
                {(desc.includes('personal') || desc.includes('detail') || desc.includes('contact')) && (
                  <>
                    <FormField label="Full Name" type="text" fieldKey={`${si}-name`} value={formValues} onChange={updateField} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <FormField label="Phone" type="tel" fieldKey={`${si}-phone`} value={formValues} onChange={updateField} />
                      <FormField label="Email" type="email" fieldKey={`${si}-email`} value={formValues} onChange={updateField} />
                    </div>
                    <FormField label="Address" type="textarea" fieldKey={`${si}-address`} value={formValues} onChange={updateField} />
                  </>
                )}
                {/* Service / Project fields */}
                {(desc.includes('service') || desc.includes('project') || desc.includes('requirement')) && (
                  <>
                    <FormField label="Service Type" type="select" fieldKey={`${si}-service`} value={formValues} onChange={updateField}
                      options={['Web Development', 'Mobile App', 'UI/UX Design', 'Digital Marketing', 'Other']} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <FormField label="Budget (₹)" type="number" fieldKey={`${si}-budget`} value={formValues} onChange={updateField} />
                      <FormField label="Timeline" type="text" fieldKey={`${si}-timeline`} value={formValues} onChange={updateField} />
                    </div>
                    <FormField label="Project Description" type="textarea" fieldKey={`${si}-desc`} value={formValues} onChange={updateField} />
                  </>
                )}
                {/* Upload fields */}
                {(desc.includes('upload') || desc.includes('document') || desc.includes('proof')) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <UploadField label="Government ID" />
                    <UploadField label="Supporting Doc" />
                  </div>
                )}
                {/* Agreement / Signature */}
                {(desc.includes('declaration') || desc.includes('agreement') || desc.includes('signature')) && (
                  <>
                    <CheckboxField label="I agree to the Terms and Conditions" fieldKey={`${si}-terms`} value={formValues} onChange={updateField} />
                    <CheckboxField label="All information provided is accurate" fieldKey={`${si}-accurate`} value={formValues} onChange={updateField} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                      <SignatureField label="Customer Signature" />
                      <SignatureField label="Authorized Signature" />
                    </div>
                  </>
                )}
                {/* Generic fallback */}
                {!desc.includes('personal') && !desc.includes('service') && !desc.includes('upload') && !desc.includes('declaration') && !desc.includes('detail') && !desc.includes('contact') && !desc.includes('project') && !desc.includes('agreement') && (
                  <FormField label="Details" type="textarea" fieldKey={`${si}-generic`} value={formValues} onChange={updateField} />
                )}
              </div>
            </div>
          )
        })}

        {formData.notes && (
          <div style={{ background: '#eff6ff', borderLeft: '3px solid #1e3a5f', padding: '8px 12px', fontSize: 11, color: '#374151', borderRadius: '0 6px 6px 0', marginBottom: 12, lineHeight: 1.6 }}>
            <strong>Instructions:</strong> {formData.notes}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <button onClick={handlePdf} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }} disabled={pdfLoading}>
          {pdfLoading ? <><span className="spinner" />Loading...</> : '↓ Print / Save as PDF'}
        </button>
      </div>
    </div>
  )
}

function FormField({ label, type, fieldKey, value, onChange, options }) {
  const val = value[fieldKey] || ''
  const inputStyle = {
    width: '100%', padding: '7px 10px', borderRadius: 6,
    border: '1.5px solid #d1d5db', fontSize: 12, outline: 'none',
    fontFamily: 'inherit', marginBottom: 0, background: '#fff', color: '#111827',
    transition: 'border-color .15s'
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
      {type === 'textarea' ? (
        <textarea value={val} onChange={e => onChange(fieldKey, e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 52 }} placeholder={`Enter ${label}...`} />
      ) : type === 'select' ? (
        <select value={val} onChange={e => onChange(fieldKey, e.target.value)} style={inputStyle}>
          <option value="">Select {label}...</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={val} onChange={e => onChange(fieldKey, e.target.value)}
          style={inputStyle} placeholder={`Enter ${label}...`} />
      )}
    </div>
  )
}

function UploadField({ label }) {
  const [file, setFile] = useState(null)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{label}</div>
      <label style={{ display: 'block', border: '2px dashed #9ca3af', borderRadius: 8, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', background: file ? '#f0fdf4' : '#fafafa', transition: 'all .15s' }}>
        <input type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
        <div style={{ fontSize: 18, marginBottom: 4 }}>📎</div>
        <div style={{ fontSize: 11, color: file ? '#16a34a' : '#9ca3af', fontWeight: file ? 600 : 400 }}>
          {file ? `✓ ${file.name.slice(0, 20)}...` : 'Tap to upload'}
        </div>
      </label>
    </div>
  )
}

function CheckboxField({ label, fieldKey, value, onChange }) {
  const checked = value[fieldKey] || false
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8, cursor: 'pointer' }}>
      <div onClick={() => onChange(fieldKey, !checked)}
        style={{ width: 16, height: 16, border: '2px solid #1e3a5f', borderRadius: 3, flexShrink: 0, marginTop: 1, background: checked ? '#1e3a5f' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
        {checked && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{label}</span>
    </label>
  )
}

function SignatureField({ label }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [lastPos, setLastPos] = useState(null)
  const [hasSig, setHasSig] = useState(false)

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] || e
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }

  const startDraw = useCallback((e) => {
    e.preventDefault()
    setDrawing(true)
    const pos = getPos(e, canvasRef.current)
    setLastPos(pos)
  }, [])

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!drawing || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e, canvasRef.current)
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1e3a5f'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    setLastPos(pos)
    setHasSig(true)
  }, [drawing, lastPos])

  const stopDraw = useCallback(() => setDrawing(false), [])

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, 160, 52)
    setHasSig(false)
  }

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{label}</div>
      <div style={{ border: '1.5px solid #d1d5db', borderRadius: 6, overflow: 'hidden', background: '#fafafa', position: 'relative' }}>
        <canvas ref={canvasRef} width={160} height={52} style={{ display: 'block', width: '100%', height: 52, cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
        {!hasSig && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af', pointerEvents: 'none' }}>Draw signature here</div>}
      </div>
      {hasSig && <button onClick={clear} style={{ fontSize: 10, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: 3, padding: 0 }}>✕ Clear</button>}
    </div>
  )
}

// ── Invoice Result Preview ──
function InvoicePreview({ result, navigate }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [template, setTemplate] = useState('modern')

  const TEMPLATES = [
    { id: 'modern',       label: 'Modern',       icon: '🟢' },
    { id: 'canva',        label: 'Canva',        icon: '⬛' },
    { id: 'professional', label: 'Professional', icon: '🔵' },
    { id: 'elegant',      label: 'Elegant',      icon: '⬜' },
  ]

  const handlePdf = async (tmpl) => {
    setPdfLoading(true)
    setShowTemplatePicker(false)
    try {
      const token = localStorage.getItem('invoiceai_token')
      const t = tmpl || template
      const res = await fetch(`/api/generate/pdf/${result._id}?template=${t}`, { headers: { Authorization: `Bearer ${token}` } })
      const html = await res.text()
      const name = `${result.documentNumber}-${(result.clientInfo?.name||'doc').replace(/\s+/g, '-')}`
      const win = window.open('', '_blank')
      win.document.title = name
      win.document.write(html)
      win.document.close()
      toast.success(`${TEMPLATES.find(t=>t.id===tmpl)?.label||'PDF'} opened! Print → Save as PDF`)
    } catch { toast.error('PDF failed') }
    finally { setPdfLoading(false) }
  }

  const cur = n => `₹${(n||0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {showTemplatePicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTemplatePicker(false) }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <div><h2 style={{ fontSize: '0.95rem' }}>Choose PDF Template</h2><p style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>4 designs available</p></div>
              <button onClick={() => setShowTemplatePicker(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text3)', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 16 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => { setTemplate(t.id); handlePdf(t.id) }}
                  style={{ padding: '12px', borderRadius: 10, border: `2px solid ${template===t.id?'var(--green)':'var(--border)'}`, background: template===t.id?'var(--green-light)':'var(--surface)', cursor: 'pointer', textAlign: 'center', outline: 'none' }}>
                  <div style={{ fontSize: 24, marginBottom: 5 }}>{t.icon}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{t.label}</div>
                </button>
              ))}
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              <button onClick={() => setShowTemplatePicker(false)} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)', padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Generated</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{result.documentNumber}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>{result.title}</div>
            </div>
            <span className={`badge badge-${result.status}`}>{result.status}</span>
          </div>
        </div>
        <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Bill To</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{result.clientInfo?.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{result.clientInfo?.company}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 1 }}>{result.clientInfo?.address}</div>
        </div>
        <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Items</div>
          {result.lineItems?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
              <div><div style={{ fontWeight: 500, color: 'var(--text)' }}>{item.description}</div><div style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>Qty {item.quantity} × {cur(item.rate)}</div></div>
              <div style={{ fontWeight: 700, color: 'var(--green)' }}>{cur(item.amount)}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
          {[{ l: 'Subtotal', v: cur(result.subtotal) }, { l: `GST (${result.taxRate}%)`, v: cur(result.taxAmount) }].map(r => (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 4 }}><span>{r.l}</span><span>{r.v}</span></div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, marginTop: 6, paddingTop: 6, borderTop: '2px solid var(--border)' }}>
            <span>Total</span><span style={{ color: 'var(--green)' }}>{cur(result.total)}</span>
          </div>
        </div>
        <div style={{ padding: '11px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setShowTemplatePicker(true)} className="btn btn-primary" style={{ justifyContent: 'center', fontSize: '0.85rem' }} disabled={pdfLoading}>
            {pdfLoading ? <><span className="spinner" />Loading...</> : <> ↓ Download PDF <span style={{ fontSize: 10, opacity: 0.8, background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>4 styles</span></>}
          </button>
          <button onClick={() => navigate(`/documents/${result._id}`)} className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
            View & Edit Document →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Generate() {
  const [searchParams] = useSearchParams()
  const [docType, setDocType] = useState(searchParams.get('type') || 'invoice')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()
  const promptRef = useRef('')

  const isForm = docType === 'custom_form'

  // ── MOBILE FIX: Keep prompt in ref to avoid stale closures ──
  const handlePromptChange = useCallback((e) => {
    promptRef.current = e.target.value
    setPrompt(e.target.value)
  }, [])

  const handleTypeChange = useCallback((type) => {
    setDocType(type)
    setResult(null)
    setPrompt('')
    promptRef.current = ''
  }, [])

  const handleGenerate = async () => {
    const p = promptRef.current || prompt
    if (!p.trim()) return toast.error('Please describe what you need')
    setLoading(true); setResult(null)
    try {
      const res = await api.post('/generate/ai', { prompt: p, docType })
      setResult(res.data.document)
      toast.success(isForm ? '📝 Form generated!' : '✦ Document generated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed')
    } finally { setLoading(false) }
  }

  const examples = EXAMPLES[docType] || EXAMPLES.invoice

  return (
    <div style={{ padding: '20px 22px', maxWidth: 980, animation: 'fadeUp .25s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 2 }}>Generate Document</h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>Describe what you need — AI does the rest.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Left: Input */}
        <div>
          {/* Type selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {DOC_TYPES.map(dt => (
              <button key={dt.value} onClick={() => handleTypeChange(dt.value)} style={{
                padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                border: docType===dt.value ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                background: docType===dt.value ? 'var(--green-light)' : 'var(--surface)',
                color: docType===dt.value ? 'var(--green)' : 'var(--text2)', transition: 'all .15s'
              }}>{dt.emoji} {dt.label}</button>
            ))}
          </div>

          {isForm && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 13px', marginBottom: 12, fontSize: '0.8rem', color: '#1d4ed8', lineHeight: 1.6 }}>
              📝 <strong>Form Builder Mode</strong> — AI generates an interactive form with input fields, dropdowns, file uploads, checkboxes and signature pads.
            </div>
          )}

          {/* STABLE textarea — mobile keyboard fix */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', marginBottom: 5, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              {isForm ? 'Describe your form' : 'Describe your document'}
            </label>
            <StableTextarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder={isForm
                ? "e.g. Create a client registration form with personal details, service selection, document uploads and signature area for Karthikeya Tech Solutions"
                : "e.g. Create an invoice for website design for Raj Enterprises Mumbai, ₹45,000 total, due in 15 days."
              }
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: 3 }}>Ctrl+Enter to generate</div>
          </div>

          <button onClick={handleGenerate} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '0.9rem', marginBottom: 16 }}
            disabled={loading}>
            {loading ? <><span className="spinner" />Generating...</> : `✦ ${isForm ? 'Build Form' : 'Generate with AI'}`}
          </button>

          {/* Examples */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Try an example</div>
            {examples.map((ex, i) => (
              <button key={i} onClick={() => { setPrompt(ex); promptRef.current = ex }} style={{
                display: 'block', width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', textAlign: 'left', color: 'var(--text2)',
                fontSize: '0.78rem', cursor: 'pointer', lineHeight: 1.5, transition: 'all .15s', marginBottom: 7
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-light)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}>
                {ex.length > 100 ? ex.slice(0, 100) + '…' : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Preview */}
        {result && (
          isForm
            ? <InteractiveFormPreview formData={result} docId={result._id} />
            : <InvoicePreview result={result} navigate={navigate} />
        )}
      </div>
    </div>
  )
}
