import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Admin() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tab, setTab] = useState('overview')

    useEffect(() => {
        if (user && user.role !== 'admin') {
            toast.error('Admin access required')
            navigate('/dashboard')
            return
        }
        Promise.all([api.get('/admin/stats'), api.get('/admin/users')])
            .then(([s, u]) => { setStats(s.data); setUsers(u.data.users) })
            .catch(() => toast.error('Failed to load'))
            .finally(() => setLoading(false))
    }, [user])

    const handleRoleChange = async (userId, role) => {
        try {
            await api.put('/admin/users/' + userId, { role })
            setUsers(u => u.map(usr => usr._id === userId ? {...usr, role} : usr))
            toast.success('Role updated!')
        } catch { toast.error('Update failed') }
    }

    const handleDelete = async (userId, name) => {
        if (!confirm('Delete user ' + name + '?')) return
        try {
            await api.delete('/admin/users/' + userId)
            setUsers(u => u.filter(usr => usr._id !== userId))
            toast.success('Deleted')
        } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    }

    const cur = n => '₹' + (n||0).toLocaleString('en-IN')
    const filtered = users.filter(u => !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()))

    if (loading) return (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
            <div className="spinner-dark" style={{width:32,height:32}}/>
        </div>
    )

    return (
        <div style={{padding:'22px 28px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
                <div>
                    <h1 style={{marginBottom:3}}>Admin Panel</h1>
                    <p style={{color:'var(--text3)',fontSize:'0.82rem'}}>Platform management</p>
                </div>
                <span style={{background:'#fee2e2',color:'#b91c1c',padding:'4px 14px',borderRadius:20,fontSize:'0.75rem',fontWeight:700}}>🔒 Admin Only</span>
            </div>

            <div style={{display:'flex',gap:6,marginBottom:22,borderBottom:'1px solid var(--border)'}}>
                {['overview','users'].map(t=>(
                    <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 18px',background:'none',border:'none',cursor:'pointer',fontSize:'0.875rem',fontWeight:tab===t?600:400,color:tab===t?'var(--green)':'var(--text3)',borderBottom:tab===t?'2px solid var(--green)':'2px solid transparent',marginBottom:-1,transition:'all .15s',textTransform:'capitalize'}}>{t}</button>
                ))}
            </div>

            {tab==='overview' && stats && (
                <>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
                        {[
                            {label:'Total Users',value:stats.totalUsers||0,color:'var(--blue)'},
                            {label:'Total Documents',value:stats.totalDocs||0,color:'var(--green)'},
                            {label:'Paid Invoices',value:stats.paidDocs||0,color:'var(--green)'},
                            {label:'Total Revenue',value:cur(stats.totalRevenue),color:'#7c3aed'},
                        ].map((s,i)=>(
                            <div key={i} className="card" style={{padding:'14px 16px',borderTop:'2.5px solid '+s.color}}>
                                <div style={{fontSize:'0.65rem',fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:8}}>{s.label}</div>
                                <div style={{fontSize:'1.3rem',fontWeight:800,color:s.color}}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{padding:0,overflow:'hidden'}}>
                        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
                            <h2 style={{fontSize:'0.9rem'}}>Recent Signups</h2>
                        </div>
                        {(stats.recentUsers||[]).map((u,i)=>(
                            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:'1px solid var(--border)'}}>
                                <div style={{width:34,height:34,borderRadius:'50%',background:'var(--green)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700}}>{u.name?.[0]?.toUpperCase()}</div>
                                <div style={{flex:1}}>
                                    <div style={{fontSize:'0.85rem',fontWeight:600,color:'var(--text)'}}>{u.name}</div>
                                    <div style={{fontSize:'0.72rem',color:'var(--text3)'}}>{u.email}</div>
                                </div>
                                <span style={{fontSize:'0.7rem',fontWeight:600,padding:'2px 8px',borderRadius:20,background:u.role==='admin'?'#fee2e2':'var(--green-light)',color:u.role==='admin'?'#b91c1c':'var(--green)'}}>{u.role}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {tab==='users' && (
                <>
                    <input placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:300,marginBottom:14}}/>
                    <div className="card" style={{padding:0,overflow:'hidden'}}>
                        <table className="table">
                            <thead><tr><th>User</th><th>Role</th><th>Plan</th><th>Joined</th><th>Actions</th></tr></thead>
                            <tbody>
                            {filtered.map(u=>(
                                <tr key={u._id}>
                                    <td>
                                        <div style={{fontWeight:600,fontSize:'0.85rem'}}>{u.name}</div>
                                        <div style={{fontSize:'0.72rem',color:'var(--text3)'}}>{u.email}</div>
                                    </td>
                                    <td>
                                        <select value={u.role} onChange={e=>handleRoleChange(u._id,e.target.value)} style={{width:'auto',padding:'4px 8px',fontSize:'0.78rem'}}>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{textTransform:'capitalize',fontSize:'0.82rem'}}>{u.plan}</td>
                                    <td style={{color:'var(--text3)',fontSize:'0.78rem'}}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        <button onClick={()=>handleDelete(u._id,u.name)} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:'0.78rem',fontWeight:600}}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}