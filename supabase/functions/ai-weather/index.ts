// supabase/functions/ai-weather/index.ts
// Deploy: supabase functions deploy ai-weather
// Set secret: supabase secrets set ANTHROPIC_KEY=your-key
 
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
 
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_KEY')
 
serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  }
 
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }
 
  try {
    const { prompt } = await req.json()
    if (!prompt) throw new Error('No prompt provided')
 
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    })
 
    const data = await res.json()
    const text = data.content?.map((c: any) => c.text || '').join('') || 'No response.'
 
    return new Response(JSON.stringify({ text }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers
    })
  }
})