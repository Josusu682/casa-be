import { kv } from '@vercel/kv'

export function getRedis() {
  return kv
}
