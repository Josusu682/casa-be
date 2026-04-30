import { getSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'No autorizado.' })

  const { data: { user }, error } = await getSupabase().auth.getUser(token)
  if (error || !user) throw createError({ statusCode: 401, statusMessage: 'Token inválido.' })

  const body = await readBody(event)
  const { display_name } = body

  if (typeof display_name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'display_name debe ser texto.' })
  }

  const sanitized = display_name.trim().slice(0, 80)

  const { error: updateError } = await (getSupabase().from('profiles') as any)
    .update({ display_name: sanitized })
    .eq('id', user.id)

  if (updateError) throw createError({ statusCode: 500, statusMessage: 'No se pudo actualizar el perfil.' })

  return { ok: true, display_name: sanitized }
})
