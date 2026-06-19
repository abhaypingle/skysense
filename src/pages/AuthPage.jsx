import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, verifyOtp, resendOtp } from '../lib/supabase'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep]         = useState('form') // 'form' | 'otp'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp]           = useState('')
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')
  const [loading, setLoading]   = useState(false)
  const nav = useNavigate()

  async function handleSubmit() {
    setError(''); setInfo(''); setLoading(true)

    if (isSignUp) {
      const { error: err } = await signUp(email, password)
      setLoading(false)
      if (err) { setError(err.message); return }
      setStep('otp')
      setInfo('We sent a 6-digit code to your email.')
      return
    }

    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) { setError(err.message); return }
    nav('/')
  }

  async function handleVerify() {
    setError(''); setLoading(true)
    const { error: err } = await verifyOtp(email, otp)
    setLoading(false)
    if (err) { setError(err.message); return }
    nav('/')
  }

  async function handleResend() {
    setError(''); setInfo('')
    const { error: err } = await resendOtp(email)
    if (err) { setError(err.message); return }
    setInfo('New code sent. Check your email.')
  }

  return (
    <div style={{maxWidth:'380px',margin:'4rem auto',padding:'0 1rem'}}>
      <div className="glass-card" style={{padding:'2rem',borderRadius:'var(--r-xl)'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'36px',marginBottom:'12px',filter:'drop-shadow(0 0 20px rgba(14,165,233,.4))'}}>◎</div>
          <h1 style={{fontSize:'22px',fontWeight:600,marginBottom:'6px'}}>
            {step === 'otp' ? 'Verify your email' : isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p style={{fontSize:'13px',color:'var(--text2)'}}>
            {step === 'otp'
              ? `Enter the 6-digit code sent to ${email}`
              : isSignUp ? 'Save favourites & search history' : 'Sign in to your SkySense account'}
          </p>
        </div>

        {/* ── FORM STEP ── */}
        {step === 'form' && (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <input className="input" type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSubmit()} />
            <input className="input" type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSubmit()} />

            {error && <ErrorBox text={error} />}

            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}
              style={{width:'100%',justifyContent:'center',padding:'11px',fontSize:'14px',marginTop:'4px'}}>
              {loading
                ? <><div className="spinner" /> {isSignUp ? 'Sending code...' : 'Signing in...'}</>
                : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </div>
        )}

        {/* ── OTP STEP ── */}
        {step === 'otp' && (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
              onKeyDown={e => e.key==='Enter' && handleVerify()}
              style={{textAlign:'center',fontSize:'24px',letterSpacing:'8px',fontWeight:600}}
            />

            {error && <ErrorBox text={error} />}
            {info && !error && <InfoBox text={info} />}

            <button className="btn btn-primary" onClick={handleVerify} disabled={loading || otp.length !== 6}
              style={{width:'100%',justifyContent:'center',padding:'11px',fontSize:'14px',marginTop:'4px'}}>
              {loading ? <><div className="spinner" /> Verifying...</> : 'Verify & continue'}
            </button>

            <div style={{textAlign:'center',fontSize:'12px',color:'var(--text3)'}}>
              Didn't get it?{' '}
              <button onClick={handleResend} style={{background:'none',border:'none',color:'var(--accent2)',cursor:'pointer',fontFamily:'Outfit,sans-serif',fontSize:'12px'}}>
                Resend code
              </button>
            </div>
            <button onClick={() => { setStep('form'); setOtp(''); setError(''); setInfo('') }}
              style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:'12px',textAlign:'center'}}>
              ← Use a different email
            </button>
          </div>
        )}

        {step === 'form' && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

function ErrorBox({ text }) {
  return (
    <div style={{background:'rgba(239,68,68,.1)',border:'0.5px solid rgba(239,68,68,.3)',borderRadius:'var(--r-sm)',padding:'10px 12px',fontSize:'12px',color:'#fca5a5'}}>
      {text}
    </div>
  )
}
function InfoBox({ text }) {
  return (
    <div style={{background:'rgba(14,165,233,.1)',border:'0.5px solid rgba(14,165,233,.3)',borderRadius:'var(--r-sm)',padding:'10px 12px',fontSize:'12px',color:'#7dd3fc'}}>
      {text}
    </div>
  )
}
