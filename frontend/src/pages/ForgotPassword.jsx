import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await api.post('/auth/forgot-password', { email }); setSent(true); toast.success('Reset email sent!') }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to send reset email') }
    finally { setLoading(false) }
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)',padding:24}}>
      <div style={{width:'100%',maxWidth:420,animation:'fadeIn .5s ease'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:6}}>
            <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#16a34a,#22c55e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'#fff',fontWeight:700}}>₹</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,letterSpacing:-0.5}}>
              <span style={{color:'#16a34a'}}>Invoice</span><span style={{color:'#0f172a'}}>AI</span>
            </div>
          </div>
        </div>
        <div style={{background:'#fff',borderRadius:20,padding:36,boxShadow:'0 8px 40px rgba(22,163,74,0.12)',border:'1px solid #bbf7d0'}}>
          {sent?(
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:52,marginBottom:16}}>📬</div>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,marginBottom:10,color:'#0f172a'}}>Check your email</h2>
              <p style={{color:'#6b7280',fontSize:14,lineHeight:1.6,marginBottom:24}}>We sent a reset link to <strong style={{color:'#16a34a'}}>{email}</strong>.<br/>Check inbox and spam folder.</p>
              <Link to="/login" className="btn btn-primary" style={{display:'inline-flex',justifyContent:'center'}}>← Back to Sign In</Link>
            </div>
          ):(
            <>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,marginBottom:6,color:'#0f172a'}}>Reset Password</h2>
              <p style={{color:'#6b7280',fontSize:13,marginBottom:24}}>Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit}>
                <div style={{marginBottom:20}}>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:6}}>Email Address</label>
                  <input type="email" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)} required/>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px',fontSize:15}} disabled={loading}>
                  {loading?<><span className="spinner"/>Sending...</>:'Send Reset Link'}
                </button>
              </form>
              <p style={{textAlign:'center',marginTop:18,fontSize:13,color:'#6b7280'}}>
                Remember it? <Link to="/login" style={{color:'#16a34a',textDecoration:'none',fontWeight:700}}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
