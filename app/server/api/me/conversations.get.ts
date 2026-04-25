import { getSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  const { data: { user }, error } = await getSupabase().auth.getUser(token)
  if (error || !user) throw createError({ statusCode: 401 })

  const { data } = await getSupabase()
    .from('conversations')
    .select(`id, created_at, messages(content, role, created_at)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data ?? []).map((c: any) => {
    const firstUser = c.messages?.find((m: any) => m.role === 'user')
    return {
      id:         c.id,
      created_at: c.created_at,
      preview:    firstUser?.content?.slice(0, 60) ?? 'Conversación',
    }
  })
})
