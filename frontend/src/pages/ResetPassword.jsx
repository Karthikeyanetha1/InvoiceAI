import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [token, setToken] = useState('')
    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const t = params.get('token')
        const e = params.get('email')
        if (!t || !e) {
            toast.error('Invalid reset link')
            navigate('/login')
        }
        setToken(t)
        setEmail(e)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirm) return toast.error('Passwords do not match')
        if (password.length < 6) return toast.error('Min 6 characters')
        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, email, newPassword: password })
            setDone(true)
            toast.success('Password reset successfully!')
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Reset failed')
        } finally { setLoading(false) }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#020817', padding: 24
        }}>
            <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp .3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 800 }}>₹</div>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#fff' }}>InvoiceAI</span>
                </div>

                {done ? (
                    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                        <h2 style={{ color: '#fff', marginBottom: 8, fontFamily: 'Syne,sans-serif' }}>Password Reset!</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 20 }}>Redirecting to login in 3 seconds...</p>
                        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                            Go to Login →
                        </Link>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32, backdropFilter: 'blur(20px)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 6, fontFamily: 'Syne,sans-serif' }}>Set New Password</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24 }}>Enter your new password below</p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ color: '#94a3b8', marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 500 }}>New Password</label>
                                <input type="password" placeholder="Min 6 characters" value={password}
                                       onChange={e => setPassword(e.target.value)} required
                                       style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px 14px', fontSize: '0.9rem', width: '100%' }}
                                       onFocus={e => e.target.style.borderColor = '#4ade80'}
                                       onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}/>
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ color: '#94a3b8', marginBottom: 6, display: 'block', fontSize: '0.8rem', fontWeight: 500 }}>Confirm Password</label>
                                <input type="password" placeholder="Repeat new password" value={confirm}
                                       onChange={e => setConfirm(e.target.value)} required
                                       style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px 14px', fontSize: '0.9rem', width: '100%' }}
                                       onFocus={e => e.target.style.borderColor = '#4ade80'}
                                       onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}/>
                            </div>
                            <button type="submit" disabled={loading}
                                    style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,163,74,0.4)' }}>
                                {loading ? <><span className="spinner"/>Resetting…</> : 'Reset Password →'}
                            </button>
                        </form>

                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }}/>
                        <Link to="/login" style={{ display: 'block', textAlign: 'center', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>
                            ← Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}