import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [companyName, setCompanyName] = useState(user?.businessInfo?.companyName || '')
  const [address, setAddress] = useState(user?.businessInfo?.address || '')
  const [phone, setPhone] = useState(user?.businessInfo?.phone || '')
  const [email, setEmail] = useState(user?.businessInfo?.email || '')
  const [taxId, setTaxId] = useState(user?.businessInfo?.taxId || '')
  const [currency, setCurrency] = useState(user?.businessInfo?.currency || 'INR')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/auth/profile', {
        businessInfo: { companyName, address, phone, email, taxId, currency }
      })
      toast.success('Business profile saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handlePassword = async () => {
    if (!currentPw || !newPw) return toast.error('Fill all fields')
    if (newPw !== confirmPw) return toast.error('Passwords do not match')
    if (newPw.length < 6) return toast.error('Min 6 characters')
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw })
      toast.success('Password changed!')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setPwLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    background: '#ffffff',
    color: '#111827',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: 5,
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#374151'
  }

  return (
      <div style={{ padding: '28px 32px', maxWidth: 680, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>Settings</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage your account and business information</p>
        </div>

        {/* Account */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Account</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{user?.name}</div>
                <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{user?.email}</div>
                <div style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{user?.plan || 'free'} plan</div>
              </div>
            </div>
            {showLogout ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: '#374151' }}>Sign out?</span>
                  <button onClick={handleLogout}
                          style={{ padding: '7px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                    Yes
                  </button>
                  <button onClick={() => setShowLogout(false)}
                          style={{ padding: '7px 14px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem' }}>
                    Cancel
                  </button>
                </div>
            ) : (
                <button onClick={() => setShowLogout(true)}
                        style={{ padding: '8px 18px', background: '#fff', color: '#374151', border: '1.5px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                  Sign Out
                </button>
            )}
          </div>
        </div>

        {/* Business Profile */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Business Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Company / Business Name</label>
              <input style={inputStyle} type="text" placeholder="e.g. Karthikeya Tech Solutions"
                     value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input style={inputStyle} type="tel" placeholder="+91 9999999999"
                     value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Business Email</label>
              <input style={inputStyle} type="email" placeholder="business@email.com"
                     value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>GST / Tax ID (optional)</label>
              <input style={inputStyle} type="text" placeholder="27AAPFU0939F1ZV"
                     value={taxId} onChange={e => setTaxId(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Business Address</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} placeholder="City, State, PIN"
                      value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Default Currency</label>
            <select style={{ ...inputStyle, width: 'auto', paddingRight: 32 }}
                    value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="GBP">£ GBP — British Pound</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={saving}
                  style={{ padding: '10px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Business Info'}
          </button>
        </div>

        {/* Change Password */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Change Password</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <input style={inputStyle} type="password" placeholder="Enter current password"
                     value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input style={inputStyle} type="password" placeholder="Min 6 characters"
                     value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input style={inputStyle} type="password" placeholder="Repeat new password"
                     value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
            <button onClick={handlePassword} disabled={pwLoading}
                    style={{ padding: '10px 24px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, alignSelf: 'flex-start', opacity: pwLoading ? 0.7 : 1 }}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Usage */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Usage & Plan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'AI Generations', value: user?.usageCount || 0, color: '#2563eb' },
              { label: 'Current Plan', value: user?.plan || 'Free', color: '#16a34a' },
              { label: 'Monthly Limit', value: user?.plan === 'free' ? '20' : '∞', color: '#7c3aed' },
            ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '14px 12px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
                </div>
            ))}
          </div>
          {user?.plan === 'free' && (
              <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: '0.85rem', color: '#15803d' }}>
                Upgrade to <strong>Pro</strong> for unlimited AI generations and custom branding.
              </div>
          )}
        </div>
      </div>
  )
}