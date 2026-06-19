import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useWeather } from './hooks/useWeather'
import Navbar from './components/Navbar'
import WeatherFX from './components/WeatherFX'
import WeatherPage from './pages/WeatherPage'
import AuthPage from './pages/AuthPage'
import FavouritesPage from './pages/FavouritesPage'
import SettingsPage from './pages/SettingsPage'
import './styles/global.css'

function AuroraBg() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob" />
      <div className="aurora-blob" />
      <div className="aurora-blob" />
    </div>
  )
}

export default function App() {
  const auth = useAuth()
  const wx   = useWeather()

  const currentCode = wx.weather?.hourly?.weathercode?.[new Date().getHours()] ?? 0

  return (
    <BrowserRouter>
      <AuroraBg />
      <WeatherFX weathercode={currentCode} />
      <div className="app-shell">
        <Navbar auth={auth} wx={wx} />
        <Routes>
          <Route path="/"            element={<WeatherPage auth={auth} wx={wx} />} />
          <Route path="/auth"        element={auth.user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/favourites"  element={auth.user ? <FavouritesPage auth={auth} wx={wx} /> : <Navigate to="/auth" />} />
          <Route path="/settings"    element={auth.user ? <SettingsPage auth={auth} /> : <Navigate to="/auth" />} />
        </Routes>
        <footer style={{
          textAlign:'center',padding:'2rem 0 1rem',fontSize:'12px',color:'var(--text3)',
          borderTop:'0.5px solid var(--glass-border)',marginTop:'2rem'
        }}>
          <span style={{opacity:.8}}>SkySense</span> · AI-powered hyper-local weather · Built with Claude, Supabase & Open-Meteo
        </footer>
      </div>
    </BrowserRouter>
  )
}
