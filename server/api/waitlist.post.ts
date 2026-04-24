import { getSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido.' })
  }

  const { error } = await getSupabase()
    .from('waitlist')
    .insert({ email: email.toLowerCase().trim() } as any)

  if (error) {
    if (error.code === '23505') {
      return { ok: true, already: true }
    }
    console.error('[Waitlist] Error guardando email:', error)
    throw createError({ statusCode: 500, statusMessage: 'No se pudo registrar el email.' })
  }

  return { ok: true, already: false }
})
