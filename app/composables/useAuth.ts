export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const user = useState<any>('auth.user')
  const role = useState<string>('auth.role')
  const isAdmin = computed(() => role.value === 'admin')

  const login = async (email: string, password: string) => {
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const register = async (email: string, password: string) => {
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl as string) || 'https://casa-be.cl'
    const { error } = await $supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl}/login` },
    })
    if (error) throw error
  }

  const logout = async () => {
    await $supabase.auth.signOut()
  }

  const getToken = async (): Promise<string | null> => {
    const { data: { session } } = await $supabase.auth.getSession()
    return session?.access_token ?? null
  }

  return { user, role, isAdmin, login, register, logout, getToken }
}
