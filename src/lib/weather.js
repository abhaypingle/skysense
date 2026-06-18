// Open-Meteo — free, no API key needed
const BASE = 'https://api.open-meteo.com/v1/forecast'
const GEO  = 'https://geocoding-api.open-meteo.com/v1/search'
const REV  = 'https://nominatim.openstreetmap.org/reverse'

export const WC = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
  45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',
  61:'🌧️',63:'🌧️',65:'🌧️',
  71:'🌨️',73:'🌨️',75:'❄️',
  80:'🌦️',81:'🌧️',82:'⛈️',
  95:'⛈️',96:'⛈️',99:'⛈️'
}

export const WD = {
  0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
  45:'Fog',48:'Icy fog',
  51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',
  61:'Light rain',63:'Moderate rain',65:'Heavy rain',
  71:'Light snow',73:'Snow',75:'Heavy snow',
  80:'Rain showers',81:'Heavy showers',82:'Violent showers',
  95:'Thunderstorm',96:'Hail storm',99:'Heavy hail'
}

export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    hourly: [
      'temperature_2m','apparent_temperature','relativehumidity_2m',
      'precipitation_probability','weathercode','windspeed_10m',
      'uv_index','visibility','windgusts_10m','precipitation'
    ].join(','),
    daily: [
      'weathercode','temperature_2m_max','temperature_2m_min',
      'precipitation_probability_max','precipitation_sum',
      'windspeed_10m_max','uv_index_max','sunrise','sunset'
    ].join(','),
    current_weather: true,
    timezone: 'auto',
    forecast_days: 7
  })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

export async function searchCity(query) {
  const res = await fetch(`${GEO}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
  const data = await res.json()
  return data.results || []
}

export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`${REV}?lat=${lat}&lon=${lon}&format=json`)
    const d = await res.json()
    const a = d.address
    const area = a.suburb || a.village || a.town || a.city_district || a.county || ''
    const city = a.city || a.town || a.state_district || ''
    return area && city ? `${area}, ${city}` : area || city || 'Your location'
  } catch {
    return 'Your location'
  }
}

export function getUVInfo(uv) {
  if (uv <= 2)  return { label: 'Low',       color: '#10b981' }
  if (uv <= 5)  return { label: 'Moderate',  color: '#f59e0b' }
  if (uv <= 7)  return { label: 'High',      color: '#f97316' }
  if (uv <= 10) return { label: 'Very High', color: '#ef4444' }
  return               { label: 'Extreme',   color: '#9333ea' }
}

export function getAQIInfo(aqi) {
  if (aqi <= 50)  return { label: 'Good',                color: '#10b981' }
  if (aqi <= 100) return { label: 'Moderate',            color: '#f59e0b' }
  if (aqi <= 150) return { label: 'Unhealthy (sens.)',   color: '#f97316' }
  if (aqi <= 200) return { label: 'Unhealthy',           color: '#ef4444' }
  return                 { label: 'Very Unhealthy',      color: '#9333ea' }
}

export function buildContext(weather, locationName) {
  const h = weather.hourly
  const d = weather.daily
  const hr = new Date().getHours()
  const temps = h.temperature_2m.slice(hr, hr + 12)
    .map((t, i) => `${hr + i}h:${Math.round(t)}°C`).join(', ')
  const rain = h.precipitation_probability.slice(hr, hr + 12)
    .map((r, i) => `${hr + i}h:${r}%`).join(', ')
  const hi = Math.round(Math.max(...h.temperature_2m.slice(0, 24)))
  const lo = Math.round(Math.min(...h.temperature_2m.slice(0, 24)))
  return `Location: ${locationName}
Now: ${Math.round(h.temperature_2m[hr])}°C feels ${Math.round(h.apparent_temperature[hr])}°C
Condition: ${WD[h.weathercode[hr]] || 'Unknown'}
Humidity: ${h.relativehumidity_2m[hr]}%
Wind: ${Math.round(h.windspeed_10m[hr])} km/h
UV: ${h.uv_index ? Math.round(h.uv_index[hr]) : 'N/A'}
Today hi/lo: ${hi}°C / ${lo}°C
12h temps: ${temps}
12h rain%: ${rain}
Sunrise: ${d.sunrise[0]?.split('T')[1] || 'N/A'} | Sunset: ${d.sunset[0]?.split('T')[1] || 'N/A'}`
}
