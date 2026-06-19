import { useRef, useEffect } from 'react'

/**
 * Renders a full-screen canvas with weather-reactive particles:
 * - rain: falling streaks with slight perspective/wind
 * - snow: drifting flakes with sway
 * - clear/sunny: soft floating light rays + dust motes
 * - cloudy: slow drifting soft cloud blobs
 * - storm: heavy rain + occasional lightning flash
 */
export default function WeatherFX({ weathercode = 0, intensity = 1 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  function getMode(code) {
    if ([95,96,99].includes(code)) return 'storm'
    if ([61,63,65,80,81,82,51,53,55].includes(code)) return 'rain'
    if ([71,73,75].includes(code)) return 'snow'
    if ([45,48].includes(code)) return 'fog'
    if ([2,3].includes(code)) return 'cloudy'
    return 'clear'
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let lightning = 0
    const mode = getMode(weathercode)

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function initParticles() {
      particles = []
      const W = canvas.width, H = canvas.height
      if (mode === 'rain' || mode === 'storm') {
        const count = mode === 'storm' ? 140 : 90
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            len: 14 + Math.random() * 18,
            speed: 8 + Math.random() * 8,
            drift: 1.5 + Math.random() * 1,
            opacity: 0.15 + Math.random() * 0.25
          })
        }
      } else if (mode === 'snow') {
        for (let i = 0; i < 70; i++) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 1.5 + Math.random() * 2.5,
            speed: 0.5 + Math.random() * 1.2,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.01 + Math.random() * 0.02,
            opacity: 0.3 + Math.random() * 0.4
          })
        }
      } else if (mode === 'clear') {
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 0.8 + Math.random() * 1.8,
            speed: 0.15 + Math.random() * 0.3,
            opacity: 0.1 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2
          })
        }
      } else if (mode === 'cloudy' || mode === 'fog') {
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H * 0.6,
            r: 120 + Math.random() * 180,
            speed: 0.08 + Math.random() * 0.12,
            opacity: 0.03 + Math.random() * 0.04
          })
        }
      }
    }
    initParticles()

    function draw() {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      if (mode === 'storm') {
        lightning -= 1
        if (Math.random() < 0.004 && lightning <= 0) lightning = 6
        if (lightning > 0) {
          ctx.fillStyle = `rgba(255,255,255,${lightning * 0.025})`
          ctx.fillRect(0, 0, W, H)
        }
      }

      if (mode === 'rain' || mode === 'storm') {
        ctx.strokeStyle = mode === 'storm' ? 'rgba(180,210,255,' : 'rgba(160,200,255,'
        ctx.lineWidth = 1.2
        particles.forEach(p => {
          ctx.beginPath()
          ctx.globalAlpha = p.opacity
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.drift * 3, p.y + p.len)
          ctx.strokeStyle = `rgba(160,200,255,${p.opacity})`
          ctx.stroke()
          p.y += p.speed
          p.x -= p.drift
          if (p.y > H) { p.y = -20; p.x = Math.random() * W }
          if (p.x < -20) p.x = W + 20
        })
        ctx.globalAlpha = 1
      } else if (mode === 'snow') {
        particles.forEach(p => {
          p.sway += p.swaySpeed
          p.x += Math.sin(p.sway) * 0.6
          p.y += p.speed
          if (p.y > H) { p.y = -10; p.x = Math.random() * W }
          ctx.beginPath()
          ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        })
      } else if (mode === 'clear') {
        particles.forEach(p => {
          p.phase += 0.01
          const flicker = 0.6 + Math.sin(p.phase) * 0.4
          p.y -= p.speed
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W }
          ctx.beginPath()
          ctx.fillStyle = `rgba(250,220,140,${p.opacity * flicker})`
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        })
      } else if (mode === 'cloudy' || mode === 'fog') {
        particles.forEach(p => {
          p.x += p.speed
          if (p.x - p.r > W) p.x = -p.r
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
          grad.addColorStop(0, `rgba(255,255,255,${p.opacity})`)
          grad.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [weathercode])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', opacity: 0.85
      }}
    />
  )
}
