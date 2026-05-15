import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
const NAV=[{to:'/dashboard',icon:'▤',label:'Dashboard'},{to:'/generate',icon:'+',label:'Generate'},{to:'/documents',icon:'≡',label:'Documents'},{to:'/clients',icon:'👥',label:'Clients'},{to:'/settings',icon:'◎',label:'Settings'}]
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <aside style={{width:210,background:'#fff',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0,position:'sticky',top:0,height:'100vh'}}>
        <div style={{padding:'16px 14px 12px',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div style={{width:30,height:30,borderRadius:8,background:'var(--green)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#fff',fontWeight:700,flexShrink:0}}>₹</div>
            <div><div style={{fontFamily:'var(--font-display)',fontSize:14,fontWeight:800,color:'var(--text)',letterSpacing:'-0.03em',lineHeight:1.1}}>InvoiceAI</div><div style={{fontSize:'0.65rem',color:'var(--text3)',fontWeight:500,marginTop:1}}>by CodeWithK</div></div>
          </div>
        </div>
        <nav style={{padding:'10px 8px',flex:1}}>
          <div style={{fontSize:'0.62rem',fontWeight:700,color:'var(--text3)',letterSpacing:'0.08em',textTransform:'uppercase',padding:'0 6px',marginBottom:6}}>Main Menu</div>
          {NAV.map(item=>(
            <NavLink key={item.to} to={item.to} style={({isActive})=>({display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:'var(--radius-sm)',textDecoration:'none',fontSize:'0.85rem',fontWeight:isActive?600:500,color:isActive?'var(--green)':'var(--text2)',background:isActive?'var(--green-light)':'transparent',marginBottom:1,transition:'all .12s',borderLeft:isActive?'2.5px solid var(--green)':'2.5px solid transparent'})}>
              <span style={{fontSize:13}}>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{padding:'10px 12px',borderTop:'1px solid var(--border)',background:'var(--bg3)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'var(--green)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{user?.name?.[0]?.toUpperCase()||'U'}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'0.78rem',fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
              <div style={{fontSize:'0.68rem',color:'var(--green)',fontWeight:500}}>{user?.plan||'free'} plan</div>
            </div>
            <button onClick={()=>{logout();navigate('/login')}} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:14,padding:'2px 4px',borderRadius:5,transition:'color .15s',lineHeight:1}}
              onMouseEnter={e=>e.target.style.color='var(--red)'} onMouseLeave={e=>e.target.style.color='var(--text3)'}>→</button>
          </div>
        </div>
      </aside>
      <main style={{flex:1,overflow:'auto',minHeight:'100vh'}}><Outlet/></main>
    </div>
  )
}
