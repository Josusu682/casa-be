import { createHmac } from 'node:crypto'
import { getRedis } from '../utils/redis'
import { getSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const config    = useRuntimeConfig()
  const rawBody   = await readRawBody(event)
  const signature = getHeader(event, 'fintoc-signature')

  if (config.fintocWebhookSecret && signature && rawBody) {
    const parts: Record<string, string> = {}
    signature.split(',').forEach(part => {
      const [k, v] = part.split('=')
      if (k && v) parts[k] = v
    })

    if (!parts.t || !parts.v1) {
      throw createError({ statusCode: 401, statusMessage: 'Firma inválida.' })
    }

    const signedPayload = `${parts.t}.${rawBody}`
    const expectedSig   = createHmac('sha256', config.fintocWebhookSecret as string)
      .update(signedPayload)
      .digest('hex')

    if (parts.v1 !== expectedSig) {
      throw createError({ statusCode: 401, statusMessage: 'Firma inválida.' })
    }
  }

  let payload: Record<string, any>
  try {
    payload = JSON.parse(rawBody as string)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Payload inválido.' })
  }

  try {
    switch (payload.type) {

      case 'checkout_session.finished': {
        const sessionId = payload.data?.id
        const piStatus  = payload.data?.payment_intent?.status
        if (sessionId) {
          const status = piStatus === 'succeeded' ? 'succeeded' : (piStatus ?? 'finished')
          await getRedis().set(
            `fintoc:session:${sessionId}`,
            JSON.stringify({ status, timestamp: Date.now() }),
            'EX', 86400
          )
        }
        break
      }

      case 'payment_intent.succeeded': {
        const sessionId = payload.data?.checkout_session?.id
        if (sessionId) {
          await getRedis().set(
            `fintoc:session:${sessionId}`,
            JSON.stringify({ status: 'succeeded', timestamp: Date.now() }),
            'EX', 86400
          )
          const userId = await getRedis().get(`fintoc:user:${sessionId}`)
          await getSupabase().from('orders').upsert({
            session_id:   sessionId,
            user_id:      userId ?? null,
            amount:       payload.data?.amount ?? null,
            currency:     payload.data?.currency ?? 'clp',
            status:       'succeeded',
            fintoc_data:  payload.data ?? null,
          } as any, { onConflict: 'session_id' })
        }
        break
      }

      case 'payment_intent.rejected':
      case 'payment_intent.failed': {
        const sessionId = payload.data?.checkout_session?.id
        if (sessionId) {
          await getRedis().set(
            `fintoc:session:${sessionId}`,
            JSON.stringify({ status: 'failed', timestamp: Date.now() }),
            'EX', 86400
          )
          const userId = await getRedis().get(`fintoc:user:${sessionId}`)
          await getSupabase().from('orders').upsert({
            session_id:   sessionId,
            user_id:      userId ?? null,
            amount:       payload.data?.amount ?? null,
            currency:     payload.data?.currency ?? 'clp',
            status:       'failed',
            fintoc_data:  payload.data ?? null,
          } as any, { onConflict: 'session_id' })
        }
        break
      }

    }
  } catch (err) {
    console.error('[Webhook] Error procesando evento:', err)
  }

  return { received: true }
})
