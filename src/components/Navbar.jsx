import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut, supabase } from '../lib/supabase'
import { searchCity } from '../lib/weather'

export default function Navbar({ auth, wx }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const timerRef = useRef(null)
  const nav = useNavigate()

  async function handleSearch(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timerRef.current)
    if (q.length < 2) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await searchCity(q)
        setResults(r.slice(0, 5))
      } finally { setSearching(false) }
    }, 400)
  }

  function selectCity(r) {
    wx.load(r.latitude, r.longitude, `${r.name}, ${r.country}`, auth.user?.id)
    setQuery('')
    setResults([])
    nav('/')
  }

  async function handleSignOut() {
    await signOut()
    setShowMenu(false)
  }

  return (
    <nav style={{
      display:'flex',alignItems:'center',gap:'12px',
      padding:'1rem 0',marginBottom:'1rem',
      borderBottom:'0.5px solid rgba(255,255,255,0.08)'
    }}>
      {/* Brand */}
      <Link to="/" style={{textDecoration:'none',flexShrink:0}}>
        <span style={{
          fontSize:'20px',fontWeight:600,letterSpacing:'-0.3px',
          background:'linear-gradient(135deg,#38bdf8,#818cf8)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
        }}>◎ SkySense</span>
      </Link>

      {/* Search box */}
      <div style={{flex:1,position:'relative',maxWidth:'400px',margin:'0 auto'}}>
        <input
          className="input"
          value={query}
          onChange={handleSearch}
          placeholder="Search city..."
          style={{paddingLeft:'36px'}}
        />
        <svg style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',opacity:.4}}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        {searching && <div className="spinner" style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)'}} />}

        {/* Dropdown results */}
        {results.length > 0 && (
          <div style={{
            position:'absolute',top:'calc(100% + 6px)',left:0,right:0,
            background:'rgba(13,27,62,0.97)',border:'0.5px solid rgba(255,255,255,0.12)',
            borderRadius:'12px',overflow:'hidden',zIndex:100,
            backdropFilter:'blur(20px)'
          }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => selectCity(r)} style={{
                padding:'10px 14px',cursor:'pointer',fontSize:'14px',
                color:'rgba(240,249,255,0.85)',
                borderBottom: i < results.length-1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
                transition:'background .15s'
              }}
              onMouseEnter={e=>e.target.style.background='rgba(14,165,233,0.1)'}
              onMouseLeave={e=>e.target.style.background='transparent'}>
                <span style={{fontWeight:500}}>{r.name}</span>
                <span style={{color:'var(--text3)',fontSize:'12px'}}>, {r.admin1 || ''} {r.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GPS button */}
      <button className="btn btn-ghost" onClick={() => wx.detectLocation(auth.user?.id)}
        title="Use my location" style={{flexShrink:0,padding:'8px 10px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <circle cx="12" cy="12" r="8" strokeDasharray="2 2"/>
        </svg>
      </button>

      {/* Auth section */}
      {auth.loading ? null : auth.user ? (
        <div style={{position:'relative',flexShrink:0}}>
          <button className="btn btn-ghost" onClick={() => setShowMenu(!showMenu)}
            style={{padding:'6px 10px',gap:'8px'}}>
            <div style={{
              width:28,height:28,borderRadius:'50%',
              background:'linear-gradient(135deg,var(--accent),var(--purple))',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'12px',fontWeight:600,color:'#fff'
            }}>
              {auth.user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
          {showMenu && (
            <div style={{
              position:'absolute',top:'calc(100% + 8px)',right:0,
              background:'rgba(13,27,62,0.97)',border:'0.5px solid rgba(255,255,255,0.12)',
              borderRadius:'12px',overflow:'hidden',zIndex:100,minWidth:'160px',
              backdropFilter:'blur(20px)'
            }}>
              {[
                {label:'⭐ Favourites', to:'/favourites'},
                {label:'⚙️ Settings', to:'/settings'},
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setShowMenu(false)} style={{
                  display:'block',padding:'10px 14px',fontSize:'13px',
                  color:'var(--text2)',textDecoration:'none',
                  borderBottom:'0.5px solid rgba(255,255,255,0.06)',
                  transition:'background .15s'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {item.label}
                </Link>
              ))}
              <div onClick={handleSignOut} style={{
                padding:'10px 14px',fontSize:'13px',color:'var(--danger)',
                cursor:'pointer',transition:'background .15s'
              }}
              onMouseEnter={e=>e.target.style.background='rgba(239,68,68,0.08)'}
              onMouseLeave={e=>e.target.style.background='transparent'}>
                Sign out
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link to="/auth" className="btn btn-primary" style={{flexShrink:0,textDecoration:'none'}}>
          Sign in
        </Link>
      )}
    </nav>
  )
}
