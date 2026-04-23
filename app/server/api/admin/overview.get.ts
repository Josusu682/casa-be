import { getSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) throw createError({ statusCode: 401, statusMessage: 'No autorizado.' })

  const { data: { user }, error } = await getSupabase().auth.getUser(token)
  if (error || !user) throw createError({ statusCode: 401, statusMessage: 'Token inválido.' })

  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acceso denegado.' })
  }

  const [ordersResult, waitlistResult] = await Promise.all([
    getSupabase()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }),
    getSupabase()
      .from('waitlist')
      .select('id, email, created_at')
      .order('created_at', { ascending: false }),
  ])

  return {
    orders:   ordersResult.data   ?? [],
    waitlist: waitlistResult.data ?? [],
  }
})
