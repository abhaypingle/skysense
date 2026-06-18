# SkySense — AI Smart Weather Platform

> AI-powered hyper-local weather. Smarter than Google Weather.

## Stack
- **Frontend**: React + Vite + PWA (installable)
- **Auth & DB**: Supabase
- **AI**: Claude by Anthropic (via Supabase Edge Function in prod)
- **Weather**: Open-Meteo (free, no key needed)
- **Hosting**: Vercel

---

## Local Development

```bash
# 1. Clone / extract project
cd skysense

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local
# Fill in your Supabase + Anthropic keys

# 4. Run dev server
npm run dev
# → http://localhost:5173
```

---

## Supabase Setup (5 min)

1. Go to https://supabase.com → New project
2. Copy your **Project URL** and **anon key** → paste into `.env.local`
3. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → Run
4. Go to **Authentication → Settings** → Enable Email auth
5. Done ✅

---

## Deploy Edge Function (Secure AI)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Set Anthropic key as secret (never in .env for prod!)
supabase secrets set ANTHROPIC_KEY=sk-ant-...

# Deploy function
supabase functions deploy ai-weather
```

---

## Deploy to Vercel (2 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_SUPABASE_URL = https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY = your-anon-key
# (Do NOT add VITE_ANTHROPIC_KEY in prod — use Edge Function instead)
```

Or connect GitHub repo → Vercel auto-deploys on push.

---

## Features

| Feature | Status |
|---------|--------|
| GPS hyper-local weather | ✅ |
| City search | ✅ |
| AI weather insight | ✅ |
| Hourly 14-hour forecast | ✅ |
| 7-day forecast | ✅ |
| Smart recommendations | ✅ |
| AI day planner (5 modes) | ✅ |
| Health & vitals dashboard | ✅ |
| Weather alerts | ✅ |
| Auth (sign up / sign in) | ✅ |
| Save favourite locations | ✅ |
| Search history (DB) | ✅ |
| PWA (installable app) | ✅ |
| Supabase Edge Function | ✅ |

---

## Project Structure

```
skysense/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          ← Search + auth nav
│   │   ├── HeroCard.jsx        ← Main temp display
│   │   └── WeatherWidgets.jsx  ← Hourly, forecast, vitals, recs
│   ├── pages/
│   │   ├── WeatherPage.jsx     ← Main page (all tabs)
│   │   ├── AuthPage.jsx        ← Sign in / sign up
│   │   ├── FavouritesPage.jsx  ← Saved locations
│   │   └── SettingsPage.jsx    ← Account settings
│   ├── hooks/
│   │   ├── useWeather.js       ← Weather state + fetch
│   │   └── useAuth.js          ← Supabase auth state
│   ├── lib/
│   │   ├── supabase.js         ← DB helpers
│   │   ├── weather.js          ← Open-Meteo API
│   │   └── ai.js               ← Claude AI prompts
│   └── styles/
│       └── global.css          ← Aurora dark theme
├── supabase/
│   └── functions/ai-weather/   ← Edge Function (secure AI)
├── supabase-schema.sql         ← Run in Supabase SQL Editor
├── vercel.json                 ← Vercel config
└── .env.example                ← Env template
```
