import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gxvlkkzpaencvhfhogpr.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dmxra3pwYWVuY3ZoZmhvZ3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODY0MzUsImV4cCI6MjA1OTE2MjQzNX0.Z-GImKQONWyytF8VIxcCETeXUtUFszERCbUw4W02bCk'

export const supabase = createClient(supabaseUrl, supabaseKey) 