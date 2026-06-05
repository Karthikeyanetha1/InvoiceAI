import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDarkMode } from '../hooks/useDarkMode'

const NAV = [
    { to:'/dashboard', icon:'⊞', label:'Dashboard' },
    { to:'/generate',  icon:'✦', label:'Generate'  },
    { to:'/documents', icon:'≡', label:'Documents' },
    { to:'/clients',   icon:'👥',label:'Clients'   },
    { to:'/settings',  icon:'⚙', label:'Settings'  },
]

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { dark, toggle } = useDarkMode()
    const [open, setOpen] = useState(false)
    const [mobile, setMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const fn = () => setMobile(window.innerWidth < 768)
        window.addEventListener('resize', fn)
        return () => window.removeEventListener('resize', fn)
    }, [])

    useEffect(() => { setOpen(false) }, [location.pathname])

    return (
        <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>

            {/* Backdrop */}
            {mobile && open && (
                <div onClick={() => setOpen(false)}
                     style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40, backdropFilter:'blur(4px)' }}/>
            )}

            {/* Sidebar */}
            <aside style={{
                width: 220,
                background: dark ? '#080f1e' : '#ffffff',
                borderRight: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`,
                display: 'flex', flexDirection: 'column', flexShrink: 0,
                position: mobile ? 'fixed' : 'sticky',
                top: 0, left: mobile ? (open ? 0 : -230) : 0,
                height: '100vh', zIndex: 50,
                transition: 'left .28s cubic-bezier(.4,0,.2,1)',
                boxShadow: mobile && open ? '4px 0 32px rgba(0,0,0,0.3)' : 'none',
            }}>

                {/* Logo */}
                <div style={{ padding:'20px 18px 16px', borderBottom:`1px solid ${dark?'#1e293b':'#e2e8f0'}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                            width:34, height:34, borderRadius:10,
                            background:'linear-gradient(135deg,#16a34a,#15803d)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:16, color:'#fff', fontWeight:800,
                            boxShadow:'0 4px 12px rgba(22,163,74,0.35)'
                        }}>₹</div>
                        <div>
                            <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1.1 }}>InvoiceAI</div>
                            <div style={{ fontSize:'0.6rem', color:'var(--text3)', fontWeight:500, letterSpacing:'0.02em' }}>by CodeWithK</div>
                        </div>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                        <button onClick={toggle}
                                style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, padding:'4px 6px', borderRadius:7, color:'var(--text3)', transition:'all .15s' }}
                                title={dark ? 'Light mode' : 'Dark mode'}>
                            {dark ? '☀️' : '🌙'}
                        </button>
                        {mobile && (
                            <button onClick={() => setOpen(false)}
                                    style={{ background:'none', border:'none', fontSize:18, color:'var(--text3)', cursor:'pointer', padding:'4px 6px' }}>×</button>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding:'12px 10px', flex:1 }}>
                    <div style={{ fontSize:'0.58rem', fontWeight:700, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0 8px', marginBottom:8 }}>
                        Main Menu
                    </div>
                    {NAV.map(item => (
                        <NavLink key={item.to} to={item.to}
                                 style={({ isActive }) => ({
                                     display:'flex', alignItems:'center', gap:10,
                                     padding:'10px 12px', borderRadius:10,
                                     textDecoration:'none', fontSize:'0.875rem',
                                     fontWeight: isActive ? 600 : 400,
                                     color: isActive ? (dark ? '#4ade80' : '#16a34a') : 'var(--text2)',
                                     background: isActive ? (dark ? 'rgba(74,222,128,0.1)' : '#dcfce7') : 'transparent',
                                     marginBottom:3, transition:'all .15s',
                                     borderLeft: isActive ? `3px solid ${dark?'#4ade80':'#16a34a'}` : '3px solid transparent',
                                 })}>
                            <span style={{ fontSize:15, width:18, textAlign:'center' }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div style={{
                    padding:'12px 14px',
                    borderTop:`1px solid ${dark?'#1e293b':'#e2e8f0'}`,
                    background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                            width:32, height:32, borderRadius:'50%',
                            background:'linear-gradient(135deg,#16a34a,#2563eb)',
                            color:'#fff', display:'flex', alignItems:'center',
                            justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0
                        }}>
                            {user?.name?.[0]?.toUpperCase()||'U'}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                            <div style={{ fontSize:'0.62rem', color:dark?'#4ade80':'#16a34a', fontWeight:600, textTransform:'capitalize' }}>{user?.plan||'free'} plan</div>
                        </div>
                        <button onClick={() => { logout(); navigate('/login') }}
                                style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16, padding:'3px 5px', borderRadius:6, transition:'all .15s' }}
                                onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                                onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
                                title="Sign out">→</button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

                {/* Mobile topbar */}
                {mobile && (
                    <div style={{
                        background: dark ? '#080f1e' : '#ffffff',
                        borderBottom:`1px solid ${dark?'#1e293b':'#e2e8f0'}`,
                        padding:'10px 16px', display:'flex', alignItems:'center',
                        justifyContent:'space-between', position:'sticky', top:0, zIndex:30,
                        boxShadow: dark ? '0 1px 8px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                        <button onClick={() => setOpen(true)}
                                style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', flexDirection:'column', gap:4 }}>
                            <div style={{ width:22, height:2.5, background:'var(--text)', borderRadius:2 }}/>
                            <div style={{ width:16, height:2.5, background:'var(--text)', borderRadius:2 }}/>
                            <div style={{ width:22, height:2.5, background:'var(--text)', borderRadius:2 }}/>
                        </button>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#fff', fontWeight:800 }}>₹</div>
                            <span style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:800, color:'var(--text)' }}>InvoiceAI</span>
                        </div>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                            <button onClick={toggle} style={{ background:'var(--bg2)', border:`1px solid ${dark?'#1e293b':'#e2e8f0'}`, borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:13 }}>
                                {dark?'☀️':'🌙'}
                            </button>
                            <NavLink to="/generate" style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', borderRadius:8, padding:'7px 14px', textDecoration:'none', fontSize:'0.78rem', fontWeight:700, boxShadow:'0 2px 8px rgba(22,163,74,0.3)' }}>
                                + New
                            </NavLink>
                        </div>
                    </div>
                )}

                <main style={{ flex:1, overflow:'auto', paddingBottom:mobile?64:0 }}>
                    <Outlet/>
                </main>

                {/* Mobile bottom nav */}
                {mobile && (
                    <nav style={{
                        position:'fixed', bottom:0, left:0, right:0,
                        background: dark ? '#080f1e' : '#ffffff',
                        borderTop:`1px solid ${dark?'#1e293b':'#e2e8f0'}`,
                        display:'flex', zIndex:30,
                        boxShadow: dark ? '0 -4px 20px rgba(0,0,0,0.4)' : '0 -2px 12px rgba(0,0,0,0.08)'
                    }}>
                        {NAV.map(item => (
                            <NavLink key={item.to} to={item.to}
                                     style={({ isActive }) => ({
                                         flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                                         justifyContent:'center', padding:'8px 4px', textDecoration:'none',
                                         color: isActive ? (dark?'#4ade80':'#16a34a') : 'var(--text3)',
                                         background: isActive ? (dark?'rgba(74,222,128,0.08)':'#dcfce7') : 'transparent',
                                         fontSize:'0.58rem', fontWeight:isActive?700:500, gap:3, transition:'all .15s',
                                         borderTop: isActive ? `2px solid ${dark?'#4ade80':'#16a34a'}` : '2px solid transparent'
                                     })}>
                                <span style={{ fontSize:16 }}>{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                )}
            </div>
        </div>
    )
}