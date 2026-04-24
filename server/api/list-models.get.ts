export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey as string
  if (!apiKey) return { error: 'No API key' }

  const [v1, v1beta] = await Promise.all([
    fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`).then(r => r.json()),
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`).then(r => r.json()),
  ])

  const v1Names    = (v1.models    ?? []).map((m: any) => m.name)
  const betaNames  = (v1beta.models ?? []).map((m: any) => m.name)
  const onlyInBeta = betaNames.filter((n: string) => !v1Names.includes(n))

  return { v1: v1Names, v1beta: betaNames, onlyInBeta }
})
