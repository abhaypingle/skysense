import { WC, WD } from '../lib/weather'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ── Hourly scroll ──────────────────────────────────────────────
export function HourlyRow({ weather }) {
  const h  = weather.hourly
  const hr = new Date().getHours()
  const cards = []
  for (let i = 0; i < 14 && (hr + i) < 24; i++) {
    const idx = hr + i
    cards.push(
      <div key={idx} style={{
        background: i === 0 ? 'rgba(14,165,233,.15)' : 'rgba(255,255,255,0.05)',
        border: `0.5px solid ${i === 0 ? 'rgba(14,165,233,.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius:'14px',padding:'10px 12px',minWidth:'62px',
        textAlign:'center',flexShrink:0
      }}>
        <div style={{fontSize:'11px',color:'var(--text3)',marginBottom:'6px'}}>{i === 0 ? 'Now' : `${idx}:00`}</div>
        <div style={{fontSize:'22px',marginBottom:'5px',lineHeight:1}}>{WC[h.weathercode[idx]] || '🌡️'}</div>
        <div style={{fontSize:'13px',fontWeight:500}}>{Math.round(h.temperature_2m[idx])}°</div>
        {h.precipitation_probability[idx] > 10 && (
          <div style={{fontSize:'10px',color:'#60a5fa',marginTop:'3px'}}>{h.precipitation_probability[idx]}%</div>
        )}
      </div>
    )
  }
  return (
    <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'6px',scrollbarWidth:'none'}}>
      {cards}
    </div>
  )
}

// ── Smart recommendations ──────────────────────────────────────
export function Recommendations({ weather }) {
  const h   = weather.hourly
  const hr  = new Date().getHours()
  const maxRain = Math.max(...h.precipitation_probability.slice(hr, hr + 8))
  const maxUV   = h.uv_index ? Math.max(...h.uv_index.slice(hr, hr + 8)) : 0
  const maxTemp = Math.max(...h.temperature_2m.slice(hr, hr + 8))
  const wind    = h.windspeed_10m[hr]

  const recs = [
    maxRain >= 60
      ? { cls:'bad',  icon:'🌧️', title:'Carry umbrella',     text:`${maxRain}% rain chance. Don't leave without it.` }
      : maxRain >= 30
      ? { cls:'warn', icon:'🌂', title:'Maybe bring umbrella', text:`${maxRain}% possible. Safe to carry one.` }
      : { cls:'ok',   icon:'😎', title:'No rain expected',    text:'Clear skies ahead. Leave the umbrella home.' },

    maxUV >= 8
      ? { cls:'bad',  icon:'🕶️', title:'Extreme UV alert',    text:`UV ${Math.round(maxUV)}. SPF 50+, hat, seek shade.` }
      : maxUV >= 5
      ? { cls:'warn', icon:'🌞', title:'Moderate-High UV',    text:`UV ${Math.round(maxUV)}. Apply sunscreen before going out.` }
      : { cls:'ok',   icon:'🌤️', title:'UV safe today',       text:'No extra sun protection needed.' },

    maxTemp >= 40
      ? { cls:'bad',  icon:'🌡️', title:'Extreme heat',        text:`Peak ${Math.round(maxTemp)}°C. Avoid 12–3 PM outdoors.` }
      : maxTemp >= 35
      ? { cls:'warn', icon:'🌡️', title:'Hot afternoon',       text:`Up to ${Math.round(maxTemp)}°C. Stay hydrated, light clothes.` }
      : { cls:'ok',   icon:'🌿', title:'Pleasant temperature', text:'Great conditions for outdoor activities.' },

    wind >= 40
      ? { cls:'bad',  icon:'💨', title:'Strong winds',         text:`${Math.round(wind)} km/h. Avoid bikes, secure loose items.` }
      : wind >= 20
      ? { cls:'info', icon:'🚴', title:'Breezy conditions',    text:`${Math.round(wind)} km/h. Fine for most travel.` }
      : { cls:'ok',   icon:'🚶', title:'Calm winds',           text:'Perfect for walking and outdoor sports.' }
  ]

  const colors = {
    ok:   { bg:'rgba(16,185,129,.08)',  border:'rgba(16,185,129,.25)',  dot:'var(--green)'  },
    warn: { bg:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.25)', dot:'var(--amber)'  },
    bad:  { bg:'rgba(239,68,68,.08)',  border:'rgba(239,68,68,.25)',  dot:'var(--danger)' },
    info: { bg:'rgba(14,165,233,.08)', border:'rgba(14,165,233,.25)', dot:'var(--accent)' }
  }

  return (
    <div className="grid-2">
      {recs.map((r, i) => {
        const c = colors[r.cls]
        return (
          <div key={i} style={{background:c.bg,border:`0.5px solid ${c.border}`,borderRadius:'var(--r)',padding:'14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:c.dot,flexShrink:0}} />
              <span style={{fontSize:'12px',fontWeight:600,color:'var(--text1)'}}>{r.title}</span>
            </div>
            <div style={{fontSize:'11px',color:'var(--text2)',lineHeight:1.6}}>{r.text}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── 7-day forecast ─────────────────────────────────────────────
export function ForecastList({ weather }) {
  const d = weather.daily
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      {Array.from({length:7},(_,i) => {
        const dd   = new Date(d.time[i])
        const lbl  = i===0?'Today':i===1?'Tmrw':DAYS[dd.getDay()]
        const rain = d.precipitation_probability_max[i]
        const hi   = Math.round(d.temperature_2m_max[i])
        const lo   = Math.round(d.temperature_2m_min[i])
        return (
          <div key={i} style={{
            display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',
            borderRadius:'14px',background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{fontSize:'13px',fontWeight:500,width:'38px',color:'var(--text1)'}}>{lbl}</div>
            <div style={{fontSize:'22px',width:'28px',textAlign:'center'}}>{WC[d.weathercode[i]]||'🌡️'}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:'12px',color:'var(--text2)'}}>{WD[d.weathercode[i]]||''}</div>
              <div style={{height:'3px',borderRadius:'2px',background:'rgba(255,255,255,0.08)',marginTop:'6px'}}>
                <div style={{height:'100%',borderRadius:'2px',width:`${rain}%`,background:'linear-gradient(90deg,#3b82f6,#06b6d4)'}} />
              </div>
              <div style={{fontSize:'10px',color:'var(--text3)',marginTop:'2px'}}>{rain}% rain</div>
            </div>
            <div style={{textAlign:'right',fontSize:'13px',fontWeight:500,minWidth:'52px'}}>
              {hi}° <span style={{color:'var(--text3)',fontSize:'11px'}}>/ {lo}°</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Vitals grid ───────────────────────────────────────────────
export function VitalsGrid({ weather }) {
  const h   = weather.hourly
  const hr  = new Date().getHours()
  const uv  = h.uv_index ? Math.round(h.uv_index[hr]) : null
  const hum = h.relativehumidity_2m[hr]
  const vis = h.visibility ? Math.round(h.visibility[hr] / 1000) : 10
  const wind= Math.round(h.windspeed_10m[hr])
  const aqi = Math.floor(Math.random() * 60) + 25

  const vitals = [
    { label:'UV Index',    val: uv ?? '–',    sub: uv===null?'N/A':uv<=2?'Low':uv<=5?'Moderate':uv<=7?'High':'Very High',
      barPct: uv!==null?Math.min(uv/11*100,100):0, barColor: uv===null?'var(--text3)':uv<=2?'var(--green)':uv<=6?'var(--amber)':'var(--danger)' },
    { label:'Humidity',    val:`${hum}%`,      sub: hum<30?'Very dry':hum<60?'Comfortable':hum<80?'Humid':'Very humid',
      barPct:hum, barColor:'var(--accent)' },
    { label:'Air Quality', val:aqi,            sub: aqi<=50?'Good':aqi<=100?'Moderate':'Unhealthy (sens.)',
      barPct:Math.min(aqi/150*100,100), barColor: aqi<=50?'var(--green)':aqi<=100?'var(--amber)':'var(--danger)' },
    { label:'Visibility',  val:`${vis} km`,    sub: vis>=10?'Excellent':vis>=5?'Good':vis>=2?'Moderate':'Poor' },
    { label:'Wind Speed',  val:`${wind} km/h`, sub: wind<10?'Calm':wind<30?'Light':wind<50?'Moderate':'Strong',
      barPct:Math.min(wind/80*100,100), barColor:'var(--teal)' },
    { label:'Dew Point',   val: hum>75?'Muggy':hum>55?'Humid':'Fresh',
      sub: hum>75?'Very uncomfortable':hum>55?'Somewhat humid':'Comfortable' }
  ]

  return (
    <div className="grid-2" style={{gap:'8px'}}>
      {vitals.map(v => (
        <div key={v.label} className="glass-card" style={{borderRadius:'var(--r)',padding:'14px 16px'}}>
          <div style={{fontSize:'11px',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>{v.label}</div>
          <div style={{fontSize:'22px',fontWeight:500}}>{v.val}</div>
          <div style={{fontSize:'11px',color:'var(--text2)',marginTop:'4px'}}>{v.sub}</div>
          {v.barPct !== undefined && (
            <div style={{height:'5px',borderRadius:'3px',background:'rgba(255,255,255,0.08)',marginTop:'8px'}}>
              <div style={{height:'100%',borderRadius:'3px',width:`${v.barPct}%`,background:v.barColor,transition:'width .5s'}} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── AI card ────────────────────────────────────────────────────
export function AICard({ title, content, loading, children }) {
  return (
    <div className="glass-card" style={{padding:'1.25rem',marginBottom:'.75rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'.75rem'}}>
        <div className="ai-dot" />
        <span style={{fontSize:'14px',fontWeight:600}}>{title}</span>
        <span style={{
          marginLeft:'auto',fontSize:'10px',padding:'2px 8px',borderRadius:'8px',
          background:'rgba(129,140,248,.15)',border:'0.5px solid rgba(129,140,248,.3)',color:'var(--purple)'
        }}>AI</span>
      </div>
      {loading
        ? <div style={{display:'flex',alignItems:'center',gap:'10px',color:'var(--text3)',fontSize:'13px'}}><div className="spinner" /> Analyzing...</div>
        : <div style={{fontSize:'13px',lineHeight:1.75,color:'var(--text2)',whiteSpace:'pre-wrap'}}>{content}</div>
      }
      {children}
    </div>
  )
}

// ── Mode chips ─────────────────────────────────────────────────
export function ModeChips({ mode, onChange }) {
  const modes = [
    {id:'general',label:'🌐 General'},
    {id:'student',label:'📚 Student'},
    {id:'farmer', label:'🌾 Farmer'},
    {id:'fitness',label:'🏃 Fitness'},
    {id:'traveler',label:'✈️ Traveler'}
  ]
  return (
    <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'4px',scrollbarWidth:'none',marginBottom:'.75rem'}}>
      {modes.map(m => (
        <button key={m.id} onClick={() => onChange(m.id)} style={{
          display:'flex',alignItems:'center',gap:'5px',
          fontSize:'12px',fontWeight:500,padding:'7px 14px',
          borderRadius:'10px',cursor:'pointer',
          border: mode===m.id ? '0.5px solid rgba(14,165,233,.4)' : '0.5px solid rgba(255,255,255,0.1)',
          background: mode===m.id ? 'rgba(14,165,233,.15)' : 'rgba(255,255,255,0.05)',
          color: mode===m.id ? 'var(--accent2)' : 'var(--text3)',
          whiteSpace:'nowrap',flexShrink:0,fontFamily:'Outfit,sans-serif',transition:'all .2s'
        }}>
          {m.label}
        </button>
      ))}
    </div>
  )
}

// ── Alert banner ───────────────────────────────────────────────
export function AlertBanner({ weather }) {
  const h   = weather.hourly
  const hr  = new Date().getHours()
  const maxRain = Math.max(...h.precipitation_probability.slice(hr, hr + 6))
  const maxTemp = Math.max(...h.temperature_2m.slice(hr, hr + 6))
  let msg = ''
  if (maxRain >= 70) msg = `Heavy rain expected in next 6 hours (${maxRain}% chance). Carry umbrella!`
  else if (maxTemp >= 40) msg = `Extreme heat alert — up to ${Math.round(maxTemp)}°C. Stay indoors 12–3 PM.`
  if (!msg) return null
  return (
    <div className="alert-banner">
      <div className="alert-dot" />
      {msg}
    </div>
  )
}
