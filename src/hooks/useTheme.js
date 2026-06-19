import { useState, useEffect, useCallback } from 'react'
 
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('skysense-theme') || 'dark' } catch { return 'dark' }
  })
 
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('skysense-theme', theme) } catch {}
  }, [theme])
 
  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])
 
  return { theme, toggleTheme }
}