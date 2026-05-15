import { useState } from 'react'

const TEMPLATES = [
  { id:'modern',  label:'Modern',  desc:'Green accent, clean cards', preview:'🟢', bg:'#f0fdf4', border:'#16a34a' },
  { id:'classic', label:'Classic', desc:'Navy blue, traditional serif', preview:'🔵', bg:'#eff6ff', border:'#1e3a5f' },
  { id:'minimal', label:'Minimal', desc:'Ultra clean, borderless', preview:'⬜', bg:'#f8fafc', border:'#94a3b8' },
  { id:'bold',    label:'Bold',    desc:'Dark theme, high contrast', preview:'⚫', bg:'#0f172a', border:'#22c55e' },
]

export default function TemplatePicker({ selected, onSelect, onClose, onConfirm }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden', animation:'fadeUp .25s ease' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontSize:'1rem' }}>Choose PDF Template</h2>
            <p style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:2 }}>Select a design for your document</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, color:'var(--text3)', cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onSelect(t.id)}
              style={{ padding:16, borderRadius:12, border:`2px solid ${selected===t.id?t.border:'var(--border)'}`, background:selected===t.id?t.bg:'var(--surface)', cursor:'pointer', textAlign:'left', transition:'all .15s', outline:'none' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{t.preview}</div>
              <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text)', marginBottom:3 }}>{t.label}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text3)', lineHeight:1.4 }}>{t.desc}</div>
              {selected===t.id && <div style={{ marginTop:8, fontSize:'0.7rem', fontWeight:700, color:t.border }}>✓ Selected</div>}
            </button>
          ))}
        </div>
        <div style={{ padding:'0 20px 20px', display:'flex', gap:10 }}>
          <button onClick={onConfirm} className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>
            ↓ Download with {TEMPLATES.find(t=>t.id===selected)?.label} Template
          </button>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  )
}
