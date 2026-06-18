import { useState, useCallback } from 'react'
import { fetchWeather, reverseGeocode, searchCity } from '../lib/weather'
import { saveSearch } from '../lib/supabase'

export function useWeather() {
  const [weather, setWeather]       = useState(null)
  const [location, setLocation]     = useState('')
  const [coords, setCoords]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const load = useCallback(async (lat, lon, locName, userId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(lat, lon)
      setWeather(data)
      setLocation(locName)
      setCoords({ lat, lon })
      if (userId) saveSearch(userId, locName, lat, lon).catch(() => {})
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const detectLocation = useCallback(async (userId) => {
    setLoading(true)
    setError(null)
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
      )
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      const locName = await reverseGeocode(lat, lon)
      await load(lat, lon, locName, userId)
    } catch {
      // Fallback to Ahmedabad
      await load(23.0225, 72.5714, 'Ahmedabad, Gujarat', userId)
    }
  }, [load])

  const searchAndLoad = useCallback(async (query, userId) => {
    setLoading(true)
    setError(null)
    try {
      const results = await searchCity(query)
      if (!results.length) throw new Error('City not found')
      const { latitude: lat, longitude: lon, name, country } = results[0]
      const locName = `${name}, ${country}`
      await load(lat, lon, locName, userId)
      return results
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }, [load])

  return { weather, location, coords, loading, error, load, detectLocation, searchAndLoad }
}
