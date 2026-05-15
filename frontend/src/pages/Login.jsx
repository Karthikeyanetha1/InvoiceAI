import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch (err) { toast.error(err.response?.data?.error || 'Invalid credentials') }
    finally { setLoading(false) }
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}>
      <div style={{width:'100%',maxWidth:380,animation:'fadeUp .3s ease'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:28}}>
          <div style={{width:32,height:32,borderRadius:9,background:'var(--green)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:'#fff',fontWeight:700,boxShadow:'var(--shadow-green)'}}>₹</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:17,fontWeight:800,color:'var(--text)',letterSpacing:'-0.03em'}}>InvoiceAI</div>
        </div>
        <h1 style={{marginBottom:4,fontSize:'1.4rem'}}>Welcome back</h1>
        <p style={{color:'var(--text3)',fontSize:'0.85rem',marginBottom:24}}>Sign in to your account</p>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:22,boxShadow:'var(--shadow-sm)'}}>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',marginBottom:5}}>Email address</label>
              <input type="email" placeholder="you@company.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required autoComplete="email"/>
            </div>
            <div style={{marginBottom:8}}>
              <label style={{display:'block',marginBottom:5}}>Password</label>
              <input type="password" placeholder="Enter your password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:18}}>
              <Link to="/forgot-password" style={{fontSize:'0.78rem',color:'var(--green)',textDecoration:'none',fontWeight:500}}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'10px',fontSize:'0.875rem'}}>
              {loading?<><span className="spinner"/>Signing in…</>:'Sign in'}
            </button>
          </form>
          <div style={{height:1,background:'var(--border)',margin:'18px 0'}}/>
          <Link to="/register" className="btn btn-secondary" style={{width:'100%',justifyContent:'center',padding:'10px',fontSize:'0.875rem'}}>Create a free account</Link>
        </div>
        <p style={{textAlign:'center',marginTop:18,fontSize:'0.72rem',color:'var(--text3)'}}>🔒 256-bit encrypted · GST compliant · by CodeWithK</p>
      </div>
    </div>
  )
}
