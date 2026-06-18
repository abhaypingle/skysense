import { signOut } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage({ auth }) {
  const nav = useNavigate()

  async function handleSignOut() {
    await signOut()
    nav('/')
  }

  return (
    <div style={{paddingBottom:'2rem',maxWidth:'480px'}}>
      <h2 style={{fontSize:'18px',fontWeight:500,marginBottom:'1.25rem'}}>⚙️ Settings</h2>

      <div className="glass-card" style={{padding:'1.25rem',borderRadius:'var(--r-xl)',marginBottom:'1rem'}}>
        <div style={{fontSize:'11px',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'12px'}}>Account</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'1rem'}}>
          <div style={{
            width:'44px',height:'44px',borderRadius:'50%',
            background:'linear-gradient(135deg,var(--accent),var(--purple))',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'18px',fontWeight:600,color:'#fff'
          }}>
            {auth.user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{fontSize:'14px',fontWeight:500}}>{auth.user?.email}</div>
            <div style={{fontSize:'12px',color:'var(--text3)'}}>Free account</div>
          </div>
        </div>
        <button className="btn" onClick={handleSignOut} style={{
          color:'var(--danger)',border:'0.5px solid rgba(239,68,68,.3)',
          background:'rgba(239,68,68,.08)',fontSize:'13px'
        }}>
          Sign out
        </button>
      </div>

      <div className="glass-card" style={{padding:'1.25rem',borderRadius:'var(--r-xl)',marginBottom:'1rem'}}>
        <div style={{fontSize:'11px',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'12px'}}>About</div>
        {[
          ['Weather data', 'Open-Meteo (free, no key)'],
          ['AI engine', 'Claude by Anthropic'],
          ['Auth & database', 'Supabase'],
          ['Hosting', 'Vercel'],
          ['Version', '1.0.0']
        ].map(([k,v]) => (
          <div key={k} style={{
            display:'flex',justifyContent:'space-between',alignItems:'center',
            padding:'8px 0',borderBottom:'0.5px solid rgba(255,255,255,0.06)',fontSize:'13px'
          }}>
            <span style={{color:'var(--text2)'}}>{k}</span>
            <span style={{color:'var(--text3)'}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
