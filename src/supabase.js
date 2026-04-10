import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://muarxrmbgelotcnjrpaa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11YXJ4cm1iZ2Vsb3RjbmpycGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Mzc1MjMsImV4cCI6MjA5MDQxMzUyM30.s3bzax2PFhBadueMT6kgiwb4vRSEr0VfiUIM6sj1UfU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)