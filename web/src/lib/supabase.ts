import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL')
}

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)