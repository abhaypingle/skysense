import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from '../lib/supabase'
import { searchCity } from '../lib/weather'
import { useTheme } from '../hooks/useTheme'

const AVATAR_COLORS = [
  ['#0ea5e9', '#818cf8'],
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#0ea5e9'],
  ['#818cf8', '#ec4899'],
  ['#2dd4bf', '#0ea5e9'],
  ['#f97316', '#f59e0b'],
]

export default function Navbar({ auth, wx }) {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState([])
  const [searching, setSearching] = useState(false)
  const [showMenu, setShowMenu]   = useState(false)
  const [focused, setFocused]     = useState(false)
  const timerRef = useRef(null)
  const menuRef  = useRef(null)
  const nav = useNavigate()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

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
    }, 350)
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
    nav('/')
  }

  const avIdx = auth.user?.user_metadata?.avatar_idx ?? 0
  const avColors = AVATAR_COLORS[avIdx] || AVATAR_COLORS[0]

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo-mark">◎</span>
        <span className="navbar-logo-text">SkySense</span>
      </Link>

      {wx.location && (
        <div className="navbar-location-pill" title={wx.location}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{wx.location.split(',')[0]}</span>
        </div>
      )}

      {/* Search box */}
      <div className={`navbar-search ${focused ? 'is-focused' : ''}`}>
        <svg className="navbar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          className="navbar-search-input"
          value={query}
          onChange={handleSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search any city..."
        />
        {searching && <div className="spinner navbar-search-spinner" />}

        {results.length > 0 && focused && (
          <div className="navbar-dropdown">
            {results.map((r, i) => (
              <div key={i} className="navbar-dropdown-item" onClick={() => selectCity(r)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.4}>
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="navbar-dropdown-name">{r.name}</span>
                <span className="navbar-dropdown-meta">{r.admin1 || ''} {r.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        {/* GPS button */}
        <button className="icon-btn" onClick={() => wx.detectLocation(auth.user?.id)} title="Use my location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <circle cx="12" cy="12" r="8" strokeDasharray="2 2"/>
          </svg>
        </button>

        {/* Theme toggle */}
        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle theme">
          <span className={`theme-toggle-icon ${theme === 'dark' ? 'show-moon' : 'show-sun'}`}>
            <svg className="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
            <svg className="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </span>
        </button>

        {/* Auth section */}
        {auth.loading ? (
          <div className="navbar-skeleton" />
        ) : auth.user ? (
          <div className="navbar-profile" ref={menuRef}>
            <button className="profile-avatar-btn" onClick={() => setShowMenu(!showMenu)}>
              <div className="profile-avatar" style={{background:`linear-gradient(135deg,${avColors[0]},${avColors[1]})`}}>
                {(auth.user.user_metadata?.display_name || auth.user.email)?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>
            <div className={`navbar-dropdown profile-dropdown ${showMenu ? 'is-open' : ''}`}>
              <div className="profile-dropdown-header">
                <div className="profile-avatar profile-avatar-lg" style={{background:`linear-gradient(135deg,${avColors[0]},${avColors[1]})`}}>
                  {(auth.user.user_metadata?.display_name || auth.user.email)?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="profile-name">{auth.user.user_metadata?.display_name || 'Weather watcher'}</div>
                  <div className="profile-email">{auth.user.email}</div>
                </div>
              </div>
              <Link to="/settings" onClick={() => setShowMenu(false)} className="profile-cta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005.6 15a1.65 1.65 0 00-1.51-1H4a2 2 0 110-4h.09A1.65 1.65 0 005.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                Manage profile
              </Link>
              <Link to="/favourites" onClick={() => setShowMenu(false)} className="profile-link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                Favourites
              </Link>
              <div className="profile-divider" />
              <div className="profile-link profile-link-danger" onClick={handleSignOut}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
                Sign out
              </div>
            </div>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary navbar-signin">Sign in</Link>
        )}
      </div>
    </nav>
  )
}
