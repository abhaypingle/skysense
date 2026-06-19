import { createClient } from '@supabase/supabase-js'
 
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
 
// ── Auth ──────────────────────────────────────────────────────
export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })
 
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })
 
// OTP verification (6-digit code from email)
export const verifyOtp = (email, token) =>
  supabase.auth.verifyOtp({ email, token, type: 'signup' })
 
export const resendOtp = (email) =>
  supabase.auth.resend({ type: 'signup', email })
 
export const signOut = () => supabase.auth.signOut()
 
export const getUser = () => supabase.auth.getUser()
 
// ── Search history ────────────────────────────────────────────
export const saveSearch = async (userId, location, lat, lon) =>
  supabase.from('search_history').insert({
    user_id: userId, location_name: location, lat, lon,
    searched_at: new Date().toISOString()
  })
 
export const getHistory = async (userId) =>
  supabase.from('search_history').select('*')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(10)
 
// ── Favourites ────────────────────────────────────────────────
export const saveFavourite = async (userId, location, lat, lon) =>
  supabase.from('favourites').upsert(
    { user_id: userId, location_name: location, lat, lon },
    { onConflict: 'user_id,location_name' }
  )
 
export const getFavourites = async (userId) =>
  supabase.from('favourites').select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
 
export const deleteFavourite = async (id) =>
  supabase.from('favourites').delete().eq('id', id)
 
// ── User preferences ──────────────────────────────────────────
export const savePrefs = async (userId, prefs) =>
  supabase.from('user_prefs').upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
 
export const getPrefs = async (userId) =>
  supabase.from('user_prefs').select('*').eq('user_id', userId).single()