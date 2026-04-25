import { getSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  const { data: { user }, error } = await getSupabase().auth.getUser(token)
  if (error || !user) throw createError({ statusCode: 401 })

  const id = getRouterParam(event, 'id') ?? ''
  if (!id) throw createError({ statusCode: 400 })

  const { data: conv } = await getSupabase()
    .from('conversations')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!conv || (conv as any).user_id !== user.id)
    throw createError({ statusCode: 404 })

  const { data: msgs } = await getSupabase()
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  return msgs ?? []
})
