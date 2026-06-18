import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const nav = useNavigate()

  async function handleSubmit() {
    setError(''); setLoading(true)
    const fn = isSignUp ? signUp : signIn
    const { error: err } = await fn(email, password)
    setLoading(false)
    if (err) { setError(err.message); return }
    nav('/')
  }

  return (
    <div style={{maxWidth:'380px',margin:'4rem auto',padding:'0 1rem'}}>
      <div className="glass-card" style={{padding:'2rem',borderRadius:'var(--r-xl)'}}>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{
            fontSize:'36px',marginBottom:'12px',
            filter:'drop-shadow(0 0 20px rgba(14,165,233,.4))'
          }}>◎</div>
          <h1 style={{fontSize:'22px',fontWeight:600,marginBottom:'6px'}}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p style={{fontSize:'13px',color:'var(--text2)'}}>
            {isSignUp ? 'Save favourites & search history' : 'Sign in to your SkySense account'}
          </p>
        </div>

        {/* Form */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSubmit()}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSubmit()}
          />

          {error && (
            <div style={{
              background:'rgba(239,68,68,.1)',border:'0.5px solid rgba(239,68,68,.3)',
              borderRadius:'var(--r-sm)',padding:'10px 12px',fontSize:'12px',color:'#fca5a5'
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{width:'100%',justifyContent:'center',padding:'11px',fontSize:'14px',marginTop:'4px'}}
          >
            {loading ? <><div className="spinner" /> {isSignUp ? 'Creating...' : 'Signing in...'}</> : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </div>

        <div style={{textAlign:'center',marginTop:'1.25rem',fontSize:'13px',color:'var(--text2)'}}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            style={{background:'none',border:'none',color:'var(--accent2)',cursor:'pointer',fontFamily:'Outfit,sans-serif',fontSize:'13px'}}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>

        <p style={{textAlign:'center',fontSize:'11px',color:'var(--text3)',marginTop:'1.5rem'}}>
          Works without an account too. Sign in to save favourites & history.
        </p>
      </div>
    </div>
  )
}
