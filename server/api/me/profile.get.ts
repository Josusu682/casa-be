import { getSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'No autorizado.' })

  const { data: { user }, error } = await getSupabase().auth.getUser(token)
  if (error || !user) throw createError({ statusCode: 401, statusMessage: 'Token inválido.' })

  const { data: profileRow } = await getSupabase()
    .from('profiles')
    .select('id, role, display_name, updated_at')
    .eq('id', user.id)
    .single() as any
  const profile = profileRow as { role?: string; display_name?: string; updated_at?: string } | null

  return {
    id:           user.id,
    email:        user.email,
    created_at:   user.created_at,
    role:         profile?.role        ?? 'customer',
    display_name: profile?.display_name ?? null,
    updated_at:   profile?.updated_at  ?? null,
  }
})
