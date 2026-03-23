import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This prevents multiple instances during Next.js Hot Reloads
const globalForSupabase = global as unknown as { supabase: ReturnType<typeof createClient> }

export const supabase = 
  globalForSupabase.supabase || 
  createClient(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

if (process.env.NODE_NODE !== 'production') globalForSupabase.supabase = supabase