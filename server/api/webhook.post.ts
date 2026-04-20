import { createHmac } from 'node:crypto'
import { getRedis } from '../utils/redis'

export default defineEventHandler(async (event) => {
  const config    = useRuntimeConfig()
  const rawBody   = await readRawBody(event)
  const signature = getHeader(event, 'fintoc-signature')

  // ── Verificación de firma ──────────────────────────────────────────────────
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

  // ── Parsear evento ─────────────────────────────────────────────────────────
  let payload: Record<string, any>
  try {
    payload = JSON.parse(rawBody as string)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Payload inválido.' })
  }

  // ── Manejar eventos ────────────────────────────────────────────────────────
  console.log('[Webhook] tipo:', payload.type, '| data:', JSON.stringify(payload.data))
  try {
    switch (payload.type) {

      case 'checkout_session.finished': {
        const sessionId = payload.data?.id
        const piStatus  = payload.data?.payment_resource?.payment_intent?.status
        if (sessionId) {
          const status = piStatus === 'succeeded' ? 'succeeded' : (piStatus ?? 'finished')
          await getRedis().set(
            `fintoc:session:${sessionId}`,
            JSON.stringify({ status, timestamp: Date.now() }),
            { ex: 86400 }
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
            { ex: 86400 }
          )
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
            { ex: 86400 }
          )
        }
        break
      }

    }
  } catch (err) {
    console.error('[Webhook] Error guardando en Redis:', err)
  }

  return { received: true }
})
