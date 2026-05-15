import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try { await register(form.name, form.email, form.password); toast.success('Account created! 🎉'); navigate('/dashboard') }
    catch (err) { toast.error(err.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)',padding:24}}>
      <div style={{width:'100%',maxWidth:430}}>
        <div style={{textAlign:'center',marginBottom:24,animation:'fadeIn .5s ease'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:6}}>
            <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#16a34a,#22c55e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'#fff',fontWeight:700,boxShadow:'0 4px 16px rgba(22,163,74,0.3)'}}>₹</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,letterSpacing:-0.5}}>
              <span style={{color:'#16a34a'}}>Invoice</span><span style={{color:'#0f172a'}}>AI</span>
            </div>
          </div>
          <p style={{color:'#6b7280',fontSize:13}}>Create your free account</p>
        </div>
        <div style={{background:'#fff',borderRadius:20,padding:32,boxShadow:'0 8px 40px rgba(22,163,74,0.12)',border:'1px solid #bbf7d0',animation:'fadeIn .5s ease .1s both'}}>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:800,marginBottom:20,color:'#0f172a'}}>Get Started Free</h2>
          <form onSubmit={handleSubmit}>
            {[{key:'name',label:'Full Name',type:'text',ph:'Your full name'},{key:'email',label:'Email Address',type:'email',ph:'your@email.com'},{key:'password',label:'Password',type:'password',ph:'Min 6 characters'}].map((f,i)=>(
              <div key={f.key} style={{marginBottom:16,animation:`fadeIn .4s ease ${i*0.08}s both`}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:6}}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(fm=>({...fm,[f.key]:e.target.value}))} required/>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px',fontSize:15,marginTop:4}} disabled={loading}>
              {loading?<><span className="spinner"/>Creating account...</>:'Create Account →'}
            </button>
          </form>
          <p style={{textAlign:'center',marginTop:18,fontSize:13,color:'#6b7280'}}>
            Already have an account? <Link to="/login" style={{color:'#16a34a',textDecoration:'none',fontWeight:700}}>Sign in</Link>
          </p>
        </div>
        <p style={{textAlign:'center',marginTop:14,fontSize:11,color:'#9ca3af'}}>🔒 Your data is safe and encrypted</p>
      </div>
    </div>
  )
}
