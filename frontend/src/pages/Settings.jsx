import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'
export default function Settings() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    companyName:user?.businessInfo?.companyName||'',
    address:user?.businessInfo?.address||'',
    phone:user?.businessInfo?.phone||'',
    email:user?.businessInfo?.email||'',
    taxId:user?.businessInfo?.taxId||'',
    currency:user?.businessInfo?.currency||'INR'
  })
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({current:'',newPw:'',confirm:''})
  const [pwLoading, setPwLoading] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await api.put('/auth/business-info', form); await refreshUser(); toast.success('Business info saved! ✓') }
    catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }
  const handleChangePw = async (e) => {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPw.length < 6) return toast.error('Min 6 characters')
    setPwLoading(true)
    try { await api.put('/auth/change-password', {currentPassword:pwForm.current,newPassword:pwForm.newPw}); toast.success('Password changed!'); setPwForm({current:'',newPw:'',confirm:''}) }
    catch (err) { toast.error(err.response?.data?.error || 'Password change failed') }
    finally { setPwLoading(false) }
  }
  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login') }

  const S = ({title,children}) => (
    <div className="card" style={{marginBottom:18}}>
      <div style={{fontSize:11,fontWeight:700,color:'var(--text3)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:18,paddingBottom:12,borderBottom:'2px solid var(--bg3)'}}>{title}</div>
      {children}
    </div>
  )
  return (
    <div style={{padding:'28px 32px',maxWidth:680,animation:'fadeIn .3s ease'}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Settings</h1>
        <p style={{color:'var(--text3)',fontSize:14}}>Manage your account and business profile.</p>
      </div>
      <S title="Account">
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#16a34a,#22c55e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,color:'#fff',boxShadow:'0 4px 14px rgba(22,163,74,0.3)',flexShrink:0}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:16,color:'var(--text)'}}>{user?.name}</div>
            <div style={{fontSize:13,color:'var(--text3)',marginTop:2}}>{user?.email}</div>
            <span style={{fontSize:11,fontWeight:700,background:'var(--accent-light)',color:'var(--accent)',padding:'3px 12px',borderRadius:20,textTransform:'uppercase',letterSpacing:0.5,marginTop:6,display:'inline-block'}}>{user?.plan||'free'} plan</span>
          </div>
          <button className="btn btn-ghost" onClick={()=>setShowLogout(true)} style={{color:'var(--danger)',borderColor:'#fca5a5',fontSize:13}}>Sign Out</button>
        </div>
        {showLogout&&(
          <div style={{marginTop:14,padding:'14px 16px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <span style={{fontSize:13,color:'var(--danger)',fontWeight:500}}>Are you sure you want to sign out?</span>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-ghost" onClick={()=>setShowLogout(false)} style={{padding:'6px 14px',fontSize:12}}>Cancel</button>
              <button onClick={handleLogout} style={{background:'var(--danger)',color:'#fff',border:'none',padding:'7px 16px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Yes, Sign Out</button>
            </div>
          </div>
        )}
      </S>
      <S title="Business Profile">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[{k:'companyName',l:'Company / Business Name',p:'e.g. Mukul Aqua Services',t:'text'},{k:'address',l:'Business Address',p:'City, State, PIN',m:true},{k:'phone',l:'Phone Number',p:'+91 XXXXXXXXXX',t:'tel'},{k:'email',l:'Business Email',p:'business@email.com',t:'email'},{k:'taxId',l:'GST / Tax ID (optional)',p:'27AAPFU0939F1ZV',t:'text'}].map(f=>(
            <div key={f.k}>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:6}}>{f.l}</label>
              {f.m?<textarea value={form[f.k]} onChange={e=>setForm(fm=>({...fm,[f.k]:e.target.value}))} placeholder={f.p} rows={2}/>:<input type={f.t||'text'} value={form[f.k]} onChange={e=>setForm(fm=>({...fm,[f.k]:e.target.value}))} placeholder={f.p}/>}
            </div>
          ))}
          <div>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:6}}>Default Currency</label>
            <select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))} style={{maxWidth:220}}>
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="GBP">£ GBP — British Pound</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{marginTop:18}}>
          {saving?<><span className="spinner"/>Saving...</>:'✓ Save Business Info'}
        </button>
      </S>
      <S title="Change Password">
        <form onSubmit={handleChangePw}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {[{k:'current',l:'Current Password',p:'Enter current password'},{k:'newPw',l:'New Password',p:'Min 6 characters'},{k:'confirm',l:'Confirm New Password',p:'Repeat new password'}].map(f=>(
              <div key={f.k}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:6}}>{f.l}</label>
                <input type="password" placeholder={f.p} value={pwForm[f.k]} onChange={e=>setPwForm(p=>({...p,[f.k]:e.target.value}))}/>
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-secondary" disabled={pwLoading} style={{marginTop:18}}>
            {pwLoading?<><span className="spinner-dark"/>Updating...</>:'🔒 Update Password'}
          </button>
        </form>
      </S>
      <S title="Usage & Plan">
        <div style={{display:'flex',gap:32,marginBottom:16}}>
          <div><div style={{fontSize:32,fontWeight:800,fontFamily:'Syne,sans-serif',color:'var(--accent)'}}>{user?.usageCount??0}</div><div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>AI Generations Used</div></div>
          <div><div style={{fontSize:32,fontWeight:800,fontFamily:'Syne,sans-serif',color:'var(--text)'}}>{user?.plan==='free'?'20':'∞'}</div><div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>Monthly Limit</div></div>
        </div>
        {user?.plan==='free'&&<div style={{padding:'14px 18px',background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',border:'1px solid #86efac',borderRadius:12,fontSize:13,color:'#15803d'}}>✦ Upgrade to <strong>Pro</strong> for unlimited AI generations and custom branding.</div>}
      </S>
    </div>
  )
}
