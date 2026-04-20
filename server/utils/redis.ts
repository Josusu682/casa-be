import Redis from 'ioredis'

let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: false,
    })
  }
  return _redis
}
