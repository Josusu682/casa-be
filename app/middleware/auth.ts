export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  const { user } = useAuth()
  if (!user.value) return navigateTo('/login')
})
