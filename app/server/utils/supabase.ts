import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.STORAGE_SUPABASE_URL!
    const key = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY!
    _supabase = createClient(url, key)
  }
  return _supabase
}
