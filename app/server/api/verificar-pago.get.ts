import { getRedis } from '../utils/redis'

export default defineEventHandler(async (event) => {
  const { session_id } = getQuery(event)

  if (!session_id || typeof session_id !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'session_id requerido.' })
  }

  const data = await getRedis().get<{ status: string; timestamp: number }>(`fintoc:session:${session_id}`)

  if (!data) {
    return { found: false, status: null }
  }

  return { found: true, status: data.status }
})
