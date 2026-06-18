import { WC, WD, getUVInfo } from '../lib/weather'

export default function HeroCard({ weather, location }) {
  const h   = weather.hourly
  const hr  = new Date().getHours()
  const temp   = Math.round(h.temperature_2m[hr])
  const feels  = Math.round(h.apparent_temperature[hr])
  const code   = h.weathercode[hr]
  const icon   = WC[code] || '🌡️'
  const desc   = WD[code] || 'Unknown'
  const hum    = h.relativehumidity_2m[hr]
  const wind   = Math.round(h.windspeed_10m[hr])
  const uv     = h.uv_index ? Math.round(h.uv_index[hr]) : null
  const rain   = h.precipitation_probability[hr]
  const hi     = Math.round(Math.max(...h.temperature_2m.slice(0, 24)))
  const lo     = Math.round(Math.min(...h.temperature_2m.slice(0, 24)))
  const uvInfo = uv !== null ? getUVInfo(uv) : null

  return (
    <div className="glass-card" style={{padding:'1.75rem',marginBottom:'1rem',position:'relative',overflow:'hidden'}}>
      {/* Glow */}
      <div style={{
        position:'absolute',top:-40,right:-40,width:220,height:220,
        background:'radial-gradient(circle,rgba(14,165,233,.22),transparent)',
        borderRadius:'50%',pointerEvents:'none'
      }} />

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'}}>
        {/* Temp */}
        <div>
          <div style={{
            fontSize:'72px',fontWeight:300,lineHeight:1,letterSpacing:'-4px',
            background:'linear-gradient(160deg,#fff 60%,#38bdf8)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
          }}>
            {temp}<span style={{fontSize:'28px',fontWeight:400,opacity:.7}}>°</span>
          </div>
          <div style={{fontSize:'16px',fontWeight:500,color:'var(--text1)',marginTop:'4px'}}>{desc}</div>
          <div style={{fontSize:'13px',color:'var(--text2)',marginTop:'3px'}}>
            Feels {feels}° · H:{hi}° L:{lo}°
          </div>
          <div style={{fontSize:'12px',color:'var(--text3)',marginTop:'4px',display:'flex',alignItems:'center',gap:'4px'}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.5}>
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {location}
          </div>
        </div>

        {/* Icon */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'64px',lineHeight:1,filter:'drop-shadow(0 0 20px rgba(14,165,233,.4))'}}>
            {icon}
          </div>
          <div style={{
            fontSize:'11px',padding:'3px 10px',borderRadius:'12px',
            background:'rgba(14,165,233,.15)',border:'0.5px solid rgba(14,165,233,.3)',color:'var(--accent2)'
          }}>
            {rain > 40 ? '🌂 Rain likely' : rain > 20 ? '🌂 Possible rain' : '☀️ Dry'}
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid-4">
        {[
          { label:'Humidity', val:`${hum}%` },
          { label:'Wind', val:`${wind} km/h` },
          { label:'UV Index', val: uv !== null ? uv : '–', sub: uvInfo?.label, subColor: uvInfo?.color },
          { label:'Rain', val:`${rain}%` },
        ].map(s => (
          <div key={s.label} style={{
            background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.08)',
            borderRadius:'10px',padding:'10px 8px',textAlign:'center'
          }}>
            <div style={{fontSize:'10px',color:'var(--text3)',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.06em'}}>{s.label}</div>
            <div style={{fontSize:'15px',fontWeight:500}}>{s.val}</div>
            {s.sub && <div style={{fontSize:'10px',color:s.subColor||'var(--text2)',marginTop:'2px'}}>{s.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
