import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function GoogleCallback() {
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const err = params.get('error')
        if (err || !code) { setError('Google sign-in was cancelled.'); return }
        api.post('/auth/google/callback', { code })
            .then(res => {
                localStorage.setItem('invoiceai_token', res.data.token)
                localStorage.setItem('invoiceai_user', JSON.stringify(res.data.user))
                window.location.href = '/dashboard'
            })
            .catch(err => setError(err.response?.data?.error || 'Google sign-in failed'))
    }, [])

    return (
        <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
            <div style={{textAlign:'center',padding:32}}>
                {error ? (
                    <>
                        <div style={{fontSize:48,marginBottom:16}}>❌</div>
                        <p style={{color:'var(--red)',marginBottom:20}}>{error}</p>
                        <button className="btn btn-primary" onClick={()=>navigate('/login')}>← Back to Login</button>
                    </>
                ) : (
                    <>
                        <div className="spinner-dark" style={{width:40,height:40,margin:'0 auto 16px'}}/>
                        <p style={{color:'var(--text2)'}}>Signing you in with Google...</p>
                    </>
                )}
            </div>
        </div>
    )
}