export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey as string
  if (!apiKey) return { error: 'No API key' }

  const res  = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
  const json = await res.json()
  return json
})
