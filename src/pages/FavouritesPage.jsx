import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavourites, saveFavourite, deleteFavourite } from '../lib/supabase'

export default function FavouritesPage({ auth, wx }) {
  const [favs, setFavs]       = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await getFavourites(auth.user.id)
    setFavs(data || [])
    setLoading(false)
  }

  async function addCurrent() {
    if (!wx.location || !wx.coords) return
    await saveFavourite(auth.user.id, wx.location, wx.coords.lat, wx.coords.lon)
    load()
  }

  async function remove(id) {
    await deleteFavourite(id)
    setFavs(f => f.filter(x => x.id !== id))
  }

  function goTo(f) {
    wx.load(f.lat, f.lon, f.location_name, auth.user.id)
    nav('/')
  }

  return (
    <div style={{paddingBottom:'2rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
        <h2 style={{fontSize:'18px',fontWeight:500}}>⭐ Favourites</h2>
        {wx.location && (
          <button className="btn btn-ghost" onClick={addCurrent} style={{fontSize:'12px'}}>
            + Save current ({wx.location.split(',')[0]})
          </button>
        )}
      </div>

      {loading
        ? <div style={{color:'var(--text2)',fontSize:'14px'}}>Loading...</div>
        : favs.length === 0
        ? (
          <div className="glass-card" style={{padding:'2rem',textAlign:'center',borderRadius:'var(--r-xl)'}}>
            <div style={{fontSize:'36px',marginBottom:'12px'}}>⭐</div>
            <div style={{color:'var(--text2)',fontSize:'14px'}}>No saved locations yet.</div>
            <div style={{color:'var(--text3)',fontSize:'13px',marginTop:'6px'}}>Search a city and save it here.</div>
          </div>
        )
        : (
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {favs.map(f => (
              <div key={f.id} style={{
                display:'flex',alignItems:'center',gap:'12px',
                padding:'14px 16px',borderRadius:'14px',
                background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)',
                cursor:'pointer',transition:'background .2s'
              }}
              onClick={() => goTo(f)}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:500,fontSize:'14px'}}>{f.location_name}</div>
                  <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'2px'}}>
                    {f.lat.toFixed(2)}°, {f.lon.toFixed(2)}°
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); remove(f.id) }}
                  style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:'16px',padding:'4px 8px'}}
                >✕</button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
