import { getRedis } from '../utils/redis'

export default defineEventHandler(async () => {
  try {
    const redis = getRedis()
    await redis.set('test:ping', 'pong', 'EX', 60)
    const value = await redis.get('test:ping')
    return { ok: true, value }
  } catch (err: unknown) {
    const e = err as { message?: string }
    return { ok: false, error: e.message || String(err) }
  }
})
