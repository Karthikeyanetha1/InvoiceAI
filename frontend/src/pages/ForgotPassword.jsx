import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #020817 0%, #0f172a 50%, #020817 100%)',
        padding: 24, position: 'relative', overflow: 'hidden'
      }}>
        {/* Background orbs */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{ position:'absolute', width:300, height:300, background:'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)', top:'-5%', left:'-5%', animation:'float 6s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', width:200, height:200, background:'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', bottom:'10%', right:'10%', animation:'float 8s ease-in-out infinite reverse' }}/>
        </div>

        <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .3s ease', position:'relative', zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:32 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#fff', fontWeight:800 }}>₹</div>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, color:'#fff' }}>InvoiceAI</span>
          </div>

          <div style={{ background:'rgba(15,23,42,0.85)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:32, backdropFilter:'blur(20px)' }}>
            {sent ? (
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:52, marginBottom:16 }}>📬</div>
                  <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.4rem', fontWeight:800, color:'#fff', marginBottom:10 }}>Check your email!</h2>
                  <p style={{ color:'#64748b', fontSize:'0.875rem', lineHeight:1.7, marginBottom:24 }}>
                    We sent a password reset link to<br/>
                    <strong style={{ color:'#4ade80' }}>{email}</strong>
                  </p>
                  <div style={{ background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:10, padding:'12px 16px', marginBottom:24, fontSize:'0.82rem', color:'#94a3b8', lineHeight:1.6 }}>
                    💡 Check your <strong style={{ color:'#e2e8f0' }}>inbox and spam folder</strong>.<br/>
                    The link expires in <strong style={{ color:'#e2e8f0' }}>1 hour</strong>.
                  </div>
                  <Link to="/login" style={{ display:'block', textAlign:'center', background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', padding:'12px 24px', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:'0.9rem', boxShadow:'0 4px 14px rgba(22,163,74,0.4)' }}>
                    ← Back to Login
                  </Link>
                  <button onClick={() => { setSent(false); setEmail('') }}
                          style={{ display:'block', width:'100%', marginTop:10, background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:'0.82rem' }}>
                    Try a different email
                  </button>
                </div>
            ) : (
                <>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#fff', marginBottom:6, fontFamily:'Syne,sans-serif' }}>Reset Password</h2>
                  <p style={{ color:'#64748b', fontSize:'0.875rem', marginBottom:24 }}>Enter your email and we'll send a reset link.</p>

                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom:20 }}>
                      <label style={{ color:'#94a3b8', marginBottom:6, display:'block', fontSize:'0.8rem', fontWeight:500 }}>Email Address</label>
                      <input
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          style={{ background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:10, padding:'12px 14px', fontSize:'0.9rem', width:'100%', outline:'none' }}
                          onFocus={e => e.target.style.borderColor = '#4ade80'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                    <button type="submit" disabled={loading}
                            style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background: loading ? '#1e293b' : 'linear-gradient(135deg,#16a34a,#15803d)', color: loading ? '#64748b' : '#fff', fontSize:'0.95rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s', boxShadow: loading ? 'none' : '0 4px 14px rgba(22,163,74,0.4)' }}>
                      {loading ? (
                          <><span className="spinner"/>Sending link…</>
                      ) : (
                          'Send Reset Link'
                      )}
                    </button>
                  </form>

                  <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'20px 0' }}/>
                  <Link to="/login" style={{ display:'block', textAlign:'center', color:'#64748b', textDecoration:'none', fontSize:'0.875rem' }}>
                    Remember it? <span style={{ color:'#4ade80', fontWeight:600 }}>Sign in</span>
                  </Link>
                </>
            )}
          </div>
        </div>
      </div>
  )
}