export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const sb = $supabase as any
  const user = useState<any>('auth.user', () => null)
  const role = useState<string>('auth.role', () => 'customer')
  const isAdmin = computed(() => role.value === 'admin')

  const login = async (email: string, password: string) => {
    if (!sb) return
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const register = async (email: string, password: string) => {
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl as string) || 'https://casa-be.cl'
    if (!sb) return
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl}/login` },
    })
    if (error) throw error
  }

  const logout = async () => {
    if (!sb) return
    await sb.auth.signOut()
  }

  const getToken = async (): Promise<string | null> => {
    if (!sb) return null
    const { data: { session } } = await sb.auth.getSession()
    return session?.access_token ?? null
  }

  return { user, role, isAdmin, login, register, logout, getToken }
}
