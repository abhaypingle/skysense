import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'

const AVATAR_COLORS = [
  ['#0ea5e9', '#818cf8'], // sky-purple
  ['#f59e0b', '#ef4444'], // amber-red
  ['#10b981', '#0ea5e9'], // green-sky
  ['#818cf8', '#ec4899'], // purple-pink
  ['#2dd4bf', '#0ea5e9'], // teal-sky
  ['#f97316', '#f59e0b'], // orange-amber
]

export default function SettingsPage({ auth }) {
  const nav = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [displayName, setDisplayName] = useState(auth.user?.user_metadata?.display_name || '')
  const [avatarIdx, setAvatarIdx]     = useState(auth.user?.user_metadata?.avatar_idx ?? 0)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg]   = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPw, setSavingPw]       = useState(false)
  const [pwMsg, setPwMsg]             = useState('')
  const [pwErr, setPwErr]             = useState('')

  async function saveProfile() {
    setSavingProfile(true); setProfileMsg('')
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName, avatar_idx: avatarIdx }
    })
    setSavingProfile(false)
    setProfileMsg(error ? error.message : 'Profile updated ✓')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  async function changePassword() {
    setPwErr(''); setPwMsg('')
    if (newPassword.length < 6) { setPwErr('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setPwErr('Passwords do not match'); return }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPw(false)
    if (error) { setPwErr(error.message); return }
    setPwMsg('Password updated ✓')
    setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setPwMsg(''), 3000)
  }

  async function handleSignOut() {
    await signOut()
    nav('/')
  }

  const initial = (displayName || auth.user?.email || 'U')[0].toUpperCase()
  const [c1, c2] = AVATAR_COLORS[avatarIdx] || AVATAR_COLORS[0]

  return (
    <div style={{paddingBottom:'2rem',maxWidth:'520px'}} className="fade-in">
      <h2 style={{fontSize:'19px',fontWeight:600,marginBottom:'1.25rem'}}>Settings</h2>

      {/* Profile card */}
      <div className="glass-card" style={{padding:'1.5rem',borderRadius:'var(--r-xl)',marginBottom:'1rem'}}>
        <div className="section-label" style={{margin:'0 0 1rem'}}>Profile</div>

        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'1.5rem'}}>
          <div style={{
            width:'64px',height:'64px',borderRadius:'50%',
            background:`linear-gradient(135deg,${c1},${c2})`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'26px',fontWeight:700,color:'#fff',flexShrink:0,
            boxShadow:`0 4px 16px ${c1}55`,transition:'background 0.3s'
          }}>
            {initial}
          </div>
          <div>
            <div style={{fontSize:'15px',fontWeight:600}}>{displayName || 'Weather watcher'}</div>
            <div style={{fontSize:'12px',color:'var(--text3)'}}>{auth.user?.email}</div>
          </div>
        </div>

        {/* Avatar color picker */}
        <div style={{marginBottom:'1.25rem'}}>
          <label style={{fontSize:'12px',color:'var(--text2)',marginBottom:'8px',display:'block'}}>Avatar color</label>
          <div style={{display:'flex',gap:'8px'}}>
            {AVATAR_COLORS.map(([a,b], i) => (
              <button key={i} onClick={() => setAvatarIdx(i)} style={{
                width:'32px',height:'32px',borderRadius:'50%',
                background:`linear-gradient(135deg,${a},${b})`,
                border: avatarIdx === i ? '2.5px solid var(--text1)' : '2.5px solid transparent',
                cursor:'pointer',transition:'transform 0.15s, border-color 0.15s',
                transform: avatarIdx === i ? 'scale(1.1)' : 'scale(1)'
              }} />
            ))}
          </div>
        </div>

        {/* Display name */}
        <div style={{marginBottom:'1rem'}}>
          <label style={{fontSize:'12px',color:'var(--text2)',marginBottom:'6px',display:'block'}}>Display name</label>
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)}
            placeholder="Enter your name" maxLength={30} />
        </div>

        {profileMsg && (
          <div style={{
            fontSize:'12px',marginBottom:'10px',
            color: profileMsg.includes('✓') ? 'var(--green)' : 'var(--danger)'
          }}>{profileMsg}</div>
        )}

        <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>
          {savingProfile ? <><div className="spinner" /> Saving...</> : 'Save profile'}
        </button>
      </div>

      {/* Password card */}
      <div className="glass-card" style={{padding:'1.5rem',borderRadius:'var(--r-xl)',marginBottom:'1rem'}}>
        <div className="section-label" style={{margin:'0 0 1rem'}}>Change password</div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <input className="input" type="password" placeholder="New password"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <input className="input" type="password" placeholder="Confirm new password"
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && changePassword()} />
          {pwErr && <div style={{fontSize:'12px',color:'var(--danger)'}}>{pwErr}</div>}
          {pwMsg && <div style={{fontSize:'12px',color:'var(--green)'}}>{pwMsg}</div>}
          <button className="btn btn-ghost" onClick={changePassword} disabled={savingPw} style={{alignSelf:'flex-start'}}>
            {savingPw ? <><div className="spinner" /> Updating...</> : 'Update password'}
          </button>
        </div>
      </div>

      {/* Preferences card */}
      <div className="glass-card" style={{padding:'1.5rem',borderRadius:'var(--r-xl)',marginBottom:'1rem'}}>
        <div className="section-label" style={{margin:'0 0 1rem'}}>Preferences</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:'13px',fontWeight:500}}>Appearance</div>
            <div style={{fontSize:'11px',color:'var(--text3)'}}>Switch between dark and light theme</div>
          </div>
          <button className="btn btn-ghost" onClick={toggleTheme} style={{fontSize:'12px'}}>
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>

      {/* Account card */}
      <div className="glass-card" style={{padding:'1.5rem',borderRadius:'var(--r-xl)',marginBottom:'1rem'}}>
        <div className="section-label" style={{margin:'0 0 1rem'}}>Account</div>
        {[
          ['Weather data', 'Open-Meteo'],
          ['AI engine', 'Claude (Anthropic)'],
          ['Version', '1.0.0']
        ].map(([k,v]) => (
          <div key={k} style={{
            display:'flex',justifyContent:'space-between',padding:'7px 0',
            borderBottom:'0.5px solid var(--glass-border)',fontSize:'13px'
          }}>
            <span style={{color:'var(--text2)'}}>{k}</span>
            <span style={{color:'var(--text3)'}}>{v}</span>
          </div>
        ))}
        <button className="btn" onClick={handleSignOut} style={{
          marginTop:'1rem',color:'var(--danger)',border:'0.5px solid rgba(239,68,68,.3)',
          background:'rgba(239,68,68,.08)',fontSize:'13px'
        }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
