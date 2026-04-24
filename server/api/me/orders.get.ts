import { getSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) throw createError({ statusCode: 401, statusMessage: 'No autorizado.' })

  const { data: { user }, error } = await getSupabase().auth.getUser(token)
  if (error || !user) throw createError({ statusCode: 401, statusMessage: 'Token inválido.' })

  const { data, error: dbError } = await getSupabase()
    .from('orders')
    .select('id, session_id, product_name, amount, currency, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (dbError) throw createError({ statusCode: 500 })
  return data ?? []
})
