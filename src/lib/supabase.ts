import { createClient } from '@supabase/supabase-js'

// Questi dati li prenderemo dalla dashboard di Supabase.
// Per ora mettiamo dei placeholder affinché l'app non si rompa.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vgzugqklrmkldacsjpch.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b4mS-9kfwLs90Usilg-Ucg_TzCn8xnT'

export const supabase = createClient(supabaseUrl, supabaseKey)