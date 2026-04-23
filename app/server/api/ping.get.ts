export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    ok:            true,
    hasGeminiKey:  !!(config.geminiApiKey),
    hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL),
  }
})
