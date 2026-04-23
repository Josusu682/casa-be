import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string
  )

  const user = useState<any>('auth.user', () => null)
  const role = useState<string>('auth.role', () => 'customer')

  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user ?? null

  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    if (data) role.value = data.role
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      role.value = data?.role ?? 'customer'
    } else {
      role.value = 'customer'
    }
  })

  return {
    provide: { supabase },
  }
})
