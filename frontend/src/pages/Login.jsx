import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch (err) { toast.error(err.response?.data?.error || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const res = await api.get('/auth/google/url')
      window.location.href = res.data.url
    } catch (err) {
      toast.error('Google sign-in not configured yet')
      setGoogleLoading(false)
    }
  }

  return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #020817 0%, #0f172a 50%, #020817 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)',
            top: '-10%', left: '-10%',
            animation: 'float 6s ease-in-out infinite'
          }}/>
          <div style={{
            position: 'absolute', width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
            bottom: '-5%', right: '-5%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}/>
          <div style={{
            position: 'absolute', width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
            top: '50%', right: '20%',
            animation: 'float 7s ease-in-out infinite'
          }}/>
        </div>

        {/* Left panel - branding */}
        <div style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            display: window.innerWidth < 900 ? 'none' : 'flex'
        }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: '#fff', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(22,163,74,0.4)'
              }}>₹</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff' }}>InvoiceAI</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>
              Invoice smarter,<br/>
              <span style={{ background: 'linear-gradient(135deg, #4ade80, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              grow faster
            </span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, maxWidth: 400 }}>
              AI-powered invoicing for Indian businesses. Generate professional invoices in seconds.
            </p>
          </div>

          {/* Feature list */}
          {[
            { icon: '⚡', text: 'Generate invoices in under 10 seconds' },
            { icon: '🤖', text: 'AI extracts all details automatically' },
            { icon: '📊', text: 'Real-time revenue dashboard' },
            { icon: '🇮🇳', text: 'GST compliant for Indian businesses' },
          ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>{f.icon}</div>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{f.text}</span>
              </div>
          ))}
        </div>

        {/* Right panel - form */}
        <div style={{
          width: '100%', maxWidth: 480,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '40px 48px',
          background: 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          animation: 'fadeUp 0.4s ease'
        }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#fff', fontWeight: 700
            }}>₹</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: '#fff' }}>InvoiceAI</span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 28 }}>Sign in to your account</p>

          {/* Google button */}
          <button onClick={handleGoogle} disabled={googleLoading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, padding: '12px', marginBottom: 20,
                    background: '#fff', border: 'none', borderRadius: 10,
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#374151',
                    transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}>
            {googleLoading ? <span className="spinner-dark"/> : (
                <svg width="20" height="20" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
            )}
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8', marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 500 }}>Email address</label>
              <input type="email" placeholder="you@company.com" value={form.email}
                     onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                     style={{
                       background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
                       color: '#fff', borderRadius: 10, padding: '12px 14px', fontSize: '0.9rem'
                     }}
                     onFocus={e => e.target.style.borderColor = '#4ade80'}
                     onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}/>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#94a3b8', marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 500 }}>Password</label>
              <input type="password" placeholder="Enter your password" value={form.password}
                     onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                     style={{
                       background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
                       color: '#fff', borderRadius: 10, padding: '12px 14px', fontSize: '0.9rem'
                     }}
                     onFocus={e => e.target.style.borderColor = '#4ade80'}
                     onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#4ade80', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading}
                    style={{
                      width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                      boxShadow: '0 4px 14px rgba(22,163,74,0.4)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.5)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.4)' }}>
              {loading ? <><span className="spinner"/>Signing in…</> : 'Sign in →'}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }}/>
          <Link to="/register"
                style={{
                  display: 'block', width: '100%', padding: '12px', textAlign: 'center',
                  borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8' }}>
            Create a free account
          </Link>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.72rem', color: '#334155' }}>
            🔒 256-bit encrypted · GST compliant · by CodeWithK
          </p>
        </div>
      </div>
  )
}