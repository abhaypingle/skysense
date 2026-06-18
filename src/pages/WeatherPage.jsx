import { useState, useEffect, useCallback } from 'react'
import HeroCard from '../components/HeroCard'
import {
  HourlyRow, ForecastList, Recommendations,
  VitalsGrid, AICard, ModeChips, AlertBanner
} from '../components/WeatherWidgets'
import { askAI, PROMPTS } from '../lib/ai'
import { buildContext, WD } from '../lib/weather'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function WeatherPage({ auth, wx }) {
  const [tab, setTab]           = useState('today')
  const [mode, setMode]         = useState('general')
  const [insight, setInsight]   = useState('')
  const [weekAI, setWeekAI]     = useState('')
  const [healthAI, setHealthAI] = useState('')
  const [modeAI, setModeAI]     = useState('')
  const [loading, setLoading]   = useState({ insight:false, week:false, health:false, mode:false })

  const setL = (key, v) => setLoading(l => ({...l, [key]:v}))

  const runInsight = useCallback(async (w, loc) => {
    setL('insight', true)
    const ctx = buildContext(w, loc)
    const t = await askAI(PROMPTS.insight(ctx), auth.session).catch(() => 'AI unavailable.')
    setInsight(t); setL('insight', false)
  }, [auth.session])

  const runWeekAI = useCallback(async (w, loc) => {
    setL('week', true)
    const d = w.daily
    let weekSummary = ''
    for (let i = 0; i < 7; i++) {
      const dd = new Date(d.time[i])
      weekSummary += `${DAYS[dd.getDay()]}: ${WD[d.weathercode[i]]||'?'} ${Math.round(d.temperature_2m_max[i])}/${Math.round(d.temperature_2m_min[i])}°C rain${d.precipitation_probability_max[i]}%\n`
    }
    const ctx = buildContext(w, loc)
    const t = await askAI(PROMPTS.weekOutlook(ctx, weekSummary), auth.session).catch(() => 'AI unavailable.')
    setWeekAI(t); setL('week', false)
  }, [auth.session])

  const runHealthAI = useCallback(async (w, loc) => {
    setL('health', true)
    const ctx = buildContext(w, loc)
    const t = await askAI(PROMPTS.healthAdvice(ctx), auth.session).catch(() => 'AI unavailable.')
    setHealthAI(t); setL('health', false)
  }, [auth.session])

  const runModeAI = useCallback(async (w, loc, m) => {
    setL('mode', true)
    const ctx = buildContext(w, loc)
    const t = await askAI(PROMPTS.modeAdvice[m](ctx), auth.session).catch(() => 'AI unavailable.')
    setModeAI(t); setL('mode', false)
  }, [auth.session])

  // Auto-load on GPS detect
  useEffect(() => {
    if (!wx.weather) wx.detectLocation(auth.user?.id)
  }, [])

  // Run AI when weather first loads
  useEffect(() => {
    if (!wx.weather) return
    runInsight(wx.weather, wx.location)
    runWeekAI(wx.weather, wx.location)
    runHealthAI(wx.weather, wx.location)
  }, [wx.weather, wx.location])

  // Run mode AI when tab/mode changes
  useEffect(() => {
    if (tab === 'plan' && wx.weather) runModeAI(wx.weather, wx.location, mode)
  }, [tab, mode, wx.weather])

  if (wx.loading && !wx.weather) {
    return (
      <div style={{textAlign:'center',padding:'4rem 1rem',color:'var(--text2)'}}>
        <div style={{fontSize:'48px',marginBottom:'1rem',animation:'float 3s ease-in-out infinite'}}>🌍</div>
        <div style={{fontSize:'15px'}}>Detecting your location...</div>
        <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      </div>
    )
  }

  if (wx.error) {
    return (
      <div style={{
        background:'rgba(239,68,68,.08)',border:'0.5px solid rgba(239,68,68,.3)',
        borderRadius:'var(--r)',padding:'1rem',fontSize:'13px',color:'#fca5a5'
      }}>
        Failed to load weather: {wx.error}
        <button className="btn btn-ghost" onClick={() => wx.detectLocation(auth.user?.id)}
          style={{marginLeft:'12px',fontSize:'12px'}}>Retry</button>
      </div>
    )
  }

  if (!wx.weather) return null

  const tabs = [
    { id:'today', label:'Today' },
    { id:'week',  label:'7-Day' },
    { id:'vitals',label:'Vitals' },
    { id:'plan',  label:'AI Plan' }
  ]

  return (
    <div style={{paddingBottom:'2rem'}}>
      {/* Tabs */}
      <div className="tabs-row" style={{marginBottom:'1rem'}}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── TODAY ── */}
      {tab === 'today' && (
        <>
          <HeroCard weather={wx.weather} location={wx.location} />
          <AlertBanner weather={wx.weather} />
          <p className="section-label">Hourly</p>
          <HourlyRow weather={wx.weather} />
          <p className="section-label">Smart recommendations</p>
          <Recommendations weather={wx.weather} />
          <p className="section-label" style={{marginTop:'1rem'}}>AI insight</p>
          <AICard title="Weather insight" content={insight} loading={loading.insight}>
            <button className="btn btn-purple" style={{marginTop:'.75rem'}}
              onClick={() => setTab('plan')}>
              Plan my day ↗
            </button>
          </AICard>
        </>
      )}

      {/* ── WEEK ── */}
      {tab === 'week' && (
        <>
          <p className="section-label">7-day forecast</p>
          <ForecastList weather={wx.weather} />
          <p className="section-label" style={{marginTop:'1rem'}}>AI week outlook</p>
          <AICard title="Week outlook" content={weekAI} loading={loading.week} />
        </>
      )}

      {/* ── VITALS ── */}
      {tab === 'vitals' && (
        <>
          <p className="section-label">Health & environment</p>
          <VitalsGrid weather={wx.weather} />
          <p className="section-label" style={{marginTop:'1rem'}}>AI health advice</p>
          <AICard title="Health advice" content={healthAI} loading={loading.health} />
        </>
      )}

      {/* ── AI PLAN ── */}
      {tab === 'plan' && (
        <>
          <p className="section-label">Choose your mode</p>
          <ModeChips mode={mode} onChange={m => { setMode(m); setModeAI('') }} />
          <AICard
            title={{ general:'General day plan', student:'Student mode', farmer:'Farmer mode', fitness:'Fitness mode', traveler:'Traveler mode' }[mode]}
            content={modeAI}
            loading={loading.mode}
          />
        </>
      )}
    </div>
  )
}
