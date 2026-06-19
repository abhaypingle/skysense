// Dev: calls Anthropic directly via VITE_ANTHROPIC_KEY
// Prod: calls Supabase Edge Function (key stays server-side)
 
const DEV_KEY = import.meta.env.VITE_ANTHROPIC_KEY
const EDGE_FN = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-weather`
  : null
 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
 
export async function askAI(prompt, supabaseSession) {
  // In production use Edge Function (key is secure)
  if (EDGE_FN && !DEV_KEY) {
    try {
      const res = await fetch(EDGE_FN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseSession?.access_token || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ prompt })
      })
      if (!res.ok) {
        const errText = await res.text()
        console.error('Edge function error:', res.status, errText)
        return `AI error (${res.status}). Check console.`
      }
      const d = await res.json()
      if (d.error) {
        console.error('Edge function returned error:', d.error)
        return `AI error: ${d.error}`
      }
      return d.text || 'No response.'
    } catch (err) {
      console.error('AI fetch failed:', err)
      return 'AI request failed: ' + err.message
    }
  }
 
  // Dev fallback — direct Anthropic call
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DEV_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const d = await res.json()
  return d.content?.map(c => c.text || '').join('') || 'AI unavailable.'
}
 
export const PROMPTS = {
  insight: (ctx) =>
    `Smart weather assistant. Write 3 clear sentences: what today's weather means practically, how it will feel on the body, and the single most important action to take. Be specific, not generic.\n\n${ctx}`,
 
  weekOutlook: (ctx, weekSummary) =>
    `Given this 7-day forecast, write 3 sentences: best day(s) to go outdoors, day(s) to avoid or be cautious, and any notable weather pattern this week. Be direct.\n\nCurrent: ${ctx}\n\nWeek:\n${weekSummary}`,
 
  healthAdvice: (ctx) =>
    `Health-focused weather advice. Give exactly 4 bullet points (start each with •): UV/sun protection, hydration needs, air quality impact on breathing, exercise safety. Short and actionable.\n\n${ctx}`,
 
  modeAdvice: {
    general: (ctx) =>
      `Day planner. Give 5 bullet points (start each with •): best time to go out, what to wear/carry, hours to avoid outdoors, activity suggestion, evening forecast note. Practical.\n\n${ctx}`,
    student: (ctx) =>
      `Student day advice. 5 bullets (•): morning commute timing, umbrella/jacket decision, lunch break weather, afternoon study/outdoor verdict, evening return conditions.\n\n${ctx}`,
    farmer: (ctx) =>
      `Farmer crop advice. 5 bullets (•): irrigation timing today, best fieldwork windows, UV/heat risk for workers, rain impact on spraying or harvesting, soil/crop risk summary.\n\n${ctx}`,
    fitness: (ctx) =>
      `Fitness/workout advice. 5 bullets (•): best outdoor workout time window, heat and humidity impact on performance, hydration schedule, UV risk level, morning vs evening verdict.\n\n${ctx}`,
    traveler: (ctx) =>
      `Travel weather advice. 5 bullets (•): best departure time, weather during journey, what to pack for these conditions, road or travel risk assessment, overall travel safety rating.\n\n${ctx}`
  }
}