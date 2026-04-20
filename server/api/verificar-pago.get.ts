import { getRedis } from '../utils/redis'

export default defineEventHandler(async (event) => {
  const { session_id } = getQuery(event)

  if (!session_id || typeof session_id !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'session_id requerido.' })
  }

  const raw = await getRedis().get(`fintoc:session:${session_id}`)

  if (!raw) {
    return { found: false, status: null }
  }

  const data = JSON.parse(raw) as { status: string; timestamp: number }
  return { found: true, status: data.status }
})
